import { Status, User } from ".";

export type Member = {
  user: User;
};

export interface Space {
  id: string;
  name: string;
  private: boolean;
  color: string | null;
  avatar: string;
  admin_can_manage: boolean;
  archived: boolean;
  members: Member[];
  statuses: Status[];
  multiple_assignees: boolean;
  features: Object;
}
