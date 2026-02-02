import { pgTable, text, serial, boolean, integer, numeric, timestamp, doublePrecision, uuid, pgEnum } from "drizzle-orm/pg-core";

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

// Pricing lists

// 1. Podržane države
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Srbija", "Nemačka"
  code: text("code").notNull(), // "SRB", "DE"
});

// 2. Regioni (Vojvodina, Bavarska...)
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  countryId: integer("country_id").references(() => countries.id, { onDelete: 'cascade' }), // Dodaj ovo
  name: text("name").notNull(),
});

// 3. Master Cenovnici (vodi ih Super Admin)
export const masterPriceLists = pgTable("master_price_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  regionId: integer("region_id").references(() => regions.id, { onDelete: 'cascade' }), // OBAVEZNO OVO
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 4. Kategorije radova (Zemljani, Grubi, Moleraj...)
export const priceCategories = pgTable("price_categories", {
  id: serial("id").primaryKey(),
  masterPriceListId: integer("master_price_list_id").references(() => masterPriceLists.id, { onDelete: 'cascade' }), // OBAVEZNO OVO
  name: text("name").notNull(),
  order: integer("order").default(0),
});

// 5. Stavke cenovnika (Konkretni radovi)
export const priceItems = pgTable("price_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => priceCategories.id, { onDelete: 'cascade' }), // OBAVEZNO OVO
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  price: doublePrecision("price").notNull(),
  currency: text("currency").default("EUR"),
});