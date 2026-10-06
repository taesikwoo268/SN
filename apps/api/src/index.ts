import { app } from "./app.ts";
import { env } from "./config/env.ts";

app.listen({
  hostname: env.HOST,
  port: env.PORT,
});

console.log(`API is running at http://${env.HOST}:${env.PORT}`);