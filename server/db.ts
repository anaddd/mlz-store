import { eq, desc, sql, and, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, products, cartItems, orders, orderItems } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ---- Categories ----
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function createCategory(data: { name: string; slug: string; description?: string; imageUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(categories).values(data);
  return result;
}

export async function updateCategory(id: number, data: Partial<{ name: string; slug: string; description: string; imageUrl: string }>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ---- Products ----
export async function getAllProducts(opts?: { categoryId?: number; search?: string; activeOnly?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.activeOnly) conditions.push(eq(products.isActive, true));
  if (opts?.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
  if (opts?.search) conditions.push(or(like(products.name, `%${opts.search}%`), like(products.description, `%${opts.search}%`)));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(products).where(where).orderBy(desc(products.createdAt));
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(and(eq(products.isFeatured, true), eq(products.isActive, true))).limit(8);
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: {
  name: string; slug: string; description?: string; price: string;
  comparePrice?: string; imageUrl?: string; categoryId?: number;
  stock?: number; isActive?: boolean; isFeatured?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(products).values(data);
}

export async function updateProduct(id: number, data: Partial<{
  name: string; slug: string; description: string; price: string;
  comparePrice: string; imageUrl: string; categoryId: number;
  stock: number; isActive: boolean; isFeatured: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(products).where(eq(products.id, id));
}

// ---- Cart ----
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  const result = [];
  for (const item of items) {
    const product = await getProductById(item.productId);
    if (product) result.push({ ...item, product });
  }
  return result;
}

export async function addToCart(userId: number, productId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await db.select().from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId))).limit(1);
  if (existing.length > 0) {
    await db.update(cartItems).set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function updateCartItem(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
  }
}

export async function removeCartItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ---- Orders ----
export async function createOrder(data: {
  userId: number; totalAmount: string;
  paymentMethod: "paypal" | "bank_transfer";
  notes?: string; discordUsername?: string;
  items: { productId: number; productName: string; quantity: number; price: string }[];
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [orderResult] = await db.insert(orders).values({
    userId: data.userId,
    totalAmount: data.totalAmount,
    paymentMethod: data.paymentMethod,
    paymentStatus: "unpaid",
    notes: data.notes,
    discordUsername: data.discordUsername,
    status: "pending",
  }).$returningId();
  const orderId = orderResult.id;
  for (const item of data.items) {
    await db.insert(orderItems).values({ orderId, ...item });
  }
  return orderId;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  const result = [];
  for (const order of userOrders) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    result.push({ ...order, items });
  }
  return result;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  const allOrders = await db.select({
    order: orders,
    userName: users.name,
    userEmail: users.email,
  }).from(orders).leftJoin(users, eq(orders.userId, users.id)).orderBy(desc(orders.createdAt));
  const result = [];
  for (const row of allOrders) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, row.order.id));
    result.push({ ...row.order, userName: row.userName, userEmail: row.userEmail, items });
  }
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (result.length === 0) return undefined;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const user = await db.select().from(users).where(eq(users.id, result[0].userId)).limit(1);
  return { ...result[0], items, user: user[0] };
}

export async function updateOrderStatus(id: number, status: "pending" | "processing" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrderPaymentStatus(id: number, paymentStatus: "unpaid" | "pending_verification" | "paid") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set({ paymentStatus }).where(eq(orders.id, id));
}

// ---- Admin Stats ----
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalUsers: 0, recentOrders: [] };
  const [orderStats] = await db.select({
    total: sql<number>`COUNT(*)`,
    revenue: sql<number>`COALESCE(SUM(CAST(totalAmount AS DECIMAL(10,2))), 0)`,
  }).from(orders).where(eq(orders.status, "completed"));
  const [productCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(products);
  const [userCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const recentOrders = await db.select({
    order: orders,
    userName: users.name,
  }).from(orders).leftJoin(users, eq(orders.userId, users.id)).orderBy(desc(orders.createdAt)).limit(5);
  return {
    totalOrders: orderStats.total,
    totalRevenue: orderStats.revenue,
    totalProducts: productCount.count,
    totalUsers: userCount.count,
    recentOrders: recentOrders.map(r => ({ ...r.order, userName: r.userName })),
  };
}

// ---- Users (Admin) ----
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(users).set({ role }).where(eq(users.id, id));
}
