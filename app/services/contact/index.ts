export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export function normalizeContactMessage(
  input: ContactMessageInput
): ContactMessageInput {
  return {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    message: input.message.trim(),
  };
}
