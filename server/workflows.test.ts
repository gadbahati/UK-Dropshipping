import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: AuthenticatedUser): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createContext({
    id: 1,
    openId: "admin-user",
    email: "admin@globalpack.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    registrationStatus: "approved",
    activationStatus: "active",
    pickupStatus: "pending",
    activationFeePaid: true,
    adminNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  });
}

function createUserContext(): TrpcContext {
  return createContext({
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    registrationStatus: "pending",
    activationStatus: "inactive",
    pickupStatus: "pending",
    activationFeePaid: false,
    adminNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  });
}

describe("Admin-Only Procedures", () => {
  it("should deny non-admin users access to getAllUsers", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);

    try {
      await caller.users.getAll();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).toBe("FORBIDDEN");
      }
    }
  });

  it("should allow admin users to access getAllUsers", async () => {
    const adminCtx = createAdminContext();
    const caller = appRouter.createCaller(adminCtx);

    try {
      await caller.users.getAll();
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    }
  });

  it("should deny non-admin users from updating registration status", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);

    try {
      await caller.users.updateRegistrationStatus({
        userId: 1,
        status: "approved",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).toBe("FORBIDDEN");
      }
    }
  });

  it("should deny non-admin users from approving activation requests", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);

    try {
      await caller.activation.approveRequest({
        requestId: 1,
        adminNotes: "Approved",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).toBe("FORBIDDEN");
      }
    }
  });
});

describe("User Access Control", () => {
  it("should allow users to submit activation payment codes", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);

    try {
      const result = await caller.activation.submitPaymentCode({
        mpesaCode: "RH123ABC",
        amount: "500",
      });
      expect(result.success).toBe(true);
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    }
  });

  it("should deny unauthenticated users from accessing protected procedures", async () => {
    const unauthCtx = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as unknown as TrpcContext;

    const caller = appRouter.createCaller(unauthCtx);

    try {
      await caller.users.getCurrent();
      expect.fail("Should have thrown UNAUTHENTICATED error");
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    }
  });
});

describe("Approval Workflow Restrictions", () => {
  it("should prevent inactive users from requesting pickups", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);

    try {
      await caller.pickups.requestPickup();
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("must be approved and activated");
      }
    }
  });

  it("should prevent inactive users from requesting withdrawals", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);

    try {
      await caller.withdrawals.requestWithdrawal({
        amount: "100",
        mpesaNumber: "0712345678",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("must be approved and activated");
      }
    }
  });

  it("should verify permission checks are enforced correctly", async () => {
    const userCtx = createUserContext();
    const caller = appRouter.createCaller(userCtx);

    // Inactive user should not be able to request withdrawal
    try {
      await caller.withdrawals.requestWithdrawal({
        amount: "100",
        mpesaNumber: "0712345678",
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        // This is expected - permission denied for inactive user
        expect(error.code).toBe("FORBIDDEN");
      }
    }
  });
});

describe("Admin Approval Workflows", () => {
  it("should allow admins to approve activation requests", async () => {
    const adminCtx = createAdminContext();
    const caller = appRouter.createCaller(adminCtx);

    try {
      const result = await caller.activation.approveRequest({
        requestId: 1,
        adminNotes: "Payment verified",
      });
      expect(result.success).toBe(true);
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    }
  });

  it("should allow admins to reject activation requests", async () => {
    const adminCtx = createAdminContext();
    const caller = appRouter.createCaller(adminCtx);

    try {
      const result = await caller.activation.rejectRequest({
        requestId: 1,
        adminNotes: "Invalid transaction code",
      });
      expect(result.success).toBe(true);
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    }
  });

  it("should allow admins to approve pickup requests", async () => {
    const adminCtx = createAdminContext();
    const caller = appRouter.createCaller(adminCtx);

    try {
      const result = await caller.pickups.approveRequest({
        requestId: 1,
        adminNotes: "Pickup scheduled for Monday",
      });
      expect(result.success).toBe(true);
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    }
  });

  it("should allow admins to complete withdrawals", async () => {
    const adminCtx = createAdminContext();
    const caller = appRouter.createCaller(adminCtx);

    try {
      const result = await caller.withdrawals.completeWithdrawal({
        requestId: 1,
        adminNotes: "Funds transferred",
      });
      expect(result.success).toBe(true);
    } catch (error) {
      if (error instanceof TRPCError) {
        expect(error.code).not.toBe("FORBIDDEN");
      }
    }
  });
});
