import type { ID } from "@/app/types";

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessage extends ContactMessageInput {
  id: ID;
  created_at?: string;
  updated_at?: string;
}
