import { TimeEntry, TimeResult } from "./time";

import { Folder } from "./folder";
import { List } from "./list";
import { Space } from "./space";
import { Task } from "./task";

type Status = {
  status: string;
  type: string;
  orderindex: number;
  color: string;
};

type User = {
  id: string;
  username: string;
  color: string | null;
  profilePicture: string;
  initials: string;
};

type CustomField = {
  id: string;
  name: string;
  type: string;
  value: any;
  date_created: string;
  hide_from_guests: boolean;
  required: boolean;
};

type Priority = {
  priority: string;
  color: string;
};

type Tag = {
  name: string;
  tag_fg: string;
  tag_bg: string;
  creator: number;
};

type APIResult<
  T extends
    | Space
    | Space[]
    | Folder
    | Folder[]
    | Task
    | Task[]
    | List
    | List[]
    | TimeEntry
    | TimeEntry[]
> = T extends Folder[]
  ? { folders: Folder[] }
  : T extends List[]
  ? { lists: List[] }
  : T extends Space[]
  ? { spaces: Space[] }
  : T extends Task[]
  ? { tasks: Task[] }
  : T extends TimeEntry[]
  ? TimeResult
  : T;

type TeamData = {
  folder: string | null;
  list: string | null;
  space: string | null;
} & Partial<Task>;

export {
  Status,
  User,
  CustomField,
  Priority,
  APIResult,
  Folder,
  Space,
  List,
  Task,
  Tag,
  TimeEntry,
  TimeResult,
  TeamData,
};
