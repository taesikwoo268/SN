import { sqlClient } from "./client.ts";

try {
  const result = await sqlClient`
    SELECT
      current_database() AS database_name,
      current_user AS database_user,
      current_timestamp AS database_time,
      version() AS postgres_version
  `;

  console.log("PostgreSQL connection successful");
  console.log(result[0]);
} catch (error: unknown) {
  console.error("PostgreSQL connection failed");

  if (error instanceof Error) {
    console.error(error.message);
  }

  process.exitCode = 1;
} finally {
  await sqlClient.close();
}