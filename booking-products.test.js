import assert from "node:assert/strict";
import test from "node:test";

import { mapBooking } from "../server/utils/helpers.js";

test("mapBooking includes attached products and total booking price", () => {
  const booking = mapBooking({
    id: 7,
    user_id: 2,
    vehicle_id: 4,
    service_id: 1,
    booking_date: "2026-04-18",
    booking_time: "11:30:00",
    status: "confirmed",
    notes: null,
    duration_minutes: 45,
    price: 250000,
    service_title: "Oil & Filter Change",
    customer_name: "Azimjon Komiljonov",
    customer_email: "azim@example.com",
    customer_phone: "+998900000001",
    vehicle_brand: "BMW",
    vehicle_model: "M5",
    license_plate: "01A123BC",
    products_json: [
      {
        id: 1,
        productId: 5,
        title: "Oil Filter",
        sku: "FLT-OIL-01",
        unitLabel: "pcs",
        quantity: 2,
        unitPrice: 45000,
        totalPrice: 90000,
      },
    ],
    products_total: 90000,
  });

  assert.equal(booking.products.length, 1);
  assert.equal(booking.products[0].productId, 5);
  assert.equal(booking.products[0].quantity, 2);
  assert.equal(booking.servicePrice, 250000);
  assert.equal(booking.productsTotal, 90000);
  assert.equal(booking.totalPrice, 340000);
});
