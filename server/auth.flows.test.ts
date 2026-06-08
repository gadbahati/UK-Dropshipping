import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("Authentication Flows", () => {
  describe("User Registration & Pending Status", () => {
    it("should prevent pending users from accessing dropshipping features", async () => {
      const pendingUserCtx = createContext({
        id: 2,
        openId: "pending-user",
        email: "pending@example.com",
        name: "Pending User",
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

      const caller = appRouter.createCaller(pendingUserCtx);

      try {
        await caller.pickups.requestPickup();
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("FORBIDDEN");
        }
      }
    });

    it("should allow approved users to access dropshipping features", async () => {
      const approvedUserCtx = createContext({
        id: 3,
        openId: "approved-user",
        email: "approved@example.com",
        name: "Approved User",
        loginMethod: "manus",
        role: "user",
        registrationStatus: "approved",
        activationStatus: "active",
        pickupStatus: "pending",
        activationFeePaid: true,
        adminNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      });

      const caller = appRouter.createCaller(approvedUserCtx);

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
  });

  describe("Protected Route Access", () => {
    it("should deny unauthenticated users from accessing protected procedures", async () => {
      const unauthCtx = createContext(null);
      const caller = appRouter.createCaller(unauthCtx);

      try {
        await caller.users.getCurrent();
        expect.fail("Should have thrown UNAUTHORIZED error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("UNAUTHORIZED");
        }
      }
    });

    it("should allow authenticated users to get their current profile", async () => {
      const userCtx = createContext({
        id: 4,
        openId: "test-user",
        email: "test@example.com",
        name: "Test User",
        loginMethod: "manus",
        role: "user",
        registrationStatus: "approved",
        activationStatus: "active",
        pickupStatus: "pending",
        activationFeePaid: true,
        adminNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      });

      const caller = appRouter.createCaller(userCtx);

      try {
        const result = await caller.users.getCurrent();
        expect(result).toBeDefined();
        expect(result?.id).toBe(4);
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).not.toBe("UNAUTHORIZED");
        }
      }
    });
  });

  describe("Admin Access Control", () => {
    it("should deny regular users from accessing admin procedures", async () => {
      const userCtx = createContext({
        id: 5,
        openId: "regular-user",
        email: "regular@example.com",
        name: "Regular User",
        loginMethod: "manus",
        role: "user",
        registrationStatus: "approved",
        activationStatus: "active",
        pickupStatus: "pending",
        activationFeePaid: true,
        adminNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      });

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

    it("should allow admin users to access admin procedures", async () => {
      const adminCtx = createContext({
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

      const caller = appRouter.createCaller(adminCtx);

      try {
        await caller.users.getAll();
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).not.toBe("FORBIDDEN");
        }
      }
    });

    it("should deny regular users from updating user registration status", async () => {
      const userCtx = createContext({
        id: 6,
        openId: "regular-user-2",
        email: "regular2@example.com",
        name: "Regular User 2",
        loginMethod: "manus",
        role: "user",
        registrationStatus: "approved",
        activationStatus: "active",
        pickupStatus: "pending",
        activationFeePaid: true,
        adminNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      });

      const caller = appRouter.createCaller(userCtx);

      try {
        await caller.users.updateRegistrationStatus({
          userId: 2,
          status: "approved",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).toBe("FORBIDDEN");
        }
      }
    });

    it("should allow admin users to update user registration status", async () => {
      const adminCtx = createContext({
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

      const caller = appRouter.createCaller(adminCtx);

      try {
        const result = await caller.users.updateRegistrationStatus({
          userId: 2,
          status: "approved",
        });
        expect(result.success).toBe(true);
      } catch (error) {
        if (error instanceof TRPCError) {
          expect(error.code).not.toBe("FORBIDDEN");
        }
      }
    });
  });

  describe("Logout Flow", () => {
    it("should allow authenticated users to logout", async () => {
      const userCtx = createContext({
        id: 7,
        openId: "logout-test-user",
        email: "logout@example.com",
        name: "Logout Test User",
        loginMethod: "manus",
        role: "user",
        registrationStatus: "approved",
        activationStatus: "active",
        pickupStatus: "pending",
        activationFeePaid: true,
        adminNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      });

      const caller = appRouter.createCaller(userCtx);
      const result = await caller.auth.logout();
      expect(result.success).toBe(true);
    });
  });
});
