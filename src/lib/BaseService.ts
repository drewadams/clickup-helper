import {
  APIResult,
  Folder,
  List,
  Space,
  Task,
  TimeEntry,
  TimeResult,
} from "types";

export interface FetchOptions {
  method: string;
  body?: string;
  headers?: HeadersInit;
}

export default class BaseService {
  baseUrl: string;
  private apiKey: string;
  constructor(apiKey: string) {
    this.baseUrl = "https://api.clickup.com/api/v2";
    this.apiKey = apiKey;
    if (!this.apiKey) {
      throw new Error("No Clickup API key provided");
    }
  }

  /* FETCH METHODS */

  /**
   * Fetch data from Clickup API
   */
  async fetch(
    endpoint: string,
    { method, body, headers }: FetchOptions = {
      method: "GET",
    }
  ) {
    const resp = await fetch(this.baseUrl + endpoint, {
      method: method,
      headers: {
        Authorization: this.apiKey,
        "Content-Type": "application/json",
        ...headers,
      },
      body: body,
    });

    return resp;
  }

  async getFromAPI<T extends Space | Task | Folder | List | TimeEntry>(
    endpoint: string,
    validation: (object: any) => boolean,
    options?: FetchOptions
  ): Promise<T | T[] | TimeResult | null> {
    try {
      const res = await this.fetch(endpoint, options);
      if (!res.ok) {
        throw new Error(
          `Failed to get data from Clickup API for: ${
            this.baseUrl + endpoint
          }. Status: ${res.status}`
        );
      }
      const json = (await res.json()) as APIResult<T>;
      const data = Object.keys(json)[0] as keyof APIResult<T>;

      // Check to see if the data is an array
      if (data && json[data] && Array.isArray(json[data])) {
        // Check if all elements in the array are valid
        if (!json[data].every(validation)) {
          console.log(json[data]);
          throw new Error("Invalid JSON structure for: " + endpoint);
        }
        return json[data] as T[];
      }
      if (!json || !validation(json)) {
        console.log(json);
        throw new Error("Invalid JSON structure for: " + endpoint);
      }
      return json as T;
    } catch (error) {
      // TODO: Handle specific errors
      console.error(error);

      return null;
    }
  }
}
