import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User management procedures
  users: router({
    // Get current user details
    getCurrent: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      return user;
    }),

    // Admin: Get all users
    getAll: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    // Admin: Get single user
    getById: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getUserById(input.id);
    }),

    // Admin: Update user registration status
    updateRegistrationStatus: adminProcedure
      .input(z.object({ userId: z.number(), status: z.enum(["pending", "approved", "rejected"]) }))
      .mutation(async ({ input }) => {
        await db.updateUserRegistrationStatus(input.userId, input.status);
        return { success: true };
      }),

    // Admin: Update user activation status
    updateActivationStatus: adminProcedure
      .input(z.object({ userId: z.number(), status: z.enum(["inactive", "active", "suspended"]) }))
      .mutation(async ({ input }) => {
        await db.updateUserActivationStatus(input.userId, input.status);
        return { success: true };
      }),

    // Admin: Update user pickup status
    updatePickupStatus: adminProcedure
      .input(z.object({ userId: z.number(), status: z.enum(["pending", "approved_for_pickup", "pickup_completed"]) }))
      .mutation(async ({ input }) => {
        await db.updateUserPickupStatus(input.userId, input.status);
        return { success: true };
      }),
  }),

  // Activation request procedures
  activation: router({
    // User: Submit M-Pesa transaction code for activation fee
    submitPaymentCode: protectedProcedure
      .input(z.object({ mpesaCode: z.string().min(1), amount: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await db.createActivationRequest(ctx.user.id, input.mpesaCode, input.amount);
        return { success: true };
      }),

    // User: Get their activation requests
    getMyRequests: protectedProcedure.query(async ({ ctx }) => {
      return await db.getActivationRequestsByUserId(ctx.user.id);
    }),

    // Admin: Get all activation requests
    getAllRequests: adminProcedure.query(async () => {
      return await db.getAllActivationRequests();
    }),

    // Admin: Approve activation request
    approveRequest: adminProcedure
      .input(z.object({ requestId: z.number(), adminNotes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.updateActivationRequestStatus(input.requestId, "approved", input.adminNotes);
        
        // Get the request to find the user
        const requests = await db.getAllActivationRequests();
        const request = requests.find(r => r.id === input.requestId);
        
        if (request) {
          // Mark activation fee as paid and activate the account
          await db.updateUserActivationStatus(request.userId, "active");
        }
        
        return { success: true };
      }),

    // Admin: Reject activation request
    rejectRequest: adminProcedure
      .input(z.object({ requestId: z.number(), adminNotes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.updateActivationRequestStatus(input.requestId, "rejected", input.adminNotes);
        return { success: true };
      }),
  }),

  // Pickup request procedures
  pickups: router({
    // User: Request pickup
    requestPickup: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      
      // Check if user is approved and activated
      if (user?.registrationStatus !== "approved" || user?.activationStatus !== "active") {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Account must be approved and activated to request pickup',
        });
      }

      await db.createPickupRequest(ctx.user.id);
      return { success: true };
    }),

    // User: Get their pickup requests
    getMyRequests: protectedProcedure.query(async ({ ctx }) => {
      return await db.getPickupRequestsByUserId(ctx.user.id);
    }),

    // Admin: Get all pickup requests
    getAllRequests: adminProcedure.query(async () => {
      return await db.getAllPickupRequests();
    }),

    // Admin: Approve pickup request
    approveRequest: adminProcedure
      .input(z.object({ requestId: z.number(), pickupDate: z.date().optional(), adminNotes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.updatePickupRequestStatus(input.requestId, "approved", input.adminNotes);
        return { success: true };
      }),

    // Admin: Reject pickup request
    rejectRequest: adminProcedure
      .input(z.object({ requestId: z.number(), adminNotes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.updatePickupRequestStatus(input.requestId, "rejected", input.adminNotes);
        return { success: true };
      }),

    // Admin: Mark pickup as completed
    completePickup: adminProcedure
      .input(z.object({ requestId: z.number(), adminNotes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.updatePickupRequestStatus(input.requestId, "completed", input.adminNotes);
        return { success: true };
      }),
  }),

  // Withdrawal request procedures
  withdrawals: router({
    // User: Request withdrawal
    requestWithdrawal: protectedProcedure
      .input(z.object({ amount: z.string(), mpesaNumber: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserById(ctx.user.id);
        
        // Check if user is approved and activated
        if (user?.registrationStatus !== "approved" || user?.activationStatus !== "active") {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Account must be approved and activated to request withdrawal',
          });
        }

        await db.createWithdrawalRequest(ctx.user.id, input.amount, input.mpesaNumber);
        return { success: true };
      }),

    // User: Get their withdrawal requests
    getMyRequests: protectedProcedure.query(async ({ ctx }) => {
      return await db.getWithdrawalRequestsByUserId(ctx.user.id);
    }),

    // Admin: Get all withdrawal requests
    getAllRequests: adminProcedure.query(async () => {
      return await db.getAllWithdrawalRequests();
    }),

    // Admin: Approve withdrawal request
    approveRequest: adminProcedure
      .input(z.object({ requestId: z.number(), adminNotes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.updateWithdrawalRequestStatus(input.requestId, "approved", input.adminNotes);
        return { success: true };
      }),

    // Admin: Reject withdrawal request
    rejectRequest: adminProcedure
      .input(z.object({ requestId: z.number(), adminNotes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.updateWithdrawalRequestStatus(input.requestId, "rejected", input.adminNotes);
        return { success: true };
      }),

    // Admin: Mark withdrawal as completed
    completeWithdrawal: adminProcedure
      .input(z.object({ requestId: z.number(), adminNotes: z.string().optional() }))
      .mutation(async ({ input }) => {
        await db.updateWithdrawalRequestStatus(input.requestId, "completed", input.adminNotes);
        return { success: true };
      }),
  }),

  // Shipment and profit procedures
  shipments: router({
    // User: Get their shipments
    getMyShipments: protectedProcedure.query(async ({ ctx }) => {
      return await db.getShipmentsByUserId(ctx.user.id);
    }),

    // User: Get total profit
    getMyTotalProfit: protectedProcedure.query(async ({ ctx }) => {
      const total = await db.getUserTotalProfit(ctx.user.id);
      return { totalProfit: total };
    }),
  }),
});

export type AppRouter = typeof appRouter;
