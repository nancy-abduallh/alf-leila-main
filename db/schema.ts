import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  timestamp,
  datetime,
  decimal,
  boolean,
  date,
  time,
  int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export const dishes = mysqlTable("dishes", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  // Arabic display name. Kept in the DB (rather than translations.ts) because
  // dish content is data, not static UI copy.
  nameAr: varchar("nameAr", { length: 100 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: mysqlEnum("category", ["appetizer", "main", "dessert", "beverage", "breakfast"]).notNull(),
  // Only meaningful when category === "beverage". Null for every other category.
  subcategory: mysqlEnum("subcategory", ["coffee", "tea", "others"]),
  imageUrl: varchar("imageUrl", { length: 255 }),
  featured: boolean("featured").default(false),
  stock: int("stock"), // null = unlimited
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reservations = mysqlTable("reservations", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  date: date("date").notNull(),
  time: time("time").notNull(),
  guests: int("guests").notNull(),
  notes: text("notes"),
  // Customer-facing request (e.g. "Window seat", "Outdoor") — not a guaranteed assignment.
  preferredArea: varchar("preferredArea", { length: 100 }),
  // Actual table assigned by staff once the reservation is confirmed.
  tableNumber: varchar("tableNumber", { length: 20 }),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// A physical table in the restaurant.
export const tables = mysqlTable("tables", {
  id: int("id").primaryKey().autoincrement(),
  tableNumber: varchar("tableNumber", { length: 20 }).notNull().unique(),
  seats: int("seats"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// A table can have several printed QR codes (one per seat, one per side, etc).
// Every code on a table resolves to the same tableId.
export const tableQrCodes = mysqlTable("table_qr_codes", {
  id: int("id").primaryKey().autoincrement(),
  tableId: int("tableId").notNull(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Groups every dine-in order placed at the same table within the 5-minute
// edit window, so the kitchen gets one combined ticket per table sitting.
export const tableOrderBatches = mysqlTable("table_order_batches", {
  id: int("id").primaryKey().autoincrement(),
  tableId: int("tableId").notNull(),
  tableNumber: varchar("tableNumber", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["open", "sent_to_kitchen", "cancelled"]).default("open").notNull(),
  opensAt: timestamp("opensAt").defaultNow().notNull(),
  sendAt: timestamp("sendAt").defaultNow().notNull(),
  // datetime (not timestamp) — MySQL/MariaDB only special-cases the first
  // TIMESTAMP column in a table; any nullable TIMESTAMP after that ends up
  // implicitly NOT NULL and rejects a NULL default. DATETIME has no such quirk.
  sentAt: datetime("sentAt"),
});

export const orders = mysqlTable("orders", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", [
    "pending_edit", // dine-in only: still inside the 5-minute edit window
    "pending",
    "paid",
    "preparing",
    "delivered",
    "failed",
    "cancelled",
  ])
    .default("pending")
    .notNull(),
  orderSource: mysqlEnum("orderSource", ["delivery", "dine_in"]).default("delivery").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  // Delivery-only fields — null for dine-in orders.
  phone: varchar("phone", { length: 20 }),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  notes: text("notes"),
  paymobOrderId: varchar("paymobOrderId", { length: 64 }),
  // Dine-in-only fields — null for delivery orders.
  tableId: int("tableId"),
  tableNumber: varchar("tableNumber", { length: 20 }),
  batchId: int("batchId"),
  // datetime, same reasoning as tableOrderBatches.sentAt above.
  editableUntil: datetime("editableUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const orderItems = mysqlTable("order_items", {
  id: int("id").primaryKey().autoincrement(),
  orderId: int("orderId").notNull(),
  dishId: int("dishId").notNull(),
  dishName: varchar("dishName", { length: 100 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pageViews = mysqlTable("page_views", {
  id: int("id").primaryKey().autoincrement(),
  path: varchar("path", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Dish = typeof dishes.$inferSelect;
export type InsertDish = typeof dishes.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;
export type Table = typeof tables.$inferSelect;
export type InsertTable = typeof tables.$inferInsert;
export type TableQrCode = typeof tableQrCodes.$inferSelect;
export type InsertTableQrCode = typeof tableQrCodes.$inferInsert;
export type TableOrderBatch = typeof tableOrderBatches.$inferSelect;
export type InsertTableOrderBatch = typeof tableOrderBatches.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;