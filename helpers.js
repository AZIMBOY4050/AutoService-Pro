import { AppError } from "./appError.js";

export const ROLES = Object.freeze({
  customer: "customer",
  admin: "admin",
});

export const BOOKING_STATUSES = Object.freeze([
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "rejected",
]);

export const ACTIVE_BOOKING_STATUSES = Object.freeze(["pending", "confirmed", "in_progress"]);

export const ALLOWED_BOOKING_STATUS_TRANSITIONS = Object.freeze({
  pending: Object.freeze(["confirmed", "cancelled", "rejected"]),
  confirmed: Object.freeze(["in_progress", "cancelled"]),
  in_progress: Object.freeze(["completed"]),
  completed: Object.freeze([]),
  cancelled: Object.freeze([]),
  rejected: Object.freeze([]),
});

export const WORKSHOP_SCHEDULE = Object.freeze({
  openMinutes: 9 * 60,
  closeMinutes: 18 * 60,
  lunchStartMinutes: 13 * 60,
  lunchEndMinutes: 14 * 60,
  slotIntervalMinutes: 30,
  closedWeekdays: [0],
});

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*#?&^()_+\-=]{8,72}$/;
const LICENSE_PLATE_REGEX = /^[A-Z0-9\s-]{5,12}$/;
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{11,17}$/;
const INSECURE_SECRET_PATTERNS = [/^admin1234$/i, /^change[-_ ]?me$/i, /^replace[-_ ]?with/i, /^your[-_ ]/i];

export function asyncHandler(handler) {
  return function wrappedHandler(request, response, next) {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function normalizeLicensePlate(licensePlate) {
  return String(licensePlate || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

export function normalizeVin(vin) {
  return String(vin || "").trim().toUpperCase();
}

export function isValidPassword(password) {
  return PASSWORD_REGEX.test(String(password || ""));
}

export function hasConfiguredSecret(secretValue) {
  const normalized = String(secretValue || "").trim();

  if (!normalized) {
    return false;
  }

  return !INSECURE_SECRET_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isSafeAdminPassword(password) {
  return hasConfiguredSecret(password) && isValidPassword(password);
}

export function isValidLicensePlate(licensePlate) {
  return LICENSE_PLATE_REGEX.test(normalizeLicensePlate(licensePlate));
}

export function isValidVin(vin) {
  const normalized = normalizeVin(vin);
  return !normalized || VIN_REGEX.test(normalized);
}

export function buildBookingReference(id) {
  return `BK-${String(id).padStart(6, "0")}`;
}

export function getTodayIsoDate() {
  return dateToIso(new Date());
}

export function dateToIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeDateOnly(value) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return dateToIso(value);
  }

  const stringValue = String(value);
  return stringValue.includes("T") ? stringValue.split("T")[0] : stringValue;
}

export function parseTimeToMinutes(timeValue) {
  const [hours, minutes] = String(timeValue || "")
    .split(":")
    .map(Number);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return NaN;
  }

  return hours * 60 + minutes;
}

export function minutesToTime(minutes) {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

export function isDateInPast(dateIso) {
  return dateIso < getTodayIsoDate();
}

export function isTimeInPast(dateIso, timeValue) {
  if (dateIso !== getTodayIsoDate()) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return parseTimeToMinutes(timeValue) <= currentMinutes;
}

export function validateSchedule(dateIso, timeValue, durationMinutes) {
  const date = new Date(`${dateIso}T00:00:00`);
  const startMinutes = parseTimeToMinutes(timeValue);
  const endMinutes = startMinutes + Number(durationMinutes || 0);

  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
    return false;
  }

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (WORKSHOP_SCHEDULE.closedWeekdays.includes(date.getDay())) {
    return false;
  }

  if (startMinutes < WORKSHOP_SCHEDULE.openMinutes || endMinutes > WORKSHOP_SCHEDULE.closeMinutes) {
    return false;
  }

  const overlapsLunch =
    startMinutes < WORKSHOP_SCHEDULE.lunchEndMinutes && endMinutes > WORKSHOP_SCHEDULE.lunchStartMinutes;

  return !overlapsLunch;
}

export function generateCandidateSlots(durationMinutes, dateIso) {
  const slots = [];

  for (
    let minutes = WORKSHOP_SCHEDULE.openMinutes;
    minutes + durationMinutes <= WORKSHOP_SCHEDULE.closeMinutes;
    minutes += WORKSHOP_SCHEDULE.slotIntervalMinutes
  ) {
    const timeValue = minutesToTime(minutes);

    if (!validateSchedule(dateIso, timeValue, durationMinutes)) {
      continue;
    }

    if (isDateInPast(dateIso) || isTimeInPast(dateIso, timeValue)) {
      continue;
    }

    slots.push(timeValue);
  }

  return slots;
}

export function overlapsRange(startA, durationA, startB, durationB) {
  const startMinutesA = parseTimeToMinutes(startA);
  const startMinutesB = parseTimeToMinutes(startB);
  const endMinutesA = startMinutesA + durationA;
  const endMinutesB = startMinutesB + durationB;
  return startMinutesA < endMinutesB && startMinutesB < endMinutesA;
}

export function isValidBookingStatus(status) {
  return BOOKING_STATUSES.includes(status);
}

export function canTransitionBookingStatus(currentStatus, nextStatus) {
  if (!isValidBookingStatus(currentStatus) || !isValidBookingStatus(nextStatus)) {
    return false;
  }

  return ALLOWED_BOOKING_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function assertDefined(value, message) {
  if (value === undefined || value === null) {
    throw new AppError(500, message);
  }

  return value;
}

export function sanitizeUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapService(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    duration: row.duration,
    price: row.price,
    category: row.category,
    iconCode: row.icon_code,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProduct(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    sku: row.sku,
    unitLabel: row.unit_label,
    price: row.price,
    stockQuantity: row.stock_quantity,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapVehicle(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    licensePlate: row.license_plate,
    vin: row.vin,
    color: row.color,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseBookingProducts(rawValue) {
  if (!rawValue) {
    return [];
  }

  const parsed = Array.isArray(rawValue)
    ? rawValue
    : typeof rawValue === "string"
      ? JSON.parse(rawValue)
      : [];

  return parsed.map((item) => ({
    id: item.id,
    productId: item.productId ?? item.product_id,
    title: item.title ?? item.product_title,
    sku: item.sku ?? item.product_sku,
    unitLabel: item.unitLabel ?? item.unit_label,
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice ?? item.unit_price ?? 0),
    totalPrice: Number(item.totalPrice ?? item.total_price ?? 0),
  }));
}

export function mapBooking(row) {
  if (!row) {
    return null;
  }

  const products = parseBookingProducts(row.products_json);
  const servicePrice = Number(row.price || 0);
  const productsTotal = Number(row.products_total || 0);

  return {
    id: row.id,
    referenceCode: buildBookingReference(row.id),
    userId: row.user_id,
    vehicleId: row.vehicle_id,
    serviceId: row.service_id,
    bookingDate: normalizeDateOnly(row.booking_date),
    bookingTime: row.booking_time?.slice?.(0, 5) || row.booking_time,
    status: row.status,
    notes: row.notes,
    duration: row.duration_minutes,
    price: servicePrice,
    servicePrice,
    products,
    productsTotal,
    totalPrice: servicePrice + productsTotal,
    serviceTitle: row.service_title,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    vehicleName: [row.vehicle_brand, row.vehicle_model].filter(Boolean).join(" "),
    vehicleBrand: row.vehicle_brand,
    vehicleModel: row.vehicle_model,
    licensePlate: row.license_plate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapNotification(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    message: row.message,
    type: row.type,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export function statusToNotification(status, referenceCode) {
  const messages = {
    pending: "Booking created successfully",
    confirmed: "Booking confirmed",
    cancelled: "Booking cancelled",
    rejected: "Booking rejected",
    in_progress: "Booking is now in progress",
    completed: "Booking completed",
  };

  return `${messages[status] || "Booking updated"}: ${referenceCode}`;
}
