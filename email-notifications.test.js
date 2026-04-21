import assert from "node:assert/strict";
import test from "node:test";

import { buildBookingCompletedEmailMessage } from "../server/services/emailService.js";

test("buildBookingCompletedEmailMessage includes booking reference and customer details", () => {
  const message = buildBookingCompletedEmailMessage({
    id: 12,
    referenceCode: "BK-000012",
    customerName: "Azimjon Komiljonov",
    customerEmail: "azim@example.com",
    serviceTitle: "Brake Pad Replacement",
    vehicleName: "BMW M5",
    licensePlate: "90A777AA",
    bookingDate: "2026-04-20",
    bookingTime: "14:00",
    totalPrice: 730000,
    productsTotal: 280000,
  });

  assert.match(message.subject, /BK-000012/);
  assert.match(message.text, /Azimjon Komiljonov/);
  assert.match(message.text, /Brake Pad Replacement/);
  assert.match(message.html, /BMW M5/);
});
