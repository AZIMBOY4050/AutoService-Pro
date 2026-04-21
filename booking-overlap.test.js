import assert from "node:assert/strict";
import test from "node:test";

import { overlapsRange } from "../server/utils/helpers.js";

test("overlapsRange blocks intersecting booking times", () => {
  assert.equal(overlapsRange("10:00", 60, "10:30", 45), true);
  assert.equal(overlapsRange("10:00", 60, "11:00", 30), false);
});
