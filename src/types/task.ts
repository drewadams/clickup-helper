import { CustomField, Status, User } from ".";

export interface Task {
  id: string;
  custom_item_id: string | null;
  name: string;
  status: Status;
  markdown_description: string;
  orderindex: string;
  date_created: string;
  date_updated: string | null;
  date_closed: string | null;
  date_done: string | null;
  creator: User;
  assignees: User[];
  watchers: User[];
  checklists: unknown[];
  tags: unknown[];
  parent: any;
  priority: any;
  due_date: string | null;
  start_date: string | null;
  points: number | null;
  time_estimate: string | null;
  time_spent: string | null;
  custom_fields: CustomField[];
  list: { id: string };
  folder: { id: string };
  space: { id: string };
  url: string;
}
