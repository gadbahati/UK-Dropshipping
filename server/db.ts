import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, activationRequests, pickupRequests, withdrawalRequests, shipments } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
    const values: InsertUser = {
      openId: user.openId,
    };
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(users.createdAt);
}

export async function updateUserRegistrationStatus(userId: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) return null;

  const result = await db.update(users).set({ registrationStatus: status }).where(eq(users.id, userId));
  return result;
}

export async function updateUserActivationStatus(userId: number, status: "inactive" | "active" | "suspended") {
  const db = await getDb();
  if (!db) return null;

  const result = await db.update(users).set({ activationStatus: status }).where(eq(users.id, userId));
  return result;
}

export async function updateUserPickupStatus(userId: number, status: "pending" | "approved_for_pickup" | "pickup_completed") {
  const db = await getDb();
  if (!db) return null;

  const result = await db.update(users).set({ pickupStatus: status }).where(eq(users.id, userId));
  return result;
}

export async function createActivationRequest(userId: number, mpesaCode: string, amount: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(activationRequests).values({
    userId,
    mpesaTransactionCode: mpesaCode,
    amount: amount as any,
  });
  return result;
}

export async function getActivationRequestsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activationRequests).where(eq(activationRequests.userId, userId));
}

export async function getAllActivationRequests() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activationRequests).orderBy(activationRequests.createdAt);
}

export async function updateActivationRequestStatus(requestId: number, status: "pending" | "approved" | "rejected", adminNotes?: string) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (status === "approved") {
    updateData.approvedAt = new Date();
  }
  if (adminNotes) {
    updateData.adminNotes = adminNotes;
  }

  const result = await db.update(activationRequests).set(updateData).where(eq(activationRequests.id, requestId));
  return result;
}

export async function createPickupRequest(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(pickupRequests).values({ userId });
  return result;
}

export async function getPickupRequestsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pickupRequests).where(eq(pickupRequests.userId, userId));
}

export async function getAllPickupRequests() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(pickupRequests).orderBy(pickupRequests.createdAt);
}

export async function updatePickupRequestStatus(requestId: number, status: "pending" | "approved" | "rejected" | "completed", adminNotes?: string) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (status === "approved") {
    updateData.approvedAt = new Date();
  }
  if (status === "completed") {
    updateData.completedAt = new Date();
  }
  if (adminNotes) {
    updateData.adminNotes = adminNotes;
  }

  const result = await db.update(pickupRequests).set(updateData).where(eq(pickupRequests.id, requestId));
  return result;
}

export async function createWithdrawalRequest(userId: number, amount: string, mpesaNumber: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(withdrawalRequests).values({
    userId,
    amount: amount as any,
    mpesaNumber,
  });
  return result;
}

export async function getWithdrawalRequestsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.userId, userId));
}

export async function getAllWithdrawalRequests() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(withdrawalRequests).orderBy(withdrawalRequests.createdAt);
}

export async function updateWithdrawalRequestStatus(requestId: number, status: "pending" | "approved" | "rejected" | "completed", adminNotes?: string) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (status === "approved") {
    updateData.approvedAt = new Date();
  }
  if (status === "completed") {
    updateData.completedAt = new Date();
  }
  if (adminNotes) {
    updateData.adminNotes = adminNotes;
  }

  const result = await db.update(withdrawalRequests).set(updateData).where(eq(withdrawalRequests.id, requestId));
  return result;
}

export async function getShipmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(shipments).where(eq(shipments.userId, userId));
}

export async function getUserTotalProfit(userId: number) {
  const db = await getDb();
  if (!db) return "0";

  const result = await db.select().from(shipments).where(eq(shipments.userId, userId));
  const total = result.reduce((sum, shipment) => sum + (parseFloat(shipment.profit || "0") || 0), 0);
  return total.toFixed(2);
}
