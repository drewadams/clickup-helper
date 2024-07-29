import { Tag, Task, User } from "types";

export type TimeEntry = {
  id: string;
  task: Pick<Task, "id" | "name" | "status"> & { custom_type: string | null };
  wid: string;
  user: Partial<User>;
  billable: boolean;
  start: string;
  end: string;
  duration: string;
  description: string;
  tags?: unknown[];
  source: string;
  at: string;
  task_location: {
    list_id: number;
    folder_id: number;
    space_id: number;
    list_name?: string;
    folder_name?: string;
    space_name?: string;
  };
  task_tags: Tag[];
  task_url: string;
};

export type TimeResult = {
  data: TimeEntry[];
};
