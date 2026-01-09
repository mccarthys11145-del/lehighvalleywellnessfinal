import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { Request, Response } from 'express';

// Mock the database functions
vi.mock('./db', () => ({
  createPatientMessage: vi.fn().mockResolvedValue({
    id: 'test-msg-123',
    patientName: 'Test Patient',
    email: 'test@example.com',
    phone: null,
    program: 'WEIGHT_LOSS',
    category: 'MEDICATION',
    message: 'I need a refill on my medication',
    urgency: 'ROUTINE',
    status: 'NEW',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  searchPatientMessages: vi.fn().mockResolvedValue([]),
  getPatientMessageById: vi.fn().mockResolvedValue(null),
  updatePatientMessage: vi.fn().mockResolvedValue(null),
}));

// Mock notification
vi.mock('./_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe('Patient Messages API', () => {
  let uniqueId = 0;
  
  // Create a unique IP for each call to avoid rate limiting
  const createMockContext = () => {
    uniqueId++;
    return {
      req: {
        ip: `unique-test-ip-${uniqueId}-${Math.random().toString(36)}`,
        headers: { 'x-forwarded-for': `unique-test-ip-${uniqueId}-${Math.random().toString(36)}` },
      } as unknown as Request,
      res: {} as Response,
      user: null,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('patientMessages.create', () => {
    it('should create a patient message with valid input', async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.patientMessages.create({
        name: 'Test Patient',
        email: 'test@example.com',
        program: 'WEIGHT_LOSS',
        category: 'MEDICATION',
        message: 'I need a refill on my medication',
        urgency: 'ROUTINE',
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe('test-msg-123');
    });

    it('should accept optional phone number', async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.patientMessages.create({
        name: 'Test Patient',
        email: 'test@example.com',
        phone: '555-123-4567',
        program: 'MENOPAUSE_HRT',
        category: 'SCHEDULING',
        message: 'I need to reschedule my appointment',
        urgency: 'SOON',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.patientMessages.create({
          name: 'Test Patient',
          email: 'invalid-email',
          program: 'WEIGHT_LOSS',
          category: 'MEDICATION',
          message: 'Test message',
          urgency: 'ROUTINE',
        })
      ).rejects.toThrow();
    });

    it('should reject empty name', async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.patientMessages.create({
          name: '',
          email: 'test@example.com',
          program: 'WEIGHT_LOSS',
          category: 'MEDICATION',
          message: 'Test message',
          urgency: 'ROUTINE',
        })
      ).rejects.toThrow();
    });

    it('should reject empty message', async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.patientMessages.create({
          name: 'Test Patient',
          email: 'test@example.com',
          program: 'WEIGHT_LOSS',
          category: 'MEDICATION',
          message: '',
          urgency: 'ROUTINE',
        })
      ).rejects.toThrow();
    });

    it('should accept COMBINED program type', async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.patientMessages.create({
        name: 'Test Patient',
        email: 'test@example.com',
        program: 'COMBINED',
        category: 'OTHER',
        message: 'Test message for combined program',
        urgency: 'ROUTINE',
      });
      
      expect(result.success).toBe(true);
    });

    it('should accept URGENT urgency type', async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.patientMessages.create({
        name: 'Test Patient',
        email: 'test@example.com',
        program: 'WEIGHT_LOSS',
        category: 'SIDE_EFFECTS',
        message: 'Experiencing side effects',
        urgency: 'URGENT',
      });
      
      expect(result.success).toBe(true);
    });
  });
});
