import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, InsertLead, leads, Lead, InsertPatientMessage, patientMessages, PatientMessage } from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";

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

// ============ Lead/CRM Functions ============

/**
 * Create a new lead from contact form submission
 */
export async function createLead(lead: Omit<InsertLead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create lead: database not available");
    return null;
  }

  try {
    const id = nanoid();
    const newLead: InsertLead = {
      id,
      ...lead,
    };

    await db.insert(leads).values(newLead);
    
    // Fetch and return the created lead
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create lead:", error);
    throw error;
  }
}

/**
 * Get all leads, ordered by creation date (newest first)
 */
export async function getAllLeads(): Promise<Lead[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get leads: database not available");
    return [];
  }

  try {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get leads:", error);
    throw error;
  }
}

/**
 * Get a single lead by ID
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get lead: database not available");
    return null;
  }

  try {
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get lead:", error);
    throw error;
  }
}

/**
 * Update a lead's status and/or internal notes
 */
export async function updateLead(
  id: string, 
  updates: { status?: Lead['status']; internalNotes?: string | null }
): Promise<Lead | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update lead: database not available");
    return null;
  }

  try {
    await db.update(leads).set(updates).where(eq(leads.id, id));
    return await getLeadById(id);
  } catch (error) {
    console.error("[Database] Failed to update lead:", error);
    throw error;
  }
}

/**
 * Search leads with filters and sorting
 */
export interface LeadSearchParams {
  search?: string;
  status?: Lead['status'];
  interest?: Lead['interest'];
  state?: Lead['state'];
  sortBy?: 'createdAt' | 'updatedAt' | 'fullName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export async function searchLeads(params: LeadSearchParams): Promise<Lead[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search leads: database not available");
    return [];
  }

  try {
    const conditions = [];
    
    // Search by name or email
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      conditions.push(
        or(
          like(leads.fullName, searchTerm),
          like(leads.email, searchTerm),
          like(leads.phone, searchTerm)
        )
      );
    }
    
    // Filter by status
    if (params.status) {
      conditions.push(eq(leads.status, params.status));
    }
    
    // Filter by interest
    if (params.interest) {
      conditions.push(eq(leads.interest, params.interest));
    }
    
    // Filter by state
    if (params.state) {
      conditions.push(eq(leads.state, params.state));
    }
    
    // Build query
    let query = db.select().from(leads);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    // Sorting
    const sortColumn = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    
    const sortMap = {
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      fullName: leads.fullName,
      email: leads.email,
    };
    
    const column = sortMap[sortColumn];
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(column)) as typeof query;
    } else {
      query = query.orderBy(desc(column)) as typeof query;
    }
    
    return await query;
  } catch (error) {
    console.error("[Database] Failed to search leads:", error);
    throw error;
  }
}


// ============ Patient Message Functions ============

/**
 * Create a new patient message from AI chat
 */
export async function createPatientMessage(
  message: Omit<InsertPatientMessage, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PatientMessage | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create patient message: database not available");
    return null;
  }

  try {
    const id = nanoid();
    const newMessage: InsertPatientMessage = {
      id,
      ...message,
    };

    await db.insert(patientMessages).values(newMessage);
    
    // Fetch and return the created message
    const result = await db.select().from(patientMessages).where(eq(patientMessages.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create patient message:", error);
    throw error;
  }
}

/**
 * Get all patient messages, ordered by creation date (newest first)
 */
export async function getAllPatientMessages(): Promise<PatientMessage[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get patient messages: database not available");
    return [];
  }

  try {
    return await db.select().from(patientMessages).orderBy(desc(patientMessages.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get patient messages:", error);
    throw error;
  }
}

/**
 * Get a single patient message by ID
 */
export async function getPatientMessageById(id: string): Promise<PatientMessage | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get patient message: database not available");
    return null;
  }

  try {
    const result = await db.select().from(patientMessages).where(eq(patientMessages.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get patient message:", error);
    throw error;
  }
}

/**
 * Update a patient message's status and/or staff notes
 */
export async function updatePatientMessage(
  id: string, 
  updates: { status?: PatientMessage['status']; staffNotes?: string | null }
): Promise<PatientMessage | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update patient message: database not available");
    return null;
  }

  try {
    await db.update(patientMessages).set(updates).where(eq(patientMessages.id, id));
    return await getPatientMessageById(id);
  } catch (error) {
    console.error("[Database] Failed to update patient message:", error);
    throw error;
  }
}

/**
 * Search patient messages with filters
 */
export interface PatientMessageSearchParams {
  search?: string;
  status?: PatientMessage['status'];
  category?: PatientMessage['category'];
  program?: PatientMessage['program'];
  urgency?: PatientMessage['urgency'];
  sortOrder?: 'asc' | 'desc';
}

export async function searchPatientMessages(params: PatientMessageSearchParams): Promise<PatientMessage[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot search patient messages: database not available");
    return [];
  }

  try {
    const conditions = [];
    
    if (params.search) {
      const searchTerm = `%${params.search}%`;
      conditions.push(
        or(
          like(patientMessages.patientName, searchTerm),
          like(patientMessages.email, searchTerm),
          like(patientMessages.message, searchTerm)
        )
      );
    }
    
    if (params.status) {
      conditions.push(eq(patientMessages.status, params.status));
    }
    
    if (params.category) {
      conditions.push(eq(patientMessages.category, params.category));
    }
    
    if (params.program) {
      conditions.push(eq(patientMessages.program, params.program));
    }
    
    if (params.urgency) {
      conditions.push(eq(patientMessages.urgency, params.urgency));
    }
    
    let query = db.select().from(patientMessages);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    const sortOrder = params.sortOrder || 'desc';
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(patientMessages.createdAt)) as typeof query;
    } else {
      query = query.orderBy(desc(patientMessages.createdAt)) as typeof query;
    }
    
    return await query;
  } catch (error) {
    console.error("[Database] Failed to search patient messages:", error);
    throw error;
  }
}
