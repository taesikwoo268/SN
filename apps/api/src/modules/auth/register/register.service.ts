import { hashPassword } from "../password.ts";
import { createAccount } from "./register.repository.ts";
import type { RegisterData } from "./register.schema.ts";

export async function registerUser(data: RegisterData) {
  const passwordHash = await hashPassword(data.password);

  return createAccount({
    email: data.email,
    username: data.username,
    displayName: data.displayName,
    passwordHash,
  });
}
