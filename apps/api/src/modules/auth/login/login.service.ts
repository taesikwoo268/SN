import { InvalidCredentialsError } from "../../../shared/http/api-error.ts";
import { verifyPassword } from "../password.ts";
import { findLoginRecordByEmail } from "./login.repository.ts";
import type { LoginData } from "./login.schema.ts";

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$RW3XbVJXIWM+covqyOsKYI34/mzzNqNiQ5e9j4wqf30$dUgJLIBEXhx7z/fpvubpDnJwUncKMVZwXOGnojkaZ7c";

export async function authenticateUser(data: LoginData) {
  const loginRecord = await findLoginRecordByEmail(data.email);
  const passwordHash = loginRecord?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await verifyPassword(data.password, passwordHash);

  if (!loginRecord || !passwordMatches) throw new InvalidCredentialsError();

  return {
    id: loginRecord.userId,
    username: loginRecord.username,
    displayName: loginRecord.displayName,
  };
}
