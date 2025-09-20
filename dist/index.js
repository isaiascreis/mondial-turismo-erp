var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accountCategories: () => accountCategories,
  accountCategoriesRelations: () => accountCategoriesRelations,
  accountCategoryTypeEnum: () => accountCategoryTypeEnum,
  accountTypeEnum: () => accountTypeEnum,
  bankAccounts: () => bankAccounts,
  bankAccountsRelations: () => bankAccountsRelations,
  bankTransactions: () => bankTransactions,
  bankTransactionsRelations: () => bankTransactionsRelations,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  contractClauses: () => contractClauses,
  documentTemplates: () => documentTemplates,
  financialAccounts: () => financialAccounts,
  financialAccountsRelations: () => financialAccountsRelations,
  insertAccountCategorySchema: () => insertAccountCategorySchema,
  insertBankAccountSchema: () => insertBankAccountSchema,
  insertBankTransactionSchema: () => insertBankTransactionSchema,
  insertClientSchema: () => insertClientSchema,
  insertContractClauseSchema: () => insertContractClauseSchema,
  insertDocumentTemplateSchema: () => insertDocumentTemplateSchema,
  insertFinancialAccountSchema: () => insertFinancialAccountSchema,
  insertPassengerSchema: () => insertPassengerSchema,
  insertPaymentPlanSchema: () => insertPaymentPlanSchema,
  insertSaleSchema: () => insertSaleSchema,
  insertSaleSellerSchema: () => insertSaleSellerSchema,
  insertSellerSchema: () => insertSellerSchema,
  insertServicePassengerSchema: () => insertServicePassengerSchema,
  insertServiceSchema: () => insertServiceSchema,
  insertSupplierSchema: () => insertSupplierSchema,
  insertUserPermissionSchema: () => insertUserPermissionSchema,
  insertUserSchema: () => insertUserSchema,
  insertWhatsappConversationSchema: () => insertWhatsappConversationSchema,
  insertWhatsappMessageSchema: () => insertWhatsappMessageSchema,
  passengers: () => passengers,
  passengersRelations: () => passengersRelations,
  paymentPlans: () => paymentPlans,
  paymentPlansRelations: () => paymentPlansRelations,
  paymentStatusEnum: () => paymentStatusEnum,
  saleSellers: () => saleSellers,
  saleSellersRelations: () => saleSellersRelations,
  saleStatusEnum: () => saleStatusEnum,
  sales: () => sales,
  salesRelations: () => salesRelations,
  sellers: () => sellers,
  sellersRelations: () => sellersRelations,
  servicePassengers: () => servicePassengers,
  servicePassengersRelations: () => servicePassengersRelations,
  serviceTypeEnum: () => serviceTypeEnum,
  services: () => services,
  servicesRelations: () => servicesRelations,
  sessions: () => sessions,
  suppliers: () => suppliers,
  suppliersRelations: () => suppliersRelations,
  updateUserSchema: () => updateUserSchema,
  userPermissions: () => userPermissions,
  userRolesEnum: () => userRolesEnum,
  users: () => users,
  whatsappConversations: () => whatsappConversations,
  whatsappConversationsRelations: () => whatsappConversationsRelations,
  whatsappMessages: () => whatsappMessages,
  whatsappMessagesRelations: () => whatsappMessagesRelations
});
import { sql, relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var userRolesEnum = pgEnum("user_role", ["admin", "supervisor", "vendedor"]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  systemRole: userRolesEnum("system_role").default("vendedor"),
  // New field for business roles
  ativo: boolean("ativo").default(true),
  telefone: varchar("telefone", { length: 20 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  // sales, clients, financial, etc
  action: varchar("action", { length: 50 }).notNull(),
  // create, read, update, delete, manage
  granted: boolean("granted").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var saleStatusEnum = pgEnum("sale_status", ["orcamento", "venda", "cancelada"]);
var accountTypeEnum = pgEnum("account_type", ["pagar", "receber"]);
var paymentStatusEnum = pgEnum("payment_status", ["pendente", "parcial", "liquidado"]);
var serviceTypeEnum = pgEnum("service_type", ["aereo", "hotel", "transfer", "outros"]);
var accountCategoryTypeEnum = pgEnum("account_category_type", ["receita", "despesa", "outros"]);
var clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  cpf: varchar("cpf", { length: 14 }),
  endereco: text("endereco"),
  dataNascimento: varchar("data_nascimento", { length: 10 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  cnpj: varchar("cnpj", { length: 18 }),
  endereco: text("endereco"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var sellers = pgTable("sellers", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  comissaoPercentual: decimal("comissao_percentual", { precision: 5, scale: 2 }).default("0.00"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  referencia: varchar("referencia", { length: 50 }).notNull().unique(),
  clienteId: integer("cliente_id").references(() => clients.id).notNull(),
  status: saleStatusEnum("status").default("orcamento"),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).default("0.00"),
  custoTotal: decimal("custo_total", { precision: 10, scale: 2 }).default("0.00"),
  lucro: decimal("lucro", { precision: 10, scale: 2 }).default("0.00"),
  observacoes: text("observacoes"),
  dataVenda: timestamp("data_venda"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var passengers = pgTable("passengers", {
  id: serial("id").primaryKey(),
  vendaId: integer("venda_id").references(() => sales.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  dataNascimento: varchar("data_nascimento", { length: 10 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow()
});
var services = pgTable("services", {
  id: serial("id").primaryKey(),
  vendaId: integer("venda_id").references(() => sales.id).notNull(),
  tipo: serviceTypeEnum("tipo").notNull(),
  descricao: text("descricao").notNull(),
  localizador: varchar("localizador", { length: 100 }),
  fornecedorId: integer("fornecedor_id").references(() => suppliers.id),
  valorVenda: decimal("valor_venda", { precision: 10, scale: 2 }).default("0.00"),
  valorCusto: decimal("valor_custo", { precision: 10, scale: 2 }).default("0.00"),
  detalhes: jsonb("detalhes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var servicePassengers = pgTable("service_passengers", {
  id: serial("id").primaryKey(),
  servicoId: integer("servico_id").references(() => services.id).notNull(),
  passageiroId: integer("passageiro_id").references(() => passengers.id).notNull(),
  valorVenda: decimal("valor_venda", { precision: 10, scale: 2 }).default("0.00"),
  valorCusto: decimal("valor_custo", { precision: 10, scale: 2 }).default("0.00")
});
var saleSellers = pgTable("sale_sellers", {
  id: serial("id").primaryKey(),
  vendaId: integer("venda_id").references(() => sales.id).notNull(),
  vendedorId: integer("vendedor_id").references(() => sellers.id).notNull(),
  comissaoPercentual: decimal("comissao_percentual", { precision: 5, scale: 2 }).notNull(),
  valorComissao: decimal("valor_comissao", { precision: 10, scale: 2 }).default("0.00")
});
var bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  banco: varchar("banco", { length: 100 }),
  agencia: varchar("agencia", { length: 20 }),
  conta: varchar("conta", { length: 30 }),
  saldo: decimal("saldo", { precision: 12, scale: 2 }).default("0.00"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var accountCategories = pgTable("account_categories", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: accountCategoryTypeEnum("tipo").notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var financialAccounts = pgTable("financial_accounts", {
  id: serial("id").primaryKey(),
  descricao: text("descricao").notNull(),
  vendaId: integer("venda_id").references(() => sales.id),
  tipo: accountTypeEnum("tipo").notNull(),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  valorLiquidado: decimal("valor_liquidado", { precision: 10, scale: 2 }).default("0.00"),
  valorAberto: decimal("valor_aberto", { precision: 10, scale: 2 }).notNull(),
  dataVencimento: timestamp("data_vencimento"),
  status: paymentStatusEnum("status").default("pendente"),
  categoriaId: integer("categoria_id").references(() => accountCategories.id),
  clienteId: integer("cliente_id").references(() => clients.id),
  fornecedorId: integer("fornecedor_id").references(() => suppliers.id),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var paymentPlans = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  vendaId: integer("venda_id").references(() => sales.id).notNull(),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  dataVencimento: timestamp("data_vencimento").notNull(),
  formaPagamento: varchar("forma_pagamento", { length: 50 }),
  quemRecebe: varchar("quem_recebe", { length: 50 }),
  // AGENCIA ou FORNECEDOR
  status: paymentStatusEnum("status").default("pendente"),
  contaId: integer("conta_id").references(() => financialAccounts.id),
  createdAt: timestamp("created_at").defaultNow()
});
var bankTransactions = pgTable("bank_transactions", {
  id: serial("id").primaryKey(),
  contaBancariaId: integer("conta_bancaria_id").references(() => bankAccounts.id).notNull(),
  contaFinanceiraId: integer("conta_financeira_id").references(() => financialAccounts.id),
  descricao: text("descricao").notNull(),
  valor: decimal("valor", { precision: 12, scale: 2 }).notNull(),
  tipo: varchar("tipo", { length: 20 }).notNull(),
  // entrada ou saida
  dataTransacao: timestamp("data_transacao").notNull(),
  saldoAnterior: decimal("saldo_anterior", { precision: 12, scale: 2 }).notNull(),
  saldoNovo: decimal("saldo_novo", { precision: 12, scale: 2 }).notNull(),
  conciliado: boolean("conciliado").default(false),
  anexos: text("anexos").array(),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow()
});
var whatsappConversations = pgTable("whatsapp_conversations", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatar: text("avatar"),
  isOnline: boolean("is_online").default(false).notNull(),
  lastMessageTime: timestamp("last_message_time"),
  unreadCount: integer("unread_count").default(0).notNull(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => whatsappConversations.id, { onDelete: "cascade" }).notNull(),
  messageId: varchar("message_id", { length: 255 }).unique(),
  // ID do WhatsApp
  type: varchar("type", { length: 20 }).notNull(),
  // text, image, audio, video, document
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  mediaType: varchar("media_type", { length: 100 }),
  fileName: varchar("file_name", { length: 255 }),
  fromMe: boolean("from_me").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  status: varchar("status", { length: 20 }).default("sent"),
  // sent, delivered, read, failed
  createdAt: timestamp("created_at").defaultNow()
});
var documentTemplates = pgTable("document_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  // 'contract', 'voucher'
  htmlContent: text("html_content").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var contractClauses = pgTable("contract_clauses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var clientsRelations = relations(clients, ({ many }) => ({
  sales: many(sales),
  financialAccounts: many(financialAccounts)
}));
var suppliersRelations = relations(suppliers, ({ many }) => ({
  services: many(services),
  financialAccounts: many(financialAccounts)
}));
var sellersRelations = relations(sellers, ({ many }) => ({
  saleSellers: many(saleSellers)
}));
var salesRelations = relations(sales, ({ one, many }) => ({
  client: one(clients, {
    fields: [sales.clienteId],
    references: [clients.id]
  }),
  passengers: many(passengers),
  services: many(services),
  saleSellers: many(saleSellers),
  financialAccounts: many(financialAccounts),
  paymentPlans: many(paymentPlans)
}));
var passengersRelations = relations(passengers, ({ one, many }) => ({
  sale: one(sales, {
    fields: [passengers.vendaId],
    references: [sales.id]
  }),
  servicePassengers: many(servicePassengers)
}));
var servicesRelations = relations(services, ({ one, many }) => ({
  sale: one(sales, {
    fields: [services.vendaId],
    references: [sales.id]
  }),
  supplier: one(suppliers, {
    fields: [services.fornecedorId],
    references: [suppliers.id]
  }),
  servicePassengers: many(servicePassengers)
}));
var servicePassengersRelations = relations(servicePassengers, ({ one }) => ({
  service: one(services, {
    fields: [servicePassengers.servicoId],
    references: [services.id]
  }),
  passenger: one(passengers, {
    fields: [servicePassengers.passageiroId],
    references: [passengers.id]
  })
}));
var saleSellersRelations = relations(saleSellers, ({ one }) => ({
  sale: one(sales, {
    fields: [saleSellers.vendaId],
    references: [sales.id]
  }),
  seller: one(sellers, {
    fields: [saleSellers.vendedorId],
    references: [sellers.id]
  })
}));
var bankAccountsRelations = relations(bankAccounts, ({ many }) => ({
  transactions: many(bankTransactions)
}));
var accountCategoriesRelations = relations(accountCategories, ({ many }) => ({
  financialAccounts: many(financialAccounts)
}));
var financialAccountsRelations = relations(financialAccounts, ({ one, many }) => ({
  sale: one(sales, {
    fields: [financialAccounts.vendaId],
    references: [sales.id]
  }),
  category: one(accountCategories, {
    fields: [financialAccounts.categoriaId],
    references: [accountCategories.id]
  }),
  client: one(clients, {
    fields: [financialAccounts.clienteId],
    references: [clients.id]
  }),
  supplier: one(suppliers, {
    fields: [financialAccounts.fornecedorId],
    references: [suppliers.id]
  }),
  bankTransactions: many(bankTransactions)
}));
var paymentPlansRelations = relations(paymentPlans, ({ one }) => ({
  sale: one(sales, {
    fields: [paymentPlans.vendaId],
    references: [sales.id]
  }),
  account: one(financialAccounts, {
    fields: [paymentPlans.contaId],
    references: [financialAccounts.id]
  })
}));
var bankTransactionsRelations = relations(bankTransactions, ({ one }) => ({
  bankAccount: one(bankAccounts, {
    fields: [bankTransactions.contaBancariaId],
    references: [bankAccounts.id]
  }),
  financialAccount: one(financialAccounts, {
    fields: [bankTransactions.contaFinanceiraId],
    references: [financialAccounts.id]
  })
}));
var whatsappConversationsRelations = relations(whatsappConversations, ({ one, many }) => ({
  client: one(clients, {
    fields: [whatsappConversations.clientId],
    references: [clients.id]
  }),
  messages: many(whatsappMessages)
}));
var whatsappMessagesRelations = relations(whatsappMessages, ({ one }) => ({
  conversation: one(whatsappConversations, {
    fields: [whatsappMessages.conversationId],
    references: [whatsappConversations.id]
  })
}));
var insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true, updatedAt: true });
var insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true, updatedAt: true });
var insertSellerSchema = createInsertSchema(sellers).omit({ id: true, createdAt: true, updatedAt: true });
var insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true, updatedAt: true });
var insertPassengerSchema = createInsertSchema(passengers).omit({ id: true, createdAt: true });
var insertServiceSchema = createInsertSchema(services).omit({ id: true, createdAt: true, updatedAt: true });
var insertServicePassengerSchema = createInsertSchema(servicePassengers).omit({ id: true });
var insertSaleSellerSchema = createInsertSchema(saleSellers).omit({ id: true });
var insertBankAccountSchema = createInsertSchema(bankAccounts).omit({ id: true, createdAt: true, updatedAt: true });
var insertAccountCategorySchema = createInsertSchema(accountCategories).omit({ id: true, createdAt: true });
var insertFinancialAccountSchema = createInsertSchema(financialAccounts).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  dataVencimento: z.string().optional().transform((val) => val ? new Date(val) : void 0)
});
var insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({ id: true, createdAt: true });
var insertBankTransactionSchema = createInsertSchema(bankTransactions).omit({ id: true, createdAt: true });
var insertUserPermissionSchema = createInsertSchema(userPermissions).omit({ id: true, createdAt: true });
var insertWhatsappConversationSchema = createInsertSchema(whatsappConversations).omit({ id: true, createdAt: true, updatedAt: true });
var insertWhatsappMessageSchema = createInsertSchema(whatsappMessages).omit({ id: true, createdAt: true });
var insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({ id: true, createdAt: true, updatedAt: true });
var insertContractClauseSchema = createInsertSchema(contractClauses).omit({ id: true, createdAt: true, updatedAt: true });
var insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
var updateUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true }).partial();

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, ilike, and, gte, lte, sql as sql2, desc, asc } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations (required for Replit Auth)
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // User management operations (for sellers management)
  async getAllUsers() {
    return await db.select().from(users).orderBy(asc(users.firstName));
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async updateUser(id, userData) {
    const [user] = await db.update(users).set({
      ...userData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }
  async deleteUser(id) {
    await db.delete(users).where(eq(users.id, id));
  }
  // Dashboard operations
  async getDashboardMetrics() {
    const today = /* @__PURE__ */ new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const salesTodayResult = await db.select({
      total: sql2`COALESCE(SUM(CAST(${sales.valorTotal} AS DECIMAL)), 0)`,
      count: sql2`COUNT(*)`
    }).from(sales).where(
      and(
        eq(sales.status, "venda"),
        gte(sales.dataVenda, startOfDay)
      )
    );
    const salesMonthResult = await db.select({
      total: sql2`COALESCE(SUM(CAST(${sales.valorTotal} AS DECIMAL)), 0)`,
      count: sql2`COUNT(*)`
    }).from(sales).where(
      and(
        eq(sales.status, "venda"),
        gte(sales.dataVenda, startOfMonth)
      )
    );
    const bankBalanceResult = await db.select({
      total: sql2`COALESCE(SUM(CAST(${bankAccounts.saldo} AS DECIMAL)), 0)`,
      count: sql2`COUNT(*)`
    }).from(bankAccounts).where(eq(bankAccounts.ativo, true));
    const receivableResult = await db.select({
      total: sql2`COALESCE(SUM(CAST(${financialAccounts.valorAberto} AS DECIMAL)), 0)`,
      count: sql2`COUNT(*)`
    }).from(financialAccounts).where(
      and(
        eq(financialAccounts.tipo, "receber"),
        eq(financialAccounts.status, "pendente")
      )
    );
    return {
      salesToday: Number(salesTodayResult[0]?.total || 0),
      salesTodayCount: Number(salesTodayResult[0]?.count || 0),
      salesMonth: Number(salesMonthResult[0]?.total || 0),
      salesMonthCount: Number(salesMonthResult[0]?.count || 0),
      totalBalance: Number(bankBalanceResult[0]?.total || 0),
      bankAccountsCount: Number(bankBalanceResult[0]?.count || 0),
      accountsReceivable: Number(receivableResult[0]?.total || 0),
      pendingAccountsCount: Number(receivableResult[0]?.count || 0)
    };
  }
  async getWeeklyOperations() {
    const today = /* @__PURE__ */ new Date();
    const todayStr = today.toISOString().split("T")[0];
    const in2Days = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1e3);
    const in2DaysStr = in2Days.toISOString().split("T")[0];
    return {
      travelingToday: [],
      travelingIn2Days: [],
      returningToday: [],
      returningIn2Days: []
    };
  }
  async getSalesRanking() {
    const startOfMonth = new Date((/* @__PURE__ */ new Date()).getFullYear(), (/* @__PURE__ */ new Date()).getMonth(), 1);
    const ranking = await db.select({
      id: sellers.id,
      nome: sellers.nome,
      totalSales: sql2`COALESCE(SUM(CAST(${sales.valorTotal} AS DECIMAL)), 0)`,
      salesCount: sql2`COUNT(${sales.id})`
    }).from(sellers).leftJoin(saleSellers, eq(sellers.id, saleSellers.vendedorId)).leftJoin(sales, and(
      eq(saleSellers.vendaId, sales.id),
      eq(sales.status, "venda"),
      gte(sales.dataVenda, startOfMonth)
    )).groupBy(sellers.id, sellers.nome).orderBy(desc(sql2`COALESCE(SUM(CAST(${sales.valorTotal} AS DECIMAL)), 0)`)).limit(10);
    return ranking.map((r) => ({
      ...r,
      totalSales: Number(r.totalSales),
      salesCount: Number(r.salesCount)
    }));
  }
  // Client operations
  async getClients(search) {
    if (search) {
      return db.select().from(clients).where(
        sql2`${clients.nome} ILIKE ${`%${search}%`} OR ${clients.email} ILIKE ${`%${search}%`} OR ${clients.cpf} ILIKE ${`%${search}%`}`
      ).orderBy(asc(clients.nome));
    }
    return db.select().from(clients).orderBy(asc(clients.nome));
  }
  async createClient(clientData) {
    const [client] = await db.insert(clients).values(clientData).returning();
    return client;
  }
  async updateClient(id, clientData) {
    const [client] = await db.update(clients).set({ ...clientData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(clients.id, id)).returning();
    return client;
  }
  async deleteClient(id) {
    await db.delete(clients).where(eq(clients.id, id));
  }
  // Supplier operations
  async getSuppliers(search) {
    if (search) {
      return db.select().from(suppliers).where(
        sql2`${suppliers.nome} ILIKE ${`%${search}%`} OR ${suppliers.email} ILIKE ${`%${search}%`} OR ${suppliers.cnpj} ILIKE ${`%${search}%`}`
      ).orderBy(asc(suppliers.nome));
    }
    return db.select().from(suppliers).orderBy(asc(suppliers.nome));
  }
  async createSupplier(supplierData) {
    const [supplier] = await db.insert(suppliers).values(supplierData).returning();
    return supplier;
  }
  async updateSupplier(id, supplierData) {
    const [supplier] = await db.update(suppliers).set({ ...supplierData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(suppliers.id, id)).returning();
    return supplier;
  }
  async deleteSupplier(id) {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }
  // Seller operations
  async getSellers() {
    return db.select().from(sellers).where(eq(sellers.ativo, true)).orderBy(asc(sellers.nome));
  }
  async createSeller(sellerData) {
    const [seller] = await db.insert(sellers).values(sellerData).returning();
    return seller;
  }
  // Sales operations
  async getSales(filters = {}) {
    const conditions = [];
    if (filters.status) {
      conditions.push(eq(sales.status, filters.status));
    }
    if (filters.clientId) {
      conditions.push(eq(sales.clienteId, filters.clientId));
    }
    if (filters.dateFrom) {
      conditions.push(gte(sales.createdAt, new Date(filters.dateFrom)));
    }
    if (filters.dateTo) {
      conditions.push(lte(sales.createdAt, new Date(filters.dateTo)));
    }
    if (conditions.length > 0) {
      return db.select({
        id: sales.id,
        referencia: sales.referencia,
        status: sales.status,
        valorTotal: sales.valorTotal,
        custoTotal: sales.custoTotal,
        lucro: sales.lucro,
        dataVenda: sales.dataVenda,
        createdAt: sales.createdAt,
        client: {
          id: clients.id,
          nome: clients.nome,
          email: clients.email
        }
      }).from(sales).leftJoin(clients, eq(sales.clienteId, clients.id)).where(and(...conditions)).orderBy(desc(sales.createdAt));
    }
    return db.select({
      id: sales.id,
      referencia: sales.referencia,
      status: sales.status,
      valorTotal: sales.valorTotal,
      custoTotal: sales.custoTotal,
      lucro: sales.lucro,
      dataVenda: sales.dataVenda,
      createdAt: sales.createdAt,
      client: {
        id: clients.id,
        nome: clients.nome,
        email: clients.email
      }
    }).from(sales).leftJoin(clients, eq(sales.clienteId, clients.id)).orderBy(desc(sales.createdAt));
  }
  async getSaleById(id) {
    const [sale] = await db.select({
      id: sales.id,
      referencia: sales.referencia,
      status: sales.status,
      valorTotal: sales.valorTotal,
      custoTotal: sales.custoTotal,
      lucro: sales.lucro,
      observacoes: sales.observacoes,
      dataVenda: sales.dataVenda,
      createdAt: sales.createdAt,
      client: {
        id: clients.id,
        nome: clients.nome,
        email: clients.email,
        telefone: clients.telefone,
        cpf: clients.cpf
      }
    }).from(sales).leftJoin(clients, eq(sales.clienteId, clients.id)).where(eq(sales.id, id));
    if (!sale) return null;
    const salePassengers = await db.select().from(passengers).where(eq(passengers.vendaId, id)).orderBy(asc(passengers.id));
    const saleServices = await db.select({
      id: services.id,
      tipo: services.tipo,
      descricao: services.descricao,
      localizador: services.localizador,
      valorVenda: services.valorVenda,
      valorCusto: services.valorCusto,
      detalhes: services.detalhes,
      supplier: {
        id: suppliers.id,
        nome: suppliers.nome
      }
    }).from(services).leftJoin(suppliers, eq(services.fornecedorId, suppliers.id)).where(eq(services.vendaId, id)).orderBy(asc(services.id));
    const saleSellersData = await db.select({
      id: saleSellers.id,
      comissaoPercentual: saleSellers.comissaoPercentual,
      valorComissao: saleSellers.valorComissao,
      seller: {
        id: sellers.id,
        nome: sellers.nome
      }
    }).from(saleSellers).leftJoin(sellers, eq(saleSellers.vendedorId, sellers.id)).where(eq(saleSellers.vendaId, id));
    const salePaymentPlans = await db.select().from(paymentPlans).where(eq(paymentPlans.vendaId, id)).orderBy(asc(paymentPlans.dataVencimento));
    return {
      ...sale,
      passengers: salePassengers,
      services: saleServices,
      sellers: saleSellersData,
      paymentPlans: salePaymentPlans
    };
  }
  async createSale(saleData) {
    return db.transaction(async (tx) => {
      const referencia = `${(/* @__PURE__ */ new Date()).getFullYear()}-${String(Math.floor(Math.random() * 1e4)).padStart(4, "0")}`;
      const [sale] = await tx.insert(sales).values({
        referencia,
        clienteId: saleData.clienteId,
        status: saleData.status || "orcamento",
        observacoes: saleData.observacoes
      }).returning();
      if (saleData.passengers?.length) {
        for (const passenger of saleData.passengers) {
          await tx.insert(passengers).values({
            vendaId: sale.id,
            ...passenger
          });
        }
      }
      if (saleData.services?.length) {
        for (const service of saleData.services) {
          await tx.insert(services).values({
            vendaId: sale.id,
            ...service
          });
        }
      }
      if (saleData.sellers?.length) {
        for (const seller of saleData.sellers) {
          await tx.insert(saleSellers).values({
            vendaId: sale.id,
            ...seller
          });
        }
      }
      if (saleData.paymentPlans?.length) {
        for (const plan of saleData.paymentPlans) {
          await tx.insert(paymentPlans).values({
            vendaId: sale.id,
            ...plan
          });
        }
      }
      await this.recalculateSaleTotals(sale.id, tx);
      return sale;
    });
  }
  async updateSale(id, saleData) {
    return db.transaction(async (tx) => {
      const [sale] = await tx.update(sales).set({
        clienteId: saleData.clienteId,
        observacoes: saleData.observacoes,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(sales.id, id)).returning();
      await tx.delete(passengers).where(eq(passengers.vendaId, id));
      if (saleData.passengers?.length) {
        for (const passenger of saleData.passengers) {
          await tx.insert(passengers).values({
            vendaId: id,
            ...passenger
          });
        }
      }
      await tx.delete(services).where(eq(services.vendaId, id));
      if (saleData.services?.length) {
        for (const service of saleData.services) {
          await tx.insert(services).values({
            vendaId: id,
            ...service
          });
        }
      }
      await tx.delete(saleSellers).where(eq(saleSellers.vendaId, id));
      if (saleData.sellers?.length) {
        for (const seller of saleData.sellers) {
          await tx.insert(saleSellers).values({
            vendaId: id,
            ...seller
          });
        }
      }
      await tx.delete(paymentPlans).where(eq(paymentPlans.vendaId, id));
      if (saleData.paymentPlans?.length) {
        for (const plan of saleData.paymentPlans) {
          await tx.insert(paymentPlans).values({
            vendaId: id,
            ...plan
          });
        }
      }
      await this.recalculateSaleTotals(id, tx);
      return sale;
    });
  }
  async updateSaleStatus(id, status) {
    return db.transaction(async (tx) => {
      const [sale] = await tx.update(sales).set({
        status,
        dataVenda: status === "venda" ? /* @__PURE__ */ new Date() : null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(sales.id, id)).returning();
      if (status === "venda") {
        await this.createFinancialAccountsForSale(id, tx);
      }
      return sale;
    });
  }
  async recalculateSaleTotals(saleId, tx) {
    const saleServices = await tx.select({
      valorVenda: services.valorVenda,
      valorCusto: services.valorCusto
    }).from(services).where(eq(services.vendaId, saleId));
    const totals = saleServices.reduce(
      (acc, service) => {
        acc.valorTotal += Number(service.valorVenda || 0);
        acc.custoTotal += Number(service.valorCusto || 0);
        return acc;
      },
      { valorTotal: 0, custoTotal: 0 }
    );
    totals.lucro = totals.valorTotal - totals.custoTotal;
    await tx.update(sales).set({
      valorTotal: totals.valorTotal.toString(),
      custoTotal: totals.custoTotal.toString(),
      lucro: totals.lucro.toString(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(sales.id, saleId));
  }
  async createFinancialAccountsForSale(saleId, tx) {
    const [sale] = await tx.select({
      id: sales.id,
      referencia: sales.referencia,
      clienteId: sales.clienteId,
      valorTotal: sales.valorTotal,
      custoTotal: sales.custoTotal
    }).from(sales).where(eq(sales.id, saleId));
    if (!sale) return;
    await tx.insert(financialAccounts).values({
      descricao: `Recebimento Cliente - Venda ${sale.referencia}`,
      vendaId: saleId,
      tipo: "receber",
      valorTotal: sale.valorTotal,
      valorAberto: sale.valorTotal,
      clienteId: sale.clienteId,
      status: "pendente"
    });
    if (Number(sale.custoTotal) > 0) {
      await tx.insert(financialAccounts).values({
        descricao: `Repasse Fornecedores - Venda ${sale.referencia}`,
        vendaId: saleId,
        tipo: "pagar",
        valorTotal: sale.custoTotal,
        valorAberto: sale.custoTotal,
        status: "pendente"
      });
    }
    const salesSellers = await tx.select({
      valorComissao: saleSellers.valorComissao,
      seller: {
        nome: sellers.nome
      }
    }).from(saleSellers).leftJoin(sellers, eq(saleSellers.vendedorId, sellers.id)).where(eq(saleSellers.vendaId, saleId));
    for (const saleSeller of salesSellers) {
      if (Number(saleSeller.valorComissao) > 0) {
        await tx.insert(financialAccounts).values({
          descricao: `Comiss\xE3o ${saleSeller.seller?.nome} - Venda ${sale.referencia}`,
          vendaId: saleId,
          tipo: "pagar",
          valorTotal: saleSeller.valorComissao,
          valorAberto: saleSeller.valorComissao,
          status: "pendente"
        });
      }
    }
  }
  // Financial operations
  async getFinancialAccounts(filters = {}) {
    const conditions = [];
    if (filters.tipo) {
      conditions.push(eq(financialAccounts.tipo, filters.tipo));
    }
    if (filters.status) {
      conditions.push(eq(financialAccounts.status, filters.status));
    }
    if (filters.search) {
      conditions.push(ilike(financialAccounts.descricao, `%${filters.search}%`));
    }
    if (conditions.length > 0) {
      return db.select({
        id: financialAccounts.id,
        descricao: financialAccounts.descricao,
        tipo: financialAccounts.tipo,
        valorTotal: financialAccounts.valorTotal,
        valorLiquidado: financialAccounts.valorLiquidado,
        valorAberto: financialAccounts.valorAberto,
        dataVencimento: financialAccounts.dataVencimento,
        status: financialAccounts.status,
        createdAt: financialAccounts.createdAt,
        client: {
          id: clients.id,
          nome: clients.nome
        },
        supplier: {
          id: suppliers.id,
          nome: suppliers.nome
        },
        category: {
          id: accountCategories.id,
          nome: accountCategories.nome
        }
      }).from(financialAccounts).leftJoin(clients, eq(financialAccounts.clienteId, clients.id)).leftJoin(suppliers, eq(financialAccounts.fornecedorId, suppliers.id)).leftJoin(accountCategories, eq(financialAccounts.categoriaId, accountCategories.id)).where(and(...conditions)).orderBy(desc(financialAccounts.createdAt));
    }
    return db.select({
      id: financialAccounts.id,
      descricao: financialAccounts.descricao,
      tipo: financialAccounts.tipo,
      valorTotal: financialAccounts.valorTotal,
      valorLiquidado: financialAccounts.valorLiquidado,
      valorAberto: financialAccounts.valorAberto,
      dataVencimento: financialAccounts.dataVencimento,
      status: financialAccounts.status,
      createdAt: financialAccounts.createdAt,
      client: {
        id: clients.id,
        nome: clients.nome
      },
      supplier: {
        id: suppliers.id,
        nome: suppliers.nome
      },
      category: {
        id: accountCategories.id,
        nome: accountCategories.nome
      }
    }).from(financialAccounts).leftJoin(clients, eq(financialAccounts.clienteId, clients.id)).leftJoin(suppliers, eq(financialAccounts.fornecedorId, suppliers.id)).leftJoin(accountCategories, eq(financialAccounts.categoriaId, accountCategories.id)).orderBy(desc(financialAccounts.createdAt));
  }
  async createFinancialAccount(accountData) {
    const [account] = await db.insert(financialAccounts).values({
      ...accountData,
      valorAberto: accountData.valorTotal
    }).returning();
    return account;
  }
  async liquidateFinancialAccount(id, data) {
    return db.transaction(async (tx) => {
      const [account] = await tx.select().from(financialAccounts).where(eq(financialAccounts.id, id));
      if (!account) throw new Error("Account not found");
      const valorLiquidado = Number(account.valorLiquidado || 0) + Number(data.valor);
      const valorAberto = Number(account.valorTotal) - valorLiquidado;
      const newStatus = valorAberto <= 0 ? "liquidado" : valorLiquidado > 0 ? "parcial" : "pendente";
      const [updatedAccount] = await tx.update(financialAccounts).set({
        valorLiquidado: valorLiquidado.toString(),
        valorAberto: valorAberto.toString(),
        status: newStatus,
        categoriaId: data.categoriaId,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(financialAccounts.id, id)).returning();
      const [bankAccount] = await tx.select().from(bankAccounts).where(eq(bankAccounts.id, data.contaBancariaId));
      if (!bankAccount) throw new Error("Bank account not found");
      const saldoAnterior = Number(bankAccount.saldo);
      const valorTransacao = account.tipo === "receber" ? Number(data.valor) : -Number(data.valor);
      const saldoNovo = saldoAnterior + valorTransacao;
      await tx.insert(bankTransactions).values({
        contaBancariaId: data.contaBancariaId,
        contaFinanceiraId: id,
        descricao: account.descricao,
        valor: data.valor.toString(),
        tipo: account.tipo === "receber" ? "entrada" : "saida",
        dataTransacao: new Date(data.dataLiquidacao),
        saldoAnterior: saldoAnterior.toString(),
        saldoNovo: saldoNovo.toString(),
        conciliado: true,
        anexos: data.anexos || []
      });
      await tx.update(bankAccounts).set({
        saldo: saldoNovo.toString(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(bankAccounts.id, data.contaBancariaId));
      return updatedAccount;
    });
  }
  // Banking operations
  async getBankAccounts() {
    return db.select().from(bankAccounts).where(eq(bankAccounts.ativo, true)).orderBy(asc(bankAccounts.nome));
  }
  async createBankAccount(accountData) {
    const [account] = await db.insert(bankAccounts).values(accountData).returning();
    return account;
  }
  async getBankTransactions(accountId, filters = {}) {
    const conditions = [eq(bankTransactions.contaBancariaId, accountId)];
    if (filters.dateFrom) {
      conditions.push(gte(bankTransactions.dataTransacao, new Date(filters.dateFrom)));
    }
    if (filters.dateTo) {
      conditions.push(lte(bankTransactions.dataTransacao, new Date(filters.dateTo)));
    }
    return db.select({
      id: bankTransactions.id,
      descricao: bankTransactions.descricao,
      valor: bankTransactions.valor,
      tipo: bankTransactions.tipo,
      dataTransacao: bankTransactions.dataTransacao,
      saldoAnterior: bankTransactions.saldoAnterior,
      saldoNovo: bankTransactions.saldoNovo,
      conciliado: bankTransactions.conciliado,
      anexos: bankTransactions.anexos,
      observacoes: bankTransactions.observacoes,
      contaFinanceiraId: bankTransactions.contaFinanceiraId
    }).from(bankTransactions).where(and(...conditions)).orderBy(desc(bankTransactions.dataTransacao));
  }
  async createBankTransaction(transactionData) {
    return db.transaction(async (tx) => {
      const [bankAccount] = await tx.select().from(bankAccounts).where(eq(bankAccounts.id, transactionData.contaBancariaId));
      if (!bankAccount) throw new Error("Bank account not found");
      const saldoAnterior = Number(bankAccount.saldo);
      const valorTransacao = transactionData.tipo === "entrada" ? Number(transactionData.valor) : -Number(transactionData.valor);
      const saldoNovo = saldoAnterior + valorTransacao;
      const [transaction] = await tx.insert(bankTransactions).values({
        ...transactionData,
        saldoAnterior: saldoAnterior.toString(),
        saldoNovo: saldoNovo.toString()
      }).returning();
      await tx.update(bankAccounts).set({
        saldo: saldoNovo.toString(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(bankAccounts.id, transactionData.contaBancariaId));
      return transaction;
    });
  }
  // Account Category operations
  async getAccountCategories(tipo) {
    if (tipo) {
      return db.select().from(accountCategories).where(and(
        eq(accountCategories.ativo, true),
        eq(accountCategories.tipo, tipo)
      )).orderBy(asc(accountCategories.nome));
    }
    return db.select().from(accountCategories).where(eq(accountCategories.ativo, true)).orderBy(asc(accountCategories.nome));
  }
  async createAccountCategory(categoryData) {
    const [category] = await db.insert(accountCategories).values(categoryData).returning();
    return category;
  }
  async updateAccountCategory(id, categoryData) {
    const [category] = await db.update(accountCategories).set({ ...categoryData }).where(eq(accountCategories.id, id)).returning();
    if (!category) {
      throw new Error("Account category not found");
    }
    return category;
  }
  async deleteAccountCategory(id) {
    await db.update(accountCategories).set({ ativo: false }).where(eq(accountCategories.id, id));
  }
  // WhatsApp operations
  async getWhatsAppConversations() {
    return await db.select({
      id: whatsappConversations.id,
      phone: whatsappConversations.phone,
      name: whatsappConversations.name,
      avatar: whatsappConversations.avatar,
      isOnline: whatsappConversations.isOnline,
      lastMessageTime: whatsappConversations.lastMessageTime,
      unreadCount: whatsappConversations.unreadCount,
      clientId: whatsappConversations.clientId,
      createdAt: whatsappConversations.createdAt,
      client: {
        id: clients.id,
        nome: clients.nome
      }
    }).from(whatsappConversations).leftJoin(clients, eq(whatsappConversations.clientId, clients.id)).orderBy(desc(whatsappConversations.lastMessageTime));
  }
  async getOrCreateConversation(phone, name) {
    let [conversation] = await db.select().from(whatsappConversations).where(eq(whatsappConversations.phone, phone)).limit(1);
    if (!conversation) {
      [conversation] = await db.insert(whatsappConversations).values({
        phone,
        name,
        isOnline: true,
        unreadCount: 0,
        lastMessageTime: /* @__PURE__ */ new Date()
      }).returning();
    }
    return conversation;
  }
  async updateConversationStatus(id, isOnline) {
    const [conversation] = await db.update(whatsappConversations).set({
      isOnline,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(whatsappConversations.id, id)).returning();
    return conversation;
  }
  async getConversationMessages(conversationId) {
    return await db.select({
      id: whatsappMessages.id,
      messageId: whatsappMessages.messageId,
      type: whatsappMessages.type,
      content: whatsappMessages.content,
      mediaUrl: whatsappMessages.mediaUrl,
      mediaType: whatsappMessages.mediaType,
      fileName: whatsappMessages.fileName,
      fromMe: whatsappMessages.fromMe,
      timestamp: whatsappMessages.timestamp,
      status: whatsappMessages.status,
      createdAt: whatsappMessages.createdAt
    }).from(whatsappMessages).where(eq(whatsappMessages.conversationId, conversationId)).orderBy(asc(whatsappMessages.timestamp));
  }
  async createMessage(messageData) {
    const [message] = await db.insert(whatsappMessages).values({
      conversationId: messageData.conversationId,
      messageId: messageData.messageId,
      type: messageData.type,
      content: messageData.content,
      mediaUrl: messageData.mediaUrl,
      mediaType: messageData.mediaType,
      fileName: messageData.fileName,
      fromMe: messageData.fromMe,
      timestamp: messageData.timestamp,
      status: messageData.status || "sent"
    }).returning();
    await db.update(whatsappConversations).set({
      lastMessageTime: messageData.timestamp,
      unreadCount: messageData.fromMe ? sql2`unread_count` : sql2`unread_count + 1`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(whatsappConversations.id, messageData.conversationId));
    return message;
  }
  async updateMessageStatus(messageId, status) {
    const [message] = await db.update(whatsappMessages).set({ status }).where(eq(whatsappMessages.messageId, messageId)).returning();
    return message;
  }
};
var storage = new DatabaseStorage();

// server/simpleAuth.ts
import session from "express-session";
import connectPg from "connect-pg-simple";
var DEFAULT_USERS = {
  admin: "admin123",
  turismo: "turismo2024"
};
function getSimpleSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    // Permite criação automática da tabela
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    store: sessionStore,
    resave: true,
    // Mudado para true para desenvolvimento
    saveUninitialized: true,
    // Mudado para true para desenvolvimento
    cookie: {
      httpOnly: false,
      // Mudado para false para debugging
      secure: false,
      // Sempre false em desenvolvimento
      sameSite: "lax",
      maxAge: sessionTtl,
      domain: void 0,
      // Remove domain restriction
      path: "/"
      // Explicitamente define o path
    }
  });
}
async function setupSimpleAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSimpleSession());
  app2.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username e password s\xE3o obrigat\xF3rios" });
    }
    if (DEFAULT_USERS[username] === password) {
      req.session.user = {
        username,
        isAuthenticated: true,
        loginTime: /* @__PURE__ */ new Date()
      };
      return res.json({
        message: "Login realizado com sucesso",
        user: { username }
      });
    }
    return res.status(401).json({ message: "Credenciais inv\xE1lidas" });
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });
  app2.get("/api/auth/user", (req, res) => {
    const user = req.session?.user;
    if (!user?.isAuthenticated) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({
      username: user.username,
      firstName: user.username,
      // Para compatibilidade com o frontend
      lastName: "Usu\xE1rio",
      email: `${user.username}@mundial.com`,
      loginTime: user.loginTime
    });
  });
}
var isAuthenticated = (req, res, next) => {
  next();
};

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  await setupSimpleAuth(app2);
  const requireAdmin = async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user || user.systemRole !== "admin") {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem gerenciar usu\xE1rios." });
      }
      next();
    } catch (error) {
      console.error("Error in requireAdmin middleware:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  };
  app2.get("/api/dashboard/metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });
  app2.get("/api/dashboard/operations", isAuthenticated, async (req, res) => {
    try {
      const operations = await storage.getWeeklyOperations();
      res.json(operations);
    } catch (error) {
      console.error("Error fetching operations:", error);
      res.status(500).json({ message: "Failed to fetch operations" });
    }
  });
  app2.get("/api/dashboard/sales-ranking", isAuthenticated, async (req, res) => {
    try {
      const ranking = await storage.getSalesRanking();
      res.json(ranking);
    } catch (error) {
      console.error("Error fetching sales ranking:", error);
      res.status(500).json({ message: "Failed to fetch sales ranking" });
    }
  });
  app2.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      const clients2 = await storage.getClients(search);
      res.json(clients2);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  app2.post("/api/clients", isAuthenticated, async (req, res) => {
    try {
      console.log("POST /api/clients - Request body:", JSON.stringify(req.body, null, 2));
      const clientData = insertClientSchema.parse(req.body);
      console.log("POST /api/clients - Parsed data:", JSON.stringify(clientData, null, 2));
      const client = await storage.createClient(clientData);
      console.log("POST /api/clients - Created client:", JSON.stringify(client, null, 2));
      res.json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(500).json({ message: `Failed to create client: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });
  app2.put("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.updateClient(id, clientData);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });
  app2.delete("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClient(id);
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });
  app2.get("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      const suppliers2 = await storage.getSuppliers(search);
      res.json(suppliers2);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });
  app2.post("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });
  app2.put("/api/suppliers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.updateSupplier(id, supplierData);
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });
  app2.delete("/api/suppliers/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSupplier(id);
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });
  app2.get("/api/sellers", isAuthenticated, async (req, res) => {
    try {
      const sellers2 = await storage.getSellers();
      res.json(sellers2);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      res.status(500).json({ message: "Failed to fetch sellers" });
    }
  });
  app2.post("/api/sellers", isAuthenticated, async (req, res) => {
    try {
      const sellerData = insertSellerSchema.parse(req.body);
      const seller = await storage.createSeller(sellerData);
      res.json(seller);
    } catch (error) {
      console.error("Error creating seller:", error);
      res.status(500).json({ message: "Failed to create seller" });
    }
  });
  app2.get("/api/users", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/users", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      console.log("POST /api/users - Request body:", JSON.stringify(req.body, null, 2));
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      console.log("POST /api/users - Created user:", JSON.stringify(user, null, 2));
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          message: "Dados inv\xE1lidos",
          errors: error.issues?.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: `Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });
  app2.patch("/api/users/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      console.log("PATCH /api/users/:id - Request body:", JSON.stringify(req.body, null, 2));
      const id = req.params.id;
      const userData = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(id, userData);
      console.log("PATCH /api/users/:id - Updated user:", JSON.stringify(user, null, 2));
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({
          message: "Dados inv\xE1lidos",
          errors: error.issues?.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/users/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.get("/api/sales", isAuthenticated, async (req, res) => {
    try {
      const { status, clientId, dateFrom, dateTo } = req.query;
      const sales2 = await storage.getSales({
        status,
        clientId: clientId ? parseInt(clientId) : void 0,
        dateFrom,
        dateTo
      });
      res.json(sales2);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });
  app2.get("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid sale ID" });
      }
      const sale = await storage.getSaleById(id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      console.error("Error fetching sale:", error);
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });
  app2.post("/api/sales", isAuthenticated, async (req, res) => {
    try {
      const saleData = req.body;
      const sale = await storage.createSale(saleData);
      res.json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });
  app2.put("/api/sales/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const saleData = req.body;
      const sale = await storage.updateSale(id, saleData);
      res.json(sale);
    } catch (error) {
      console.error("Error updating sale:", error);
      res.status(500).json({ message: "Failed to update sale" });
    }
  });
  app2.put("/api/sales/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const sale = await storage.updateSaleStatus(id, status);
      res.json(sale);
    } catch (error) {
      console.error("Error updating sale status:", error);
      res.status(500).json({ message: "Failed to update sale status" });
    }
  });
  app2.get("/api/financial-accounts", isAuthenticated, async (req, res) => {
    try {
      const { tipo, status, search } = req.query;
      const accounts = await storage.getFinancialAccounts({
        tipo,
        status,
        search
      });
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching financial accounts:", error);
      res.status(500).json({ message: "Failed to fetch financial accounts" });
    }
  });
  app2.post("/api/financial-accounts", isAuthenticated, async (req, res) => {
    try {
      const accountData = insertFinancialAccountSchema.parse(req.body);
      const account = await storage.createFinancialAccount(accountData);
      res.json(account);
    } catch (error) {
      console.error("Error creating financial account:", error);
      res.status(500).json({ message: "Failed to create financial account" });
    }
  });
  app2.put("/api/financial-accounts/:id/liquidate", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { valor, contaBancariaId, dataLiquidacao, categoriaId, anexos } = req.body;
      const result = await storage.liquidateFinancialAccount(id, {
        valor: parseFloat(valor),
        contaBancariaId: parseInt(contaBancariaId),
        dataLiquidacao,
        categoriaId: parseInt(categoriaId),
        anexos
      });
      res.json(result);
    } catch (error) {
      console.error("Error liquidating financial account:", error);
      res.status(500).json({ message: "Failed to liquidate financial account" });
    }
  });
  app2.get("/api/bank-accounts", isAuthenticated, async (req, res) => {
    try {
      const accounts = await storage.getBankAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      res.status(500).json({ message: "Failed to fetch bank accounts" });
    }
  });
  app2.post("/api/bank-accounts", isAuthenticated, async (req, res) => {
    try {
      const accountData = insertBankAccountSchema.parse(req.body);
      const account = await storage.createBankAccount(accountData);
      res.json(account);
    } catch (error) {
      console.error("Error creating bank account:", error);
      res.status(500).json({ message: "Failed to create bank account" });
    }
  });
  app2.get("/api/bank-accounts/:id/transactions", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { dateFrom, dateTo } = req.query;
      const transactions = await storage.getBankTransactions(id, {
        dateFrom,
        dateTo
      });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching bank transactions:", error);
      res.status(500).json({ message: "Failed to fetch bank transactions" });
    }
  });
  app2.post("/api/bank-transactions", isAuthenticated, async (req, res) => {
    try {
      const transactionData = insertBankTransactionSchema.parse(req.body);
      const transaction = await storage.createBankTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating bank transaction:", error);
      res.status(500).json({ message: "Failed to create bank transaction" });
    }
  });
  app2.get("/api/account-categories", isAuthenticated, async (req, res) => {
    try {
      const { tipo } = req.query;
      const categories = await storage.getAccountCategories(tipo);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching account categories:", error);
      res.status(500).json({ message: "Failed to fetch account categories" });
    }
  });
  app2.post("/api/account-categories", isAuthenticated, async (req, res) => {
    try {
      const categoryData = insertAccountCategorySchema.parse(req.body);
      const category = await storage.createAccountCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating account category:", error);
      res.status(500).json({ message: "Failed to create account category" });
    }
  });
  app2.put("/api/account-categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertAccountCategorySchema.parse(req.body);
      const category = await storage.updateAccountCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error updating account category:", error);
      res.status(500).json({ message: "Failed to update account category" });
    }
  });
  app2.delete("/api/account-categories/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAccountCategory(id);
      res.json({ message: "Account category deleted successfully" });
    } catch (error) {
      console.error("Error deleting account category:", error);
      res.status(500).json({ message: "Failed to delete account category" });
    }
  });
  app2.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      const expectedToken = process.env.WHATSAPP_WEBHOOK_TOKEN;
      if (!expectedToken) {
        console.error("WHATSAPP_WEBHOOK_TOKEN environment variable not set");
        return res.status(500).json({ message: "Server configuration error" });
      }
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        return res.status(401).json({ message: "Unauthorized webhook access" });
      }
      const webhookSchema = z2.object({
        phone: z2.string().min(1, "Phone is required"),
        name: z2.string().optional(),
        message: z2.string().min(1, "Message content is required"),
        messageId: z2.string().optional(),
        type: z2.string().default("text"),
        timestamp: z2.string().optional()
      });
      const validationResult = webhookSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.warn("Invalid webhook payload:", validationResult.error.errors);
        return res.status(400).json({
          message: "Invalid webhook payload",
          errors: validationResult.error.errors
        });
      }
      const { phone, name, message, messageId, type, timestamp: timestamp2 } = validationResult.data;
      console.log("Received WhatsApp webhook:", { phone, messageId });
      const conversation = await storage.getOrCreateConversation(phone, name || "Contact");
      const messageData = {
        conversationId: conversation.id,
        messageId: messageId || `webhook_${Date.now()}`,
        type,
        content: message,
        fromMe: false,
        // Received message
        timestamp: timestamp2 ? new Date(timestamp2) : /* @__PURE__ */ new Date(),
        status: "received"
      };
      const savedMessage = await storage.createMessage(messageData);
      console.log("WhatsApp message received and saved:", savedMessage.messageId);
      res.status(200).json({ success: true, message: "Message received" });
    } catch (error) {
      console.error("Error processing WhatsApp webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });
  app2.get("/api/whatsapp/conversations", isAuthenticated, async (req, res) => {
    try {
      const conversations = await storage.getWhatsAppConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching WhatsApp conversations:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp conversations" });
    }
  });
  app2.post("/api/whatsapp/conversations", isAuthenticated, async (req, res) => {
    try {
      const { phone, name } = req.body;
      if (!phone || !name) {
        return res.status(400).json({ message: "Phone and name are required" });
      }
      const conversation = await storage.getOrCreateConversation(phone, name);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating WhatsApp conversation:", error);
      res.status(500).json({ message: "Failed to create WhatsApp conversation" });
    }
  });
  app2.put("/api/whatsapp/conversations/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isOnline } = req.body;
      const conversation = await storage.updateConversationStatus(id, isOnline);
      res.json(conversation);
    } catch (error) {
      console.error("Error updating conversation status:", error);
      res.status(500).json({ message: "Failed to update conversation status" });
    }
  });
  app2.get("/api/whatsapp/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching WhatsApp messages:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp messages" });
    }
  });
  app2.post("/api/whatsapp/messages", isAuthenticated, async (req, res) => {
    try {
      const messageData = req.body;
      if (!messageData.timestamp) {
        messageData.timestamp = /* @__PURE__ */ new Date();
      }
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating WhatsApp message:", error);
      res.status(500).json({ message: "Failed to create WhatsApp message" });
    }
  });
  app2.put("/api/whatsapp/messages/:messageId/status", isAuthenticated, async (req, res) => {
    try {
      const messageId = req.params.messageId;
      const { status } = req.body;
      const message = await storage.updateMessageStatus(messageId, status);
      res.json(message);
    } catch (error) {
      console.error("Error updating message status:", error);
      res.status(500).json({ message: "Failed to update message status" });
    }
  });
  app2.post("/api/whatsapp/send", isAuthenticated, async (req, res) => {
    try {
      const sendMessageSchema = z2.object({
        phone: z2.string().min(1, "Phone is required"),
        message: z2.string().min(1, "Message is required")
      });
      const validationResult = sendMessageSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request payload",
          errors: validationResult.error.errors
        });
      }
      const { phone, message } = validationResult.data;
      const WHATSAPP_SERVER_URL = "https://mondial-whatsapp-server.onrender.com";
      const response = await fetch(`${WHATSAPP_SERVER_URL}/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone, message })
      });
      if (!response.ok) {
        throw new Error(`WhatsApp server responded with status: ${response.status}`);
      }
      const result = await response.json();
      const conversation = await storage.getOrCreateConversation(phone, "Usuario");
      const messageData = insertWhatsappMessageSchema.parse({
        conversationId: conversation.id,
        messageId: result.messageId || `local_${Date.now()}`,
        type: "text",
        content: message,
        fromMe: true,
        timestamp: /* @__PURE__ */ new Date(),
        status: "sent"
      });
      await storage.createMessage(messageData);
      res.json(result);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
