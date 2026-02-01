import { pgTable, text, numeric, timestamp, doublePrecision, uuid, pgEnum } from "drizzle-orm/pg-core";

export const tierEnum = pgEnum("tier", ["FREE", "STANDARD", "PRO", "ENTERPRISE"]);
export const roleEnum = pgEnum("role", ["OWNER", "ADMIN", "FOREMAN"]);

// Companies
export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  tier: tierEnum("tier").default("FREE").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("ADMIN").notNull(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
});

// Workers
export const workers = pgTable("workers", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  position: text("position").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  contractType: text("contract_type").$type<"permanent" | "limited">().notNull(),
  contractUntil: timestamp("contract_until"), // Null if permanent
  bankAccount: text("bank_account").notNull(),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("EUR").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Clients
export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  clientId: uuid("client_id").references(() => clients.id), // Hook with client
  status: text("status").default("OPEN").notNull(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});