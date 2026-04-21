import assert from "node:assert/strict";
import test from "node:test";

import { authenticateUser } from "../server/services/authService.js";

test("authenticateUser returns a session payload for valid credentials", async () => {
  const result = await authenticateUser(
    {
      email: "admin@autoservice.local",
      password: "ValidPass123",
    },
    {
      findUserByEmailImpl: async () => ({
        id: 1,
        full_name: "System Administrator",
        email: "admin@autoservice.local",
        phone: "+998900000000",
        role: "admin",
        password_hash: "hashed",
      }),
      comparePassword: async () => true,
      signToken: () => "signed-token",
    },
  );

  assert.equal(result.token, "signed-token");
  assert.equal(result.user.role, "admin");
  assert.equal(result.user.email, "admin@autoservice.local");
});

test("authenticateUser rejects invalid credentials", async () => {
  await assert.rejects(
    () =>
      authenticateUser(
        {
          email: "admin@autoservice.local",
          password: "WrongPass123",
        },
        {
          findUserByEmailImpl: async () => ({
            id: 1,
            full_name: "System Administrator",
            email: "admin@autoservice.local",
            phone: "+998900000000",
            role: "admin",
            password_hash: "hashed",
          }),
          comparePassword: async () => false,
          signToken: () => "signed-token",
        },
      ),
    {
      message: "Invalid email or password",
      name: "AppError",
    },
  );
});
