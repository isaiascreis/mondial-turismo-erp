import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { insertClientSchema, insertSupplierSchema, insertSellerSchema, insertSaleSchema, insertServiceSchema, insertFinancialAccountSchema, insertBankAccountSchema, insertAccountCategorySchema, insertBankTransactionSchema, insertUserSchema, updateUserSchema, insertWhatsappConversationSchema, insertWhatsappMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupSimpleAuth(app);

  // Authorization middleware for user management
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user || user.systemRole !== 'admin') {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem gerenciar usuários." });
      }
      
      next();
    } catch (error) {
      console.error("Error in requireAdmin middleware:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  };

  // Dashboard routes
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get('/api/dashboard/operations', isAuthenticated, async (req, res) => {
    try {
      const operations = await storage.getWeeklyOperations();
      res.json(operations);
    } catch (error) {
      console.error("Error fetching operations:", error);
      res.status(500).json({ message: "Failed to fetch operations" });
    }
  });

  app.get('/api/dashboard/sales-ranking', isAuthenticated, async (req, res) => {
    try {
      const ranking = await storage.getSalesRanking();
      res.json(ranking);
    } catch (error) {
      console.error("Error fetching sales ranking:", error);
      res.status(500).json({ message: "Failed to fetch sales ranking" });
    }
  });

  // Client routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      const clients = await storage.getClients(search as string);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req, res) => {
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
      res.status(500).json({ message: `Failed to create client: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteClient(id);
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Supplier routes
  app.get('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const { search } = req.query;
      const suppliers = await storage.getSuppliers(search as string);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post('/api/suppliers', isAuthenticated, async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.put('/api/suppliers/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/suppliers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSupplier(id);
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Seller routes
  app.get('/api/sellers', isAuthenticated, async (req, res) => {
    try {
      const sellers = await storage.getSellers();
      res.json(sellers);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      res.status(500).json({ message: "Failed to fetch sellers" });
    }
  });

  app.post('/api/sellers', isAuthenticated, async (req, res) => {
    try {
      const sellerData = insertSellerSchema.parse(req.body);
      const seller = await storage.createSeller(sellerData);
      res.json(seller);
    } catch (error) {
      console.error("Error creating seller:", error);
      res.status(500).json({ message: "Failed to create seller" });
    }
  });

  // User management routes (for sellers management)
  app.get('/api/users', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, requireAdmin, async (req, res) => {
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
      // Check if it's a Zod validation error
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: (error as any).issues?.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  });

  app.patch('/api/users/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      console.log("PATCH /api/users/:id - Request body:", JSON.stringify(req.body, null, 2));
      const id = req.params.id;
      const userData = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(id, userData);
      console.log("PATCH /api/users/:id - Updated user:", JSON.stringify(user, null, 2));
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      // Check if it's a Zod validation error
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: (error as any).issues?.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Sales routes
  app.get('/api/sales', isAuthenticated, async (req, res) => {
    try {
      const { status, clientId, dateFrom, dateTo } = req.query;
      const sales = await storage.getSales({
        status: status as string,
        clientId: clientId ? parseInt(clientId as string) : undefined,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      });
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get('/api/sales/:id', isAuthenticated, async (req, res) => {
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

  app.post('/api/sales', isAuthenticated, async (req, res) => {
    try {
      const saleData = req.body;
      const sale = await storage.createSale(saleData);
      res.json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.put('/api/sales/:id', isAuthenticated, async (req, res) => {
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

  app.put('/api/sales/:id/status', isAuthenticated, async (req, res) => {
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

  // Financial routes
  app.get('/api/financial-accounts', isAuthenticated, async (req, res) => {
    try {
      const { tipo, status, search } = req.query;
      const accounts = await storage.getFinancialAccounts({
        tipo: tipo as string,
        status: status as string,
        search: search as string,
      });
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching financial accounts:", error);
      res.status(500).json({ message: "Failed to fetch financial accounts" });
    }
  });

  app.post('/api/financial-accounts', isAuthenticated, async (req, res) => {
    try {
      const accountData = insertFinancialAccountSchema.parse(req.body);
      const account = await storage.createFinancialAccount(accountData);
      res.json(account);
    } catch (error) {
      console.error("Error creating financial account:", error);
      res.status(500).json({ message: "Failed to create financial account" });
    }
  });

  app.put('/api/financial-accounts/:id/liquidate', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { valor, contaBancariaId, dataLiquidacao, categoriaId, anexos } = req.body;
      const result = await storage.liquidateFinancialAccount(id, {
        valor: parseFloat(valor),
        contaBancariaId: parseInt(contaBancariaId),
        dataLiquidacao,
        categoriaId: parseInt(categoriaId),
        anexos,
      });
      res.json(result);
    } catch (error) {
      console.error("Error liquidating financial account:", error);
      res.status(500).json({ message: "Failed to liquidate financial account" });
    }
  });

  // Banking routes
  app.get('/api/bank-accounts', isAuthenticated, async (req, res) => {
    try {
      const accounts = await storage.getBankAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      res.status(500).json({ message: "Failed to fetch bank accounts" });
    }
  });

  app.post('/api/bank-accounts', isAuthenticated, async (req, res) => {
    try {
      const accountData = insertBankAccountSchema.parse(req.body);
      const account = await storage.createBankAccount(accountData);
      res.json(account);
    } catch (error) {
      console.error("Error creating bank account:", error);
      res.status(500).json({ message: "Failed to create bank account" });
    }
  });

  app.get('/api/bank-accounts/:id/transactions', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { dateFrom, dateTo } = req.query;
      const transactions = await storage.getBankTransactions(id, {
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching bank transactions:", error);
      res.status(500).json({ message: "Failed to fetch bank transactions" });
    }
  });

  app.post('/api/bank-transactions', isAuthenticated, async (req, res) => {
    try {
      const transactionData = insertBankTransactionSchema.parse(req.body);
      const transaction = await storage.createBankTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating bank transaction:", error);
      res.status(500).json({ message: "Failed to create bank transaction" });
    }
  });

  // Account Categories routes
  app.get('/api/account-categories', isAuthenticated, async (req, res) => {
    try {
      const { tipo } = req.query;
      const categories = await storage.getAccountCategories(tipo as string);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching account categories:", error);
      res.status(500).json({ message: "Failed to fetch account categories" });
    }
  });

  app.post('/api/account-categories', isAuthenticated, async (req, res) => {
    try {
      const categoryData = insertAccountCategorySchema.parse(req.body);
      const category = await storage.createAccountCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating account category:", error);
      res.status(500).json({ message: "Failed to create account category" });
    }
  });

  app.put('/api/account-categories/:id', isAuthenticated, async (req, res) => {
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

  app.delete('/api/account-categories/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAccountCategory(id);
      res.json({ message: "Account category deleted successfully" });
    } catch (error) {
      console.error("Error deleting account category:", error);
      res.status(500).json({ message: "Failed to delete account category" });
    }
  });

  // WhatsApp webhook for receiving messages (public endpoint with security)
  app.post('/api/whatsapp/webhook', async (req, res) => {
    try {
      // Security check - webhook token validation (required env var)
      const expectedToken = process.env.WHATSAPP_WEBHOOK_TOKEN;
      if (!expectedToken) {
        console.error("WHATSAPP_WEBHOOK_TOKEN environment variable not set");
        return res.status(500).json({ message: "Server configuration error" });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        return res.status(401).json({ message: "Unauthorized webhook access" });
      }

      // Validate webhook payload with Zod
      const webhookSchema = z.object({
        phone: z.string().min(1, "Phone is required"),
        name: z.string().optional(),
        message: z.string().min(1, "Message content is required"),
        messageId: z.string().optional(),
        type: z.string().default('text'),
        timestamp: z.string().optional()
      });

      const validationResult = webhookSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.warn("Invalid webhook payload:", validationResult.error.errors);
        return res.status(400).json({ 
          message: "Invalid webhook payload", 
          errors: validationResult.error.errors 
        });
      }

      const { phone, name, message, messageId, type, timestamp } = validationResult.data;
      console.log("Received WhatsApp webhook:", { phone, messageId });

      // Get or create conversation
      const conversation = await storage.getOrCreateConversation(phone, name || "Contact");

      // Save received message to database
      const messageData = {
        conversationId: conversation.id,
        messageId: messageId || `webhook_${Date.now()}`,
        type: type,
        content: message,
        fromMe: false, // Received message
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        status: 'received',
      };
      
      const savedMessage = await storage.createMessage(messageData);
      console.log("WhatsApp message received and saved:", savedMessage.messageId);

      // Respond quickly to webhook
      res.status(200).json({ success: true, message: "Message received" });
    } catch (error) {
      console.error("Error processing WhatsApp webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // WhatsApp API routes (authenticated)
  app.get('/api/whatsapp/conversations', isAuthenticated, async (req, res) => {
    try {
      const conversations = await storage.getWhatsAppConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching WhatsApp conversations:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp conversations" });
    }
  });

  app.post('/api/whatsapp/conversations', isAuthenticated, async (req, res) => {
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

  app.put('/api/whatsapp/conversations/:id/status', isAuthenticated, async (req, res) => {
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

  app.get('/api/whatsapp/conversations/:id/messages', isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching WhatsApp messages:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp messages" });
    }
  });

  app.post('/api/whatsapp/messages', isAuthenticated, async (req, res) => {
    try {
      const messageData = req.body;
      // Adiciona timestamp se não fornecido
      if (!messageData.timestamp) {
        messageData.timestamp = new Date();
      }
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating WhatsApp message:", error);
      res.status(500).json({ message: "Failed to create WhatsApp message" });
    }
  });

  app.put('/api/whatsapp/messages/:messageId/status', isAuthenticated, async (req, res) => {
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

  // Proxy route for sending messages to external WhatsApp server
  app.post('/api/whatsapp/send', isAuthenticated, async (req, res) => {
    try {
      // Validate send message payload
      const sendMessageSchema = z.object({
        phone: z.string().min(1, "Phone is required"),
        message: z.string().min(1, "Message is required")
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
      
      // Forward the request to external WhatsApp server
      const response = await fetch(`${WHATSAPP_SERVER_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, message }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp server responded with status: ${response.status}`);
      }

      const result = await response.json();
      
      // Save sent message to local database
      const conversation = await storage.getOrCreateConversation(phone, "Usuario");
      
      // Validate message data with Zod
      const messageData = insertWhatsappMessageSchema.parse({
        conversationId: conversation.id,
        messageId: result.messageId || `local_${Date.now()}`,
        type: 'text',
        content: message,
        fromMe: true,
        timestamp: new Date(),
        status: 'sent',
      });

      await storage.createMessage(messageData);

      res.json(result);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
