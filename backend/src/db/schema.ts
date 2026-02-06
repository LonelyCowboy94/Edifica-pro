import { 
  pgTable, text, serial, boolean, integer, 
  numeric, timestamp, doublePrecision, uuid, pgEnum 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// 1. ENUM DEFINITIONS
// ==========================================

export const tierEnum = pgEnum("tier", ["FREE", "STANDARD", "PRO", "ENTERPRISE"]);
export const roleEnum = pgEnum("role", ["SUPER_ADMIN", "OWNER", "ADMIN", "FOREMAN"]);
export const periodStatusEnum = pgEnum("period_status", ["OPEN", "CLOSED", "PAID"]);
export const workLogStatusEnum = pgEnum("work_log_status", ["PENDING", "SETTLED"]);

// ==========================================
// 2. CORE SYSTEM TABLES
// ==========================================

/**
 * Main company accounts. 
 * baseCurrency is used for global business analytics and default values.
 */
export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  tier: tierEnum("tier").default("FREE").notNull(),
  country: text("country").notNull(), 
  baseCurrency: text("base_currency").default("EUR").notNull(), 
  logoUrl: text("logo_url"), 
  defaultWeekdayHours: numeric("default_weekday_hours", { precision: 4, scale: 2 }).default("8.00").notNull(),
  defaultWeekendHours: numeric("default_weekend_hours", { precision: 4, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Platform users with specific roles within a company.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("OWNER").notNull(), 
  companyId: uuid("company_id").references(() => companies.id, { onDelete: 'cascade' }).notNull(),
});

// ==========================================
// 3. HUMAN RESOURCES (WORKERS)
// ==========================================

/**
 * Workers employed by the company. 
 * Currency defaults to company base but can be overridden.
 */
export const workers = pgTable("workers", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"), 
  position: text("position").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  contractType: text("contract_type").$type<"permanent" | "limited">().notNull(),
  contractUntil: timestamp("contract_until"),
  bankAccount: text("bank_account").notNull(),
  hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("EUR").notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// 4. CRM & CONSTRUCTION PROJECTS
// ==========================================

export const clients = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: 'cascade' }), 
  status: text("status").default("OPEN").notNull(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// 5. GLOBAL MASTER PRICING (Super Admin)
// ==========================================

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
});

export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  countryId: integer("country_id").references(() => countries.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
});

export const masterPriceLists = pgTable("master_price_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  regionId: integer("region_id").references(() => regions.id, { onDelete: 'cascade' }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const priceCategories = pgTable("price_categories", {
  id: serial("id").primaryKey(),
  masterPriceListId: integer("master_price_list_id").references(() => masterPriceLists.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  order: integer("order").default(0),
});

export const priceItems = pgTable("price_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => priceCategories.id, { onDelete: 'cascade' }),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  price: doublePrecision("price").notNull(),
  currency: text("currency").default("EUR"),
});

// ==========================================
// 6. CLIENT CUSTOM PRICING
// ==========================================

export const clientPriceLists = pgTable("client_price_lists", {
  id: serial("id").primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientPriceCategories = pgTable("client_price_categories", {
  id: serial("id").primaryKey(),
  clientPriceListId: integer("client_price_list_id").references(() => clientPriceLists.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  order: integer("order").default(0),
});

export const clientPriceItems = pgTable("client_price_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => clientPriceCategories.id, { onDelete: 'cascade' }).notNull(),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  price: doublePrecision("price").notNull(),
  currency: text("currency").default("EUR"),
});

// ==========================================
// 7. ATTENDANCE & PAYROLL (KARNET)
// ==========================================

export const payrollPeriods = pgTable("payroll_periods", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: 'set null' }),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: periodStatusEnum("status").default("OPEN").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workerPayouts = pgTable("worker_payouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  workerId: uuid("worker_id").references(() => workers.id, { onDelete: 'cascade' }).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  totalRegularHours: doublePrecision("total_regular_hours").notNull(),
  totalOvertimeHours: doublePrecision("total_overtime_hours").notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  /** The currency used for this specific payout */
  currency: text("currency").default("EUR").notNull(),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
  note: text("note"),
});

export const workLogs = pgTable("work_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  workerId: uuid("worker_id").references(() => workers.id, { onDelete: 'cascade' }).notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp("date").notNull(),
  regularHours: doublePrecision("regular_hours").default(8).notNull(),
  overtimeHours: doublePrecision("overtime_hours").default(0).notNull(),
  status: workLogStatusEnum("status").default("PENDING").notNull(),
  payoutId: uuid("payout_id").references(() => workerPayouts.id, { onDelete: 'set null' }),
  hourlyRateAtTime: numeric("hourly_rate_at_time", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// 8. DB RELATIONS
// ==========================================

export const workLogsRelations = relations(workLogs, ({ one }) => ({
  worker: one(workers, {
    fields: [workLogs.workerId],
    references: [workers.id],
  }),
  project: one(projects, {
    fields: [workLogs.projectId],
    references: [projects.id],
  }),
  payout: one(workerPayouts, {
    fields: [workLogs.payoutId],
    references: [workerPayouts.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  workLogs: many(workLogs),
}));

export const workersRelations = relations(workers, ({ many }) => ({
  workLogs: many(workLogs),
  payouts: many(workerPayouts),
}));

export const workerPayoutsRelations = relations(workerPayouts, ({ one, many }) => ({
  worker: one(workers, {
    fields: [workerPayouts.workerId],
    references: [workers.id],
  }),
  workLogs: many(workLogs),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
}));