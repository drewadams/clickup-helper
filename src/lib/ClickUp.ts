import { Folder, List, Space, Task, TeamData } from "../types";

import BaseService from "./BaseService";

/**
 * ClickupTaskService class to interact with Clickup API. Requires an API key to be provided or in `.env` file.
 *
 * @export
 * @class ClickupTaskService
 */

export interface HelperReturnTypes {
  spaces: Space[];
  folders: Folder[];
  lists: List[];
  tasks: Task[];
  space: Space;
  folder: Folder;
  list: List;
  task: Task;
}

export interface FetchOptions {
  method: string;
  body?: string;
  headers?: HeadersInit;
  rateLimit?: number;
}

export default class ClickUpHelper extends BaseService {
  constructor(apiKey: string) {
    super(apiKey);
  }

  /* VALIDATION METHODS */

  isValidSpace(object: any): object is Space {
    return "id" in object && "name" in object && "statuses" in object;
  }

  isValidFolder(object: any): object is Folder {
    return (
      "id" in object &&
      "name" in object &&
      "space" in object &&
      "task_count" in object
    );
  }

  isValidList(object: any): object is List {
    return "id" in object && "name" in object;
  }

  isValidTask(object: any): object is Task {
    return "id" in object && "name" in object && "date_created" in object;
  }

  /* API METHODS */

  /**
   * Get a singular space from Clickup API.
   */
  async getSpace(
    spaceID: string,
    query?: URLSearchParams,
    options?: FetchOptions
  ): Promise<Space | null> {
    try {
      const space = await this.getFromAPI<Space>(
        `/space/${spaceID}${query ? `?${query}` : ""}`,
        this.isValidSpace,
        options
      );
      if (!space) {
        throw new Error("Failed to get space");
      }
      return space as Space;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Get all spaces from a team.
   */
  async getAllSpaces(
    teamID: string,
    query?: URLSearchParams,
    options?: FetchOptions
  ): Promise<Space[] | null> {
    try {
      const url = `/team/${teamID}/space${query ? `?${query}` : ""}`;
      const spaces = await this.getFromAPI<Space>(
        url,
        this.isValidSpace,
        options
      );
      if (!spaces) {
        throw new Error("Failed to get spaces");
      }
      return spaces as Space[];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Get all folders from a space.
   */
  async getFoldersFromSpace(
    spaceID: string,
    options?: {
      query?: URLSearchParams;
      fetchOptions?: FetchOptions;
    }
  ): Promise<Folder[] | null> {
    try {
      const url = `/space/${spaceID}/folder?${options?.query ?? ""}`;
      const folders = await this.getFromAPI<Folder>(
        url,
        this.isValidFolder,
        options?.fetchOptions
      );
      if (!folders) {
        throw new Error("Failed to get folders");
      }
      return folders as Folder[];
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw error;
      }
      return null;
    }
  }

  async getListsFromFolder(
    folderID: string,
    options?: FetchOptions
  ): Promise<List[] | null> {
    try {
      const url = `/folder/${folderID}/list`;
      const lists = await this.getFromAPI<List>(url, this.isValidList, options);
      if (!lists) {
        throw new Error("Failed to get lists");
      }
      return lists as List[];
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw error;
      }
      return null;
    }
  }

  async getTasksFromList(
    listID: string,
    options?: {
      query?: URLSearchParams;
      fetchOptions?: FetchOptions;
    }
  ): Promise<Task[] | null> {
    try {
      const url = `/list/${listID}/task${
        options?.query ? `?${options.query}` : ""
      }`;
      const tasks = await this.getFromAPI(
        url,
        this.isValidTask,
        options?.fetchOptions
      );
      if (!tasks) {
        throw new Error("Failed to get tasks");
      }
      return tasks as Task[];
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Fetch all tasks from Clickup API for the team.
   */
  async getTeamData({
    data,
    type,
    queries,
  }:
    | {
        queries?: {
          space?: URLSearchParams;
          task?: URLSearchParams;
        };
      } & (
        | {
            data: string[];
            type: "space";
          }
        | {
            data: string;
            type: "team";
          }
      )): Promise<TeamData[] | null> {
    try {
      const spaces =
        type === "space"
          ? await Promise.all(
              data.map(
                async (id) => await this.getSpace(id as string, queries?.space)
              )
            )
          : await this.getAllSpaces(data as string, queries?.space);

      if (!spaces) {
        throw new Error("Failed to get spaces");
      }

      const filteredSpaces = spaces
        .filter((space) => space !== null)
        .map(({ id, name }) => {
          return { id, name };
        });

      return await this.getAllTasksFromSpaces(filteredSpaces, {
        task: queries?.task,
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getAllTasksFromSpaces(
    spaces: { id: string; name: string }[],
    queries?: {
      folder?: URLSearchParams;
      task?: URLSearchParams;
    }
  ): Promise<TeamData[] | null> {
    try {
      const spacesWithFolders = (
        await Promise.all(
          spaces.map(async ({ name, id }) => {
            return {
              [name]: (await this.getFoldersFromSpace(id, {
                query: queries?.folder,
              })) as Folder[],
            };
          })
        )
      )
        .filter((folder) => folder !== null)
        .reduce((acc, curr) => {
          return { ...acc, ...curr };
        }, {});

      let finalData: TeamData[] = [];
      for (const [spaceName, folderList] of Object.entries(spacesWithFolders)) {
        for (const folder of folderList) {
          const lists = await this.getListsFromFolder(folder.id);
          if (!lists) {
            throw new Error("Failed to get lists");
          }
          for (const list of lists) {
            const tasks = (
              await this.getTasksFromList(list.id, {
                query: queries?.task,
              })
            )?.map((task) => {
              return {
                ...task,
                folder: folder.name,
                list: list.name,
                space: spaceName,
              };
            });

            if (!tasks) {
              throw new Error("Failed to get tasks");
            }
            finalData.push(...(tasks as TeamData[]));
          }
        }
      }
      return finalData;
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw error;
      }
      return null;
    }
  }
}
