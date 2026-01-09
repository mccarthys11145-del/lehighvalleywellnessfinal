import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "staff", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Leads table for CRM - stores website contact form submissions
 */
export const leads = mysqlTable("leads", {
  /** UUID primary key */
  id: varchar("id", { length: 36 }).primaryKey(),
  /** Timestamp when the lead was created */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Full name of the lead */
  fullName: text("fullName").notNull(),
  /** Email address (required) */
  email: varchar("email", { length: 320 }).notNull(),
  /** Phone number (required) */
  phone: varchar("phone", { length: 20 }).notNull(),
  /** State: PA, UT, or Other */
  state: mysqlEnum("state", ["PA", "UT", "Other"]).notNull(),
  /** Interest area / selected program */
  interest: mysqlEnum("interest", ["WEIGHT_LOSS", "WEIGHT_LOSS_CORE", "WEIGHT_LOSS_PLUS", "WEIGHT_LOSS_INTENSIVE", "MENOPAUSE_HRT", "MENS_HEALTH_ED", "MENS_HEALTH_HAIR", "MENS_HEALTH_BUNDLE", "PEPTIDE_THERAPY", "GENERAL", "OTHER"]).notNull(),
  /** Preferred contact method */
  preferredContactMethod: mysqlEnum("preferredContactMethod", ["PHONE", "EMAIL", "TEXT"]).notNull(),
  /** Preferred contact time (optional) */
  preferredContactTime: text("preferredContactTime"),
  /** Lead status */
  status: mysqlEnum("status", ["NEW", "CONTACTED", "SCHEDULED", "CLOSED"]).default("NEW").notNull(),
  /** Internal notes (nullable) */
  internalNotes: text("internalNotes"),
  /** Source of the lead */
  source: varchar("source", { length: 100 }).default("website_contact_form").notNull(),
  /** Message from the contact form */
  message: text("message"),
  /** Requested appointment date */
  requestedDate: varchar("requestedDate", { length: 20 }),
  /** Requested appointment time */
  requestedTime: varchar("requestedTime", { length: 20 }),
  /** Stripe payment intent ID for deposit */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 100 }),
  /** Deposit payment status */
  depositStatus: mysqlEnum("depositStatus", ["PENDING", "PAID", "REFUNDED", "WAIVED"]).default("PENDING"),
  /** Selected membership tier name */
  selectedProgram: varchar("selectedProgram", { length: 100 }),
  /** Updated timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("leads_createdAt_idx").on(table.createdAt),
  index("leads_email_idx").on(table.email),
  index("leads_status_idx").on(table.status),
]);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Patient messages table - stores messages from established patients via AI chat
 */
export const patientMessages = mysqlTable("patientMessages", {
  /** UUID primary key */
  id: varchar("id", { length: 36 }).primaryKey(),
  /** Timestamp when the message was created */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Patient's full name */
  patientName: text("patientName").notNull(),
  /** Patient's email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Patient's phone number */
  phone: varchar("phone", { length: 20 }),
  /** Which program the patient is in */
  program: mysqlEnum("program", ["WEIGHT_LOSS", "MENOPAUSE_HRT", "COMBINED", "OTHER"]).notNull(),
  /** Message category */
  category: mysqlEnum("category", ["SCHEDULING", "BILLING", "MEDICATION", "SIDE_EFFECTS", "LABS", "TECHNICAL", "OTHER"]).notNull(),
  /** The patient's message/question */
  message: text("message").notNull(),
  /** Urgency level */
  urgency: mysqlEnum("urgency", ["ROUTINE", "SOON", "URGENT"]).default("ROUTINE").notNull(),
  /** AI conversation context (JSON string of recent messages) */
  conversationContext: text("conversationContext"),
  /** Message status */
  status: mysqlEnum("status", ["NEW", "IN_PROGRESS", "RESOLVED"]).default("NEW").notNull(),
  /** Staff notes */
  staffNotes: text("staffNotes"),
  /** Updated timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("patientMessages_createdAt_idx").on(table.createdAt),
  index("patientMessages_email_idx").on(table.email),
  index("patientMessages_status_idx").on(table.status),
]);

export type PatientMessage = typeof patientMessages.$inferSelect;
export type InsertPatientMessage = typeof patientMessages.$inferInsert;
