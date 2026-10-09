import { Elysia } from "elysia";

import {
  createLoginRoutes,
  type LoginRouteDependencies,
} from "./login/login.routes.ts";
import {
  createRegisterRoutes,
  type RegisterRouteDependencies,
} from "./register/register.routes.ts";

export type AuthRouteDependencies =
  LoginRouteDependencies & RegisterRouteDependencies;

export function createAuthRoutes(
  dependencies: Partial<AuthRouteDependencies> = {},
) {
  return new Elysia({ name: "module.auth" })
    .use(createRegisterRoutes(dependencies))
    .use(createLoginRoutes(dependencies));
}

export const authRoutes = createAuthRoutes();
