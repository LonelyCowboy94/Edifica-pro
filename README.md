# 🏗️ EDIFICA PRO
**Advanced ERP Solution for Construction & Professional Services**

Edifica Pro is a high-performance, multi-tenant ERP system designed to bridge the gap between global pricing standards and local project management. Built with a "zero-any" TypeScript policy, it focuses on data integrity, modularity, and scalability.

---

## 🚀 Technical Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Next-Intl](https://img.shields.io/badge/i18n-next--intl-blue?style=for-the-badge)

### Backend & Database
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

---

## 🏗️ Core Architecture

- **Hybrid Full-Stack Model**: Completely decoupled Frontend (Next.js with Turbopack) and Backend (Node/Express/TypeScript).
- **Service-Based API Layer**: Generic `handleResponse<T>` wrappers ensure 100% type safety and consistent error handling.
- **Master-Template Model**: Global price registries act as templates for end-users, allowing centralized updates for different markets (e.g., Serbia, Germany).
- **Multi-tenancy & Isolation**: Full data isolation at the company level with access to global resources managed by Super Admins.

---

## 💎 Key Features Implemented

### 🌍 Global Price Registry (Module E)
A professional 4-level hierarchical pricing system: `Country → Region → Category → Item`.
- **Super Admin Editor**: Excel-like inline editing for rapid data entry.
- **Bulk Updates**: Transactional API requests to ensure data consistency.
- **Smart Cloning (Deep Copy)**: Copy entire price lists between regions with an optional **Price Multiplier** (e.g., automatically increase prices by 10% for new markets).
- **Cascade Logic**: Hardened data integrity using database-level cascading deletes.

### 🔐 Security & Auth
- **JWT Authentication**: Secure user sessions.
- **RBAC Ready**: Role-Based Access Control logic for distinguishing between regular users and Super Admins.

---

## 📊 Database Schema (Extended)

The system uses a relational PostgreSQL schema managed via **Drizzle ORM**:
- `countries` / `regions`: Geographic localization.
- `master_price_lists`: Centralized templates.
- `price_categories` / `price_items`: Deeply nested pricing data with unit and currency support.

---

## 🛠️ Roadmap & Current Focus

### 1. Security Hardening 🔐
- Finalize `authorizeRole(['SUPER'])` middleware for destructive API routes.
- Manual SUPER role assignment for internal admin accounts.

### 2. Client Price Management 💼
- **"Copy to Workspace"**: Allow clients to import Master Lists into their private environment.
- **Customization**: Enable clients to override master prices without affecting the global template.
- **Active Status Toggle**: Logic to set the primary price list for document generation.

### 3. Invoicing & Quotes (Future) 📄
- **Auto-complete API**: Real-time price fetching during document creation.
- **Margin Calculator**: Automated calculation of profit margins based on Master vs. Client prices.

---

## 👨‍💻 Developer
**Nikola Jokić**
- GitHub: [@LonelyCowboy94](https://github.com/LonelyCowboy94)
- LinkedIn: [Nikola Jokić](https://www.linkedin.com/in/nikola-joki%C4%87-8068913a8/)

---
*Status: Development v3 - Focus: Master Data Entry & RBAC Integration*