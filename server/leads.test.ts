import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createLead: vi.fn().mockResolvedValue({
    id: "test-lead-id",
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "555-123-4567",
    state: "PA",
    interest: "WEIGHT_LOSS",
    preferredContactMethod: "EMAIL",
    preferredContactTime: "Mornings",
    status: "NEW",
    message: "Test message",
    source: "website_contact_form",
    internalNotes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  searchLeads: vi.fn().mockResolvedValue([
    {
      id: "test-lead-1",
      fullName: "Jane Doe",
      email: "jane@example.com",
      status: "NEW",
      interest: "WEIGHT_LOSS",
      state: "PA",
      preferredContactMethod: "EMAIL",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "test-lead-2",
      fullName: "John Smith",
      email: "john@example.com",
      status: "CONTACTED",
      interest: "MENOPAUSE_HRT",
      state: "PA",
      preferredContactMethod: "PHONE",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getLeadById: vi.fn().mockResolvedValue({
    id: "test-lead-1",
    fullName: "Jane Doe",
    email: "jane@example.com",
    status: "NEW",
    interest: "WEIGHT_LOSS",
    state: "PA",
    preferredContactMethod: "EMAIL",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updateLead: vi.fn().mockResolvedValue({
    id: "test-lead-1",
    fullName: "Jane Doe",
    email: "jane@example.com",
    status: "CONTACTED",
    internalNotes: "Called on 12/16",
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createStaffContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "staff-user",
    email: "staff@example.com",
    name: "Staff User",
    loginMethod: "manus",
    role: "staff",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("leads.create (public)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new lead from contact form submission", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.leads.create({
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "555-123-4567",
      state: "PA",
      interest: "WEIGHT_LOSS",
      preferredContactMethod: "EMAIL",
      preferredContactTime: "Mornings",
      message: "Test message",
    });

    expect(result.success).toBe(true);
    expect(result.lead).toBeDefined();
    expect(result.lead?.fullName).toBe("Jane Doe");
    expect(result.lead?.email).toBe("jane@example.com");
  });

  it("validates required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.create({
        fullName: "",
        email: "jane@example.com",
        state: "PA",
        interest: "WEIGHT_LOSS",
        preferredContactMethod: "EMAIL",
      })
    ).rejects.toThrow();
  });

  it("validates email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.leads.create({
        fullName: "Jane Doe",
        email: "invalid-email",
        state: "PA",
        interest: "WEIGHT_LOSS",
        preferredContactMethod: "EMAIL",
      })
    ).rejects.toThrow();
  });
});

describe("admin.listLeads (staff/admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns leads for staff users", async () => {
    const ctx = createStaffContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.listLeads({});

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it("returns leads for admin users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.listLeads({});

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it("rejects unauthenticated requests", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.listLeads({})).rejects.toThrow();
  });
});

describe("admin.updateLead (staff/admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows staff to update lead status and notes", async () => {
    const ctx = createStaffContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateLead({
      id: "test-lead-1",
      status: "CONTACTED",
      internalNotes: "Called on 12/16",
    });

    expect(result?.status).toBe("CONTACTED");
    expect(result?.internalNotes).toBe("Called on 12/16");
  });

  it("allows admin to update lead status and notes", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateLead({
      id: "test-lead-1",
      status: "CONTACTED",
      internalNotes: "Called on 12/16",
    });

    expect(result?.status).toBe("CONTACTED");
    expect(result?.internalNotes).toBe("Called on 12/16");
  });
});

describe("admin.exportLeads (admin only)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows admin to export leads as CSV", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.exportLeads({});

    expect(result.csv).toBeDefined();
    expect(result.count).toBe(2);
    expect(result.csv).toContain("ID,Full Name,Email");
  });

  it("rejects staff from exporting leads", async () => {
    const ctx = createStaffContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.exportLeads({})).rejects.toThrow();
  });
});
