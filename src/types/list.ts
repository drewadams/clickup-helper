import { Priority, Status } from ".";

export interface List {
  id: string;
  name: string;
  orderindex: number;
  content: string;
  status: Status;
  priority: Priority;
}
