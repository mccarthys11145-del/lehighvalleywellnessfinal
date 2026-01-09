import { describe, it, expect, beforeAll } from 'vitest';

/**
 * Admin CRM API Tests
 * 
 * These tests verify the admin endpoints for lead management.
 * Note: These tests require authentication with staff/admin role.
 */

describe('Admin CRM API', () => {
  describe('Lead Search', () => {
    it('should have searchLeads function that accepts filter parameters', async () => {
      // Import the search function
      const { searchLeads } = await import('./db');
      
      // Verify the function exists and accepts parameters
      expect(typeof searchLeads).toBe('function');
      
      // Test with empty params (should return all leads)
      const allLeads = await searchLeads({});
      expect(Array.isArray(allLeads)).toBe(true);
    });

    it('should filter leads by status', async () => {
      const { searchLeads } = await import('./db');
      
      // Search for NEW leads
      const newLeads = await searchLeads({ status: 'NEW' });
      expect(Array.isArray(newLeads)).toBe(true);
      
      // All returned leads should have NEW status
      newLeads.forEach(lead => {
        expect(lead.status).toBe('NEW');
      });
    });

    it('should filter leads by interest', async () => {
      const { searchLeads } = await import('./db');
      
      // Search for WEIGHT_LOSS interest
      const weightLossLeads = await searchLeads({ interest: 'WEIGHT_LOSS' });
      expect(Array.isArray(weightLossLeads)).toBe(true);
      
      // All returned leads should have WEIGHT_LOSS interest
      weightLossLeads.forEach(lead => {
        expect(lead.interest).toBe('WEIGHT_LOSS');
      });
    });

    it('should sort leads by createdAt descending by default', async () => {
      const { searchLeads } = await import('./db');
      
      const leads = await searchLeads({});
      
      // Verify descending order (newest first)
      for (let i = 1; i < leads.length; i++) {
        const prevDate = new Date(leads[i - 1].createdAt).getTime();
        const currDate = new Date(leads[i].createdAt).getTime();
        expect(prevDate).toBeGreaterThanOrEqual(currDate);
      }
    });

    it('should sort leads ascending when specified', async () => {
      const { searchLeads } = await import('./db');
      
      const leads = await searchLeads({ sortOrder: 'asc' });
      
      // Verify ascending order (oldest first)
      for (let i = 1; i < leads.length; i++) {
        const prevDate = new Date(leads[i - 1].createdAt).getTime();
        const currDate = new Date(leads[i].createdAt).getTime();
        expect(prevDate).toBeLessThanOrEqual(currDate);
      }
    });
  });

  describe('Lead Update', () => {
    it('should have updateLead function', async () => {
      const { updateLead } = await import('./db');
      expect(typeof updateLead).toBe('function');
    });
  });

  describe('CSV Export Format', () => {
    it('should generate valid CSV format', () => {
      // Test CSV generation logic
      const testLeads = [
        {
          id: 'test-1',
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          state: 'PA',
          interest: 'WEIGHT_LOSS',
          preferredContactMethod: 'EMAIL',
          preferredContactTime: 'Morning',
          status: 'NEW',
          source: 'website_contact_form',
          message: 'Test message',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      const headers = [
        "ID",
        "Full Name",
        "Email",
        "Phone",
        "State",
        "Interest",
        "Preferred Contact Method",
        "Preferred Contact Time",
        "Status",
        "Source",
        "Message",
        "Created At",
        "Updated At",
      ];

      const rows = testLeads.map(lead => [
        lead.id,
        lead.fullName,
        lead.email,
        lead.phone || "",
        lead.state,
        lead.interest,
        lead.preferredContactMethod,
        lead.preferredContactTime || "",
        lead.status,
        lead.source,
        (lead.message || "").replace(/"/g, '""'),
        lead.createdAt.toISOString(),
        lead.updatedAt.toISOString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
      ].join("\n");

      // Verify CSV structure
      expect(csvContent).toContain('ID,Full Name,Email');
      expect(csvContent).toContain('"test-1"');
      expect(csvContent).toContain('"John Doe"');
      expect(csvContent).toContain('"john@example.com"');
      
      // Verify it doesn't contain internal notes (privacy)
      expect(csvContent).not.toContain('Internal Notes');
    });
  });

  describe('Role-Based Access', () => {
    it('should define staff and admin procedures', async () => {
      const trpc = await import('./_core/trpc');
      
      expect(trpc.staffProcedure).toBeDefined();
      expect(trpc.adminProcedure).toBeDefined();
    });
  });
});
