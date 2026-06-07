import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with dropshipping-specific fields for registration approval, activation, and status tracking.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Registration approval status
  registrationStatus: mysqlEnum("registrationStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  
  // Account activation status (separate from registration approval)
  activationStatus: mysqlEnum("activationStatus", ["inactive", "active", "suspended"]).default("inactive").notNull(),
  
  // Pickup eligibility status (admin-controlled)
  pickupStatus: mysqlEnum("pickupStatus", ["pending", "approved_for_pickup", "pickup_completed"]).default("pending").notNull(),
  
  // M-Pesa activation fee payment tracking
  activationFeePaid: boolean("activationFeePaid").default(false).notNull(),
  
  // Admin notes
  adminNotes: text("adminNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Activation requests table for tracking M-Pesa payment submissions
 */
export const activationRequests = mysqlTable("activation_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mpesaTransactionCode: varchar("mpesaTransactionCode", { length: 64 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActivationRequest = typeof activationRequests.$inferSelect;
export type InsertActivationRequest = typeof activationRequests.$inferInsert;

/**
 * Pickup requests table for tracking user pickup requests
 */
export const pickupRequests = mysqlTable("pickup_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  pickupDate: timestamp("pickupDate"),
  adminNotes: text("adminNotes"),
  approvedAt: timestamp("approvedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PickupRequest = typeof pickupRequests.$inferSelect;
export type InsertPickupRequest = typeof pickupRequests.$inferInsert;

/**
 * Withdrawal requests table for tracking user withdrawal requests
 */
export const withdrawalRequests = mysqlTable("withdrawal_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  mpesaNumber: varchar("mpesaNumber", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  approvedAt: timestamp("approvedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = typeof withdrawalRequests.$inferInsert;

/**
 * Shipments table for tracking user shipments and profits
 */
export const shipments = mysqlTable("shipments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "in_transit", "delivered", "returned"]).default("pending").notNull(),
  profit: decimal("profit", { precision: 10, scale: 2 }).default("0"),
  destination: varchar("destination", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;
