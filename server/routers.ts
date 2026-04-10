import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { DISCORD_WEBHOOK, ORDER_STATUSES } from "../shared/constants";
import axios from "axios";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

async function sendDiscordNotification(title: string, description: string, color: number = 0xcc0000) {
  try {
    await axios.post(DISCORD_WEBHOOK, {
      embeds: [{
        title,
        description,
        color,
        timestamp: new Date().toISOString(),
        footer: { text: "MLZ Store" },
      }],
    });
  } catch (e) {
    console.error("[Discord] Failed to send notification:", e);
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  categories: router({
    list: publicProcedure.query(() => db.getAllCategories()),
    create: adminProcedure.input(z.object({
      name: z.string().min(1), slug: z.string().min(1), description: z.string().optional(), imageUrl: z.string().optional(),
    })).mutation(({ input }) => db.createCategory(input)),
    update: adminProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), slug: z.string().optional(), description: z.string().optional(), imageUrl: z.string().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateCategory(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteCategory(input.id)),
  }),

  products: router({
    list: publicProcedure.input(z.object({
      categoryId: z.number().optional(), search: z.string().optional(),
    }).optional()).query(({ input }) => db.getAllProducts({ ...input, activeOnly: true })),
    featured: publicProcedure.query(() => db.getFeaturedProducts()),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => db.getProductBySlug(input.slug)),
    // Admin
    listAll: adminProcedure.input(z.object({
      categoryId: z.number().optional(), search: z.string().optional(),
    }).optional()).query(({ input }) => db.getAllProducts(input)),
    create: adminProcedure.input(z.object({
      name: z.string().min(1), slug: z.string().min(1), description: z.string().optional(),
      price: z.string(), comparePrice: z.string().optional(), imageUrl: z.string().optional(),
      categoryId: z.number().optional(), stock: z.number().optional(),
      isActive: z.boolean().optional(), isFeatured: z.boolean().optional(),
    })).mutation(({ input }) => db.createProduct(input)),
    update: adminProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), slug: z.string().optional(), description: z.string().optional(),
      price: z.string().optional(), comparePrice: z.string().optional(), imageUrl: z.string().optional(),
      categoryId: z.number().optional(), stock: z.number().optional(),
      isActive: z.boolean().optional(), isFeatured: z.boolean().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return db.updateProduct(id, data);
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteProduct(input.id)),
  }),

  cart: router({
    list: protectedProcedure.query(({ ctx }) => db.getCartItems(ctx.user.id)),
    add: protectedProcedure.input(z.object({
      productId: z.number(), quantity: z.number().min(1).default(1),
    })).mutation(({ ctx, input }) => db.addToCart(ctx.user.id, input.productId, input.quantity)),
    update: protectedProcedure.input(z.object({
      id: z.number(), quantity: z.number(),
    })).mutation(({ input }) => db.updateCartItem(input.id, input.quantity)),
    remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.removeCartItem(input.id)),
    clear: protectedProcedure.mutation(({ ctx }) => db.clearCart(ctx.user.id)),
  }),

  orders: router({
    myOrders: protectedProcedure.query(({ ctx }) => db.getUserOrders(ctx.user.id)),
    generateInvoice: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.userId !== ctx.user.id && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const invoiceData = {
        orderNumber: order.id,
        customerName: order.user?.name || "Guest",
        customerEmail: order.user?.email || "N/A",
        createdAt: order.createdAt,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentMethod: (order as any).paymentMethod,
        paymentStatus: (order as any).paymentStatus,
        status: order.status,
      };
      return invoiceData;
    }),
    create: protectedProcedure.input(z.object({
      notes: z.string().optional(),
      discordUsername: z.string().optional(),
      paymentMethod: z.enum(["paypal", "bank_transfer"]),
    })).mutation(async ({ ctx, input }) => {
      const cartItems = await db.getCartItems(ctx.user.id);
      if (cartItems.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
      const totalAmount = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
      const orderId = await db.createOrder({
        userId: ctx.user.id,
        totalAmount: totalAmount.toFixed(2),
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        discordUsername: input.discordUsername,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });
      await db.clearCart(ctx.user.id);
      const paymentLabel = input.paymentMethod === "paypal" ? "PayPal" : "Bank Transfer (Al Rajhi)";
      const itemsList = cartItems.map(i => `- ${i.product.name} x${i.quantity} ($${i.product.price})`).join("\n");
      await sendDiscordNotification(
        `\u{1F6D2} New Order #${orderId}`,
        `**Customer:** ${ctx.user.name || ctx.user.email || "Unknown"}\n**Discord:** ${input.discordUsername || "N/A"}\n**Payment:** ${paymentLabel}\n**Total:** $${totalAmount.toFixed(2)}\n\n**Items:**\n${itemsList}\n\n**Action Required:** Customer needs to open a ticket in Discord with Order #${orderId} and payment receipt.`,
        0x00cc00
      );
      return { orderId, totalAmount: totalAmount.toFixed(2) };
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.userId !== ctx.user.id && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return order;
    }),
    // Admin
    listAll: adminProcedure.query(() => db.getAllOrders()),
    updateStatus: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["pending", "processing", "completed", "cancelled"]),
    })).mutation(async ({ input }) => {
      await db.updateOrderStatus(input.id, input.status);
      const order = await db.getOrderById(input.id);
      const statusInfo = ORDER_STATUSES[input.status];
      const colorMap = { pending: 0xffcc00, processing: 0x0099ff, completed: 0x00cc00, cancelled: 0xcc0000 };
      await sendDiscordNotification(
        `Order #${input.id} Status Updated`,
        `**Status:** ${statusInfo.label} (${statusInfo.labelEn})\n**Customer:** ${order?.user?.name || "Unknown"}`,
        colorMap[input.status]
      );
      return { success: true };
    }),
    updatePaymentStatus: adminProcedure.input(z.object({
      id: z.number(),
      paymentStatus: z.enum(["unpaid", "pending_verification", "paid"]),
    })).mutation(async ({ input }) => {
      await db.updateOrderPaymentStatus(input.id, input.paymentStatus);
      const order = await db.getOrderById(input.id);
      const statusMap = { unpaid: "Unpaid", pending_verification: "Pending Verification", paid: "Paid" };
      const colorMap = { unpaid: 0xcc0000, pending_verification: 0xffcc00, paid: 0x00cc00 };
      await sendDiscordNotification(
        `Payment Status Updated - Order #${input.id}`,
        `**Payment Status:** ${statusMap[input.paymentStatus]}\n**Customer:** ${order?.user?.name || "Unknown"}`,
        colorMap[input.paymentStatus]
      );
      return { success: true };
    }),
  }),

  admin: router({
    stats: adminProcedure.query(() => db.getAdminStats()),
    users: adminProcedure.query(() => db.getAllUsers()),
    updateUserRole: adminProcedure.input(z.object({
      id: z.number(), role: z.enum(["user", "admin"]),
    })).mutation(({ input }) => db.updateUserRole(input.id, input.role)),
  }),
});

export type AppRouter = typeof appRouter;
