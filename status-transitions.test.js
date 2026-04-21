import assert from "node:assert/strict";
import test from "node:test";

import { canTransitionBookingStatus } from "../server/utils/helpers.js";

test("booking status transitions allow only logical next steps", () => {
  assert.equal(canTransitionBookingStatus("pending", "confirmed"), true);
  assert.equal(canTransitionBookingStatus("pending", "completed"), false);
  assert.equal(canTransitionBookingStatus("cancelled", "completed"), false);
  assert.equal(canTransitionBookingStatus("in_progress", "completed"), true);
});
