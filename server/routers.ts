import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router, staffProcedure } from "./_core/trpc";
import { z } from "zod";
import { createLead, getAllLeads, getLeadById, searchLeads, updateLead } from "./db";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";
import { checkChatRateLimit, generateChatResponse, getQuickResponse, type ChatMessage, type ChatMode, type CollectionState } from "./chatService";
import { createPatientMessage, searchPatientMessages, getPatientMessageById, updatePatientMessage } from "./db";
import { createCheckoutSession, getCheckoutSession, createBillingPortalSession, getOrCreateCustomer, createBookingCheckoutSession } from "./stripeService";
import { products, getProductById } from "./products";

// Simple in-memory rate limiter (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3; // Max 3 submissions per minute per IP/email

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

// Sanitize text input - remove potential XSS and trim whitespace
function sanitizeText(input: string | undefined | null): string | null {
  if (!input) return null;
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining angle brackets
    .substring(0, 1000); // Limit length
}

// Validation schemas for leads
const createLeadSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(200),
  email: z.string().email("Valid email is required").max(320),
  phone: z.string().max(20).optional(),
  state: z.enum(["PA", "UT", "Other"]),
  interest: z.enum(["WEIGHT_LOSS", "MENOPAUSE_HRT", "GENERAL", "OTHER"]),
  preferredContactMethod: z.enum(["PHONE", "EMAIL", "TEXT"]),
  preferredContactTime: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(100).default("website_contact_form"),
  // Honeypot field - should always be empty if submitted by a human
  website: z.string().max(0, "Invalid submission").optional(),
});

const updateLeadSchema = z.object({
  id: z.string(),
  status: z.enum(["NEW", "CONTACTED", "SCHEDULED", "CLOSED"]).optional(),
  internalNotes: z.string().nullable().optional(),
});

const searchLeadsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "SCHEDULED", "CLOSED"]).optional(),
  interest: z.enum(["WEIGHT_LOSS", "MENOPAUSE_HRT", "GENERAL", "OTHER"]).optional(),
  state: z.enum(["PA", "UT", "Other"]).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "fullName", "email"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  // Lead/CRM router - public endpoint for form submissions
  leads: router({
    // Public endpoint for contact form submissions
    create: publicProcedure
      .input(createLeadSchema)
      .mutation(async ({ input, ctx }) => {
        // Check honeypot - if filled, it's likely a bot
        if (input.website && input.website.length > 0) {
          // Silently reject but return success to not tip off bots
          console.log("[Spam] Honeypot triggered, rejecting submission");
          return { success: true, lead: null };
        }

        // Rate limiting by IP
        const clientIP = ctx.req.headers['x-forwarded-for'] || ctx.req.headers['x-real-ip'] || ctx.req.socket?.remoteAddress || 'unknown';
        const ipIdentifier = `ip:${Array.isArray(clientIP) ? clientIP[0] : clientIP.split(',')[0].trim()}`;
        if (!checkRateLimit(ipIdentifier)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many submissions from your location. Please wait a minute before trying again.",
          });
        }

        // Rate limiting by email (additional layer)
        const emailIdentifier = `email:${input.email.toLowerCase()}`;
        if (!checkRateLimit(emailIdentifier)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many submissions with this email. Please wait a minute before trying again.",
          });
        }

        // Sanitize all text inputs
        const sanitizedFullName = sanitizeText(input.fullName) || "";
        const sanitizedEmail = input.email.toLowerCase().trim();
        const sanitizedPhone = sanitizeText(input.phone) || "";
        const sanitizedPreferredContactTime = sanitizeText(input.preferredContactTime);
        const sanitizedMessage = sanitizeText(input.message);

        // Additional validation after sanitization
        if (sanitizedFullName.length < 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Full name is required",
          });
        }

        const lead = await createLead({
          fullName: sanitizedFullName,
          email: sanitizedEmail,
          phone: sanitizedPhone,
          state: input.state,
          interest: input.interest,
          preferredContactMethod: input.preferredContactMethod,
          preferredContactTime: sanitizedPreferredContactTime,
          message: sanitizedMessage,
          source: input.source,
          status: "NEW",
          internalNotes: null,
        });

        // Notify owner of new lead
        if (lead) {
          await notifyOwner({
            title: `New Lead: ${sanitizedFullName}`,
            content: `Interest: ${input.interest}\nEmail: ${sanitizedEmail}\nPhone: ${sanitizedPhone || 'Not provided'}\nState: ${input.state}\nPreferred Contact: ${input.preferredContactMethod}`,
          });
        }

        return { success: true, lead };
      }),
  }),

  // Admin CRM router - protected endpoints for staff/admin
  admin: router({
    // Staff + Admin: List leads with search and filters
    listLeads: staffProcedure
      .input(searchLeadsSchema)
      .query(async ({ input }) => {
        return await searchLeads(input);
      }),

    // Staff + Admin: Get single lead by ID
    getLead: staffProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const lead = await getLeadById(input.id);
        if (!lead) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lead not found",
          });
        }
        return lead;
      }),

    // Staff + Admin: Update lead status and notes
    updateLead: staffProcedure
      .input(updateLeadSchema)
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const lead = await updateLead(id, updates);
        if (!lead) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lead not found",
          });
        }
        return lead;
      }),

    // Staff + Admin: Quick action - Mark as Contacted
    markAsContacted: staffProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const lead = await updateLead(input.id, { status: "CONTACTED" });
        if (!lead) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lead not found",
          });
        }
        return lead;
      }),

    // Admin only: Export leads as CSV data
    exportLeads: adminProcedure
      .input(searchLeadsSchema)
      .query(async ({ input }) => {
        const leads = await searchLeads(input);
        
        // Generate CSV content (excluding internalNotes for privacy)
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
        
        const rows = leads.map(lead => [
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
          (lead.message || "").replace(/"/g, '""'), // Escape quotes
          lead.createdAt.toISOString(),
          lead.updatedAt.toISOString(),
        ]);
        
        // Build CSV string
        const csvContent = [
          headers.join(","),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
        ].join("\n");
        
        return {
          csv: csvContent,
          count: leads.length,
          exportedAt: new Date().toISOString(),
        };
      }),

    // Get current user info for admin panel
    getCurrentUser: staffProcedure.query(({ ctx }) => {
      return {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        role: ctx.user.role,
      };
    }),
  }),

  // AI Chat endpoint
  chat: router({
    sendMessage: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().max(2000),
        })).max(20),
        mode: z.enum(["prospective", "established"]).default("prospective"),
      }))
      .mutation(async ({ input, ctx }) => {
        const forwardedFor = ctx.req?.headers?.["x-forwarded-for"];
        const realIp = ctx.req?.headers?.["x-real-ip"];
        const clientIp = (typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : forwardedFor?.[0]) || 
                         (typeof realIp === "string" ? realIp : realIp?.[0]) || 
                         "unknown";
        
        if (!checkChatRateLimit(clientIp)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many messages. Please wait a moment before sending another message.",
          });
        }

        const lastMessage = input.messages[input.messages.length - 1];
        if (!lastMessage || lastMessage.role !== "user") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Last message must be from user",
          });
        }

        const quickResponse = getQuickResponse(lastMessage.content, input.mode as ChatMode);
        if (quickResponse) {
          return { response: quickResponse, needsEscalation: false };
        }

        const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
        const apiUrl = process.env.BUILT_IN_FORGE_API_URL;

        if (!apiKey || !apiUrl) {
          console.error("Missing AI API credentials");
          return {
            response: "I'm temporarily unavailable. Please contact the office directly at (484) 619-2876 or email info@lehighvalleywellness.com.",
            needsEscalation: false
          };
        }

        try {
          const result = await generateChatResponse(
            input.messages as ChatMessage[],
            apiKey,
            apiUrl,
            input.mode as ChatMode
          );
          // If collection state indicates "submitted", automatically create the patient message
          if (result.collectionState?.status === "submitted" && result.collectionState.data) {
            const data = result.collectionState.data;
            if (data.name && data.email && data.program && data.category && data.message) {
              try {
                // Build conversation context from messages
                const conversationContext = input.messages
                  .map(m => `${m.role === "user" ? "Patient" : "Assistant"}: ${m.content}`)
                  .join("\n\n");

                await createPatientMessage({
                  patientName: sanitizeText(data.name) || data.name,
                  email: data.email.toLowerCase().trim(),
                  phone: data.phone ? sanitizeText(data.phone) : null,
                  program: data.program,
                  category: data.category,
                  message: sanitizeText(data.message) || data.message,
                  urgency: data.urgency || "ROUTINE",
                  conversationContext: conversationContext,
                });

                // Notify staff about new patient message
                await notifyOwner({
                  title: `New Patient Message: ${data.category}`,
                  content: `${data.name} (${data.program}) - ${data.urgency || "ROUTINE"} priority\n\n${data.message.substring(0, 200)}${data.message.length > 200 ? '...' : ''}`,
                });
              } catch (error) {
                console.error("Failed to auto-submit patient message:", error);
              }
            }
          }

          return { 
            response: result.response, 
            needsEscalation: result.needsEscalation,
            escalationReason: result.escalationReason,
            collectionState: result.collectionState
          };
        } catch (error) {
          console.error("Chat error:", error);
          return {
            response: "I'm having trouble responding right now. Please try again, or contact the office directly at (484) 619-2876.",
            needsEscalation: false
          };
        }
      }),

    // Create a patient message (when escalation is needed)
    createPatientMessage: publicProcedure
      .input(z.object({
        patientName: z.string().min(1).max(200),
        email: z.string().email().max(320),
        phone: z.string().max(20).optional(),
        program: z.enum(["WEIGHT_LOSS", "MENOPAUSE_HRT", "COMBINED", "OTHER"]),
        category: z.enum(["SCHEDULING", "BILLING", "MEDICATION", "SIDE_EFFECTS", "LABS", "TECHNICAL", "OTHER"]),
        message: z.string().min(1).max(2000),
        urgency: z.enum(["ROUTINE", "SOON", "URGENT"]).default("ROUTINE"),
        conversationContext: z.string().max(10000).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const patientMessage = await createPatientMessage({
            patientName: sanitizeText(input.patientName) || input.patientName,
            email: input.email.toLowerCase().trim(),
            phone: input.phone ? sanitizeText(input.phone) : null,
            program: input.program,
            category: input.category,
            message: sanitizeText(input.message) || input.message,
            urgency: input.urgency,
            conversationContext: input.conversationContext,
          });

          if (patientMessage) {
            // Notify staff about new patient message
            await notifyOwner({
              title: `New Patient Message: ${input.category}`,
              content: `${input.patientName} (${input.program}) - ${input.urgency} priority\n\n${input.message.substring(0, 200)}${input.message.length > 200 ? '...' : ''}`,
            });
          }

          return { success: true, messageId: patientMessage?.id };
        } catch (error) {
          console.error("Failed to create patient message:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit message. Please call the office at (484) 619-2876.",
          });
        }
      }),
  }),

  // Patient Messages endpoints
  patientMessages: router({
    // Public endpoint for patients to submit messages
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required").max(200),
        email: z.string().email("Valid email is required").max(320),
        phone: z.string().max(20).optional(),
        program: z.enum(["WEIGHT_LOSS", "MENOPAUSE_HRT", "COMBINED", "OTHER"]),
        category: z.enum(["SCHEDULING", "BILLING", "MEDICATION", "SIDE_EFFECTS", "LABS", "TECHNICAL", "OTHER"]),
        message: z.string().min(1, "Message is required").max(2000),
        urgency: z.enum(["ROUTINE", "SOON", "URGENT"]).default("ROUTINE"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Rate limit by IP
        const clientIp = ctx.req?.ip || ctx.req?.headers?.['x-forwarded-for'] || "unknown";
        if (!checkRateLimit(`patient-msg-${clientIp}`)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please wait a moment before trying again.",
          });
        }

        const sanitizedMessage = sanitizeText(input.message);
        if (!sanitizedMessage) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Message is required",
          });
        }

        const patientMessage = await createPatientMessage({
          patientName: sanitizeText(input.name) || input.name,
          email: input.email.toLowerCase().trim(),
          phone: sanitizeText(input.phone) || null,
          program: input.program,
          category: input.category,
          message: sanitizedMessage,
          urgency: input.urgency,
          status: "NEW",
        });

        // Notify owner of new patient message
        try {
          await notifyOwner({
            title: "New Patient Portal Message",
            content: `Name: ${input.name}\n` +
              `Email: ${input.email}\n` +
              `Program: ${input.program}\n` +
              `Category: ${input.category}\n` +
              `Urgency: ${input.urgency}\n\n` +
              `Message: ${sanitizedMessage}`
          });
        } catch (e) {
          console.error("Failed to notify owner of patient message:", e);
        }

        return { success: true, id: patientMessage?.id };
      }),

    list: staffProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]).optional(),
        category: z.enum(["SCHEDULING", "BILLING", "MEDICATION", "SIDE_EFFECTS", "LABS", "TECHNICAL", "OTHER"]).optional(),
        program: z.enum(["WEIGHT_LOSS", "MENOPAUSE_HRT", "COMBINED", "OTHER"]).optional(),
        urgency: z.enum(["ROUTINE", "SOON", "URGENT"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        return await searchPatientMessages(input || {});
      }),

    getById: staffProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const message = await getPatientMessageById(input.id);
        if (!message) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Patient message not found" });
        }
        return message;
      }),

    update: staffProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]).optional(),
        staffNotes: z.string().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const message = await updatePatientMessage(id, updates);
        if (!message) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Patient message not found" });
        }
        return message;
      }),
  }),

  // Stripe payment router
  payments: router({
    // Get all available products
    getProducts: publicProcedure.query(() => {
      return products;
    }),

    // Get a single product by ID
    getProduct: publicProcedure
      .input(z.object({ productId: z.string() }))
      .query(({ input }) => {
        const product = getProductById(input.productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        return product;
      }),

    // Create a checkout session (public - can be used by anyone)
    createCheckout: publicProcedure
      .input(z.object({
        productId: z.string(),
        email: z.string().email().optional(),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = getProductById(input.productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }

        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        const userId = ctx.user?.id?.toString();
        const userEmail = input.email || ctx.user?.email || undefined;
        const userName = input.name || ctx.user?.name || undefined;

        try {
          const checkoutUrl = await createCheckoutSession({
            productId: input.productId,
            userId,
            userEmail,
            userName: userName ?? undefined,
            successUrl: `${origin}/payment/success`,
            cancelUrl: `${origin}/programs`,
          });

          return { checkoutUrl };
        } catch (error: any) {
          console.error('[Stripe] Checkout error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create checkout session",
          });
        }
      }),

    // Get checkout session details (for success page)
    getCheckoutSession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        try {
          const session = await getCheckoutSession(input.sessionId);
          return {
            id: session.id,
            status: session.status,
            customerEmail: session.customer_email,
            amountTotal: session.amount_total,
            currency: session.currency,
            paymentStatus: session.payment_status,
            mode: session.mode,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Checkout session not found",
          });
        }
      }),

    // Create billing portal session (for logged-in users to manage subscriptions)
    createBillingPortal: protectedProcedure
      .mutation(async ({ ctx }) => {
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        
        try {
          // Get or create Stripe customer
          const customer = await getOrCreateCustomer(ctx.user.email || '', ctx.user.name || undefined);
          
          const portalUrl = await createBillingPortalSession(
            customer.id,
            `${origin}/programs`
          );

          return { portalUrl };
        } catch (error: any) {
          console.error('[Stripe] Billing portal error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create billing portal session",
          });
        }
      }),

    // Create booking checkout session with deposit and lead creation
    createBookingCheckout: publicProcedure
      .input(z.object({
        productId: z.string(),
        customerInfo: z.object({
          fullName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().min(1),
          state: z.enum(["PA", "UT", "Other"]),
          requestedDate: z.string().min(1),
          requestedTime: z.string().min(1),
          selectedProgram: z.string().min(1),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        
        try {
          const url = await createBookingCheckoutSession({
            productId: input.productId,
            customerInfo: input.customerInfo,
            successUrl: `${origin}/payment/success`,
            cancelUrl: `${origin}/book`,
          });

          return { url };
        } catch (error: any) {
          console.error('[Stripe] Booking checkout error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create booking checkout session",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
