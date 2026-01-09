# Codebase Reference Guide

This document provides a technical reference for the Lehigh Valley Wellness website codebase to help the Copilot understand the project structure and make accurate modifications.

## Project Structure

```
lehigh-valley-wellness/
├── client/                    # Frontend React application
│   ├── public/               # Static assets (images, robots.txt, sitemap.xml)
│   │   └── images/           # Hero images. service photos
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui base components
│   │   │   ├── Header.tsx   # Site navigation header
│   │   │   ├── Footer.tsx   # Site footer with contact info
│   │   │   ├── Layout.tsx   # Page wrapper component
│   │   │   ├── SEO.tsx      # Meta tags and OpenGraph
│   │   │   ├── CTASection.tsx # Call-to-action blocks
│   │   │   └── AdminLayout.tsx # Admin dashboard wrapper
│   │   ├── config/
│   │   │   └── pricing.ts   # Program pricing configuration
│   │   ├── pages/           # Route components
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Programs.tsx
│   │   │   ├── services/
│   │   │   │   ├── WeightLoss.tsx
│   │   │   │   └── MenopauseHRT.tsx
│   │   │   ├── legal/
│   │   │   │   ├── Privacy.tsx
│   │   │   │   ├── Terms.tsx
│   │   │   │   └── Disclaimer.tsx
│   │   │   └── admin/
│   │   │       ├── LeadsList.tsx
│   │   │       └── LeadDetail.tsx
│   │   ├── App.tsx          # Route definitions
│   │   └── index.css        # Global styles and theme
│   └── index.html           # HTML template with fonts
├── server/                   # Backend API
│   ├── routers.ts           # tRPC API endpoints
│   ├── db.ts                # Database helper functions
│   └── _core/               # Framework internals
├── drizzle/
│   └── schema.ts            # Database schema definitions
└── shared/
    └── const.ts             # Shared constants
```

## Key Files for Common Tasks

### Updating Content

| Task | File(s) to Edit |
|------|-----------------|
| Change pricing | `/client/src/config/pricing.ts` |
| Update phone number | `Header.tsx`, `Footer.tsx`, `Contact.tsx` |
| Modify homepage hero | `/client/src/pages/Home.tsx` |
| Add FAQ question | `/client/src/pages/FAQ.tsx` |
| Edit provider bio | `/client/src/pages/About.tsx` |
| Update legal text | `/client/src/pages/legal/*.tsx` |

### Styling

The project uses Tailwind CSS 4 with a custom theme defined in `/client/src/index.css`. Key design tokens:

```css
/* Primary brand colors (in OKLCH format) */
--primary: oklch(0.35 0.05 240);        /* Navy blue */
--secondary: oklch(0.55 0.15 175);      /* Teal */
--accent: oklch(0.75 0.12 85);          /* Warm gold */

/* Typography */
--font-heading: "Tenor Sans", serif;
--font-body: "Lato", sans-serif;
```

### Database Schema

The `leads` table stores contact form submissions:

```typescript
// From /drizzle/schema.ts
export const leads = mysqlTable("leads", {
  id: varchar("id", { length: 36 }).primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  state: varchar("state", { length: 50 }).notNull(),
  interest: mysqlEnum("interest", ["WEIGHT_LOSS", "MENOPAUSE_HRT", "GENERAL", "OTHER"]).notNull(),
  preferredContactMethod: mysqlEnum("preferredContactMethod", ["PHONE", "EMAIL", "TEXT"]).notNull(),
  preferredContactTime: varchar("preferredContactTime", { length: 255 }),
  status: mysqlEnum("status", ["NEW", "CONTACTED", "SCHEDULED", "CLOSED"]).default("NEW"),
  internalNotes: text("internalNotes"),
  message: text("message"),
  source: varchar("source", { length: 100 }).default("website_contact_form"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});
```

### API Endpoints

Key tRPC procedures in `/server/routers.ts`:

| Endpoint | Access | Purpose |
|----------|--------|---------|
| `leads.create` | Public | Submit contact form |
| `admin.getLeads` | Staff+ | List leads with filters |
| `admin.getLead` | Staff+ | Get single lead details |
| `admin.updateLead` | Staff+ | Update status/notes |
| `admin.markContacted` | Staff+ | Quick status update |
| `admin.exportLeads` | Admin only | CSV export |

## Component Patterns

### Page Layout

All public pages follow this structure:

```tsx
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

export default function PageName() {
  return (
    <Layout>
      <SEO 
        title="Page Title" 
        description="Meta description for SEO"
      />
      {/* Page content */}
    </Layout>
  );
}
```

### CTA Sections

Use the CTASection component for call-to-action blocks:

```tsx
<CTASection 
  title="Ready to Get Started?"
  description="Schedule a consultation today."
  primaryAction={{ label: "Book Consultation", href: "/contact" }}
  secondaryAction={{ label: "Learn More", href: "/services/weight-loss" }}
  variant="default" // or "muted"
/>
```

### Form Validation

The contact form uses controlled components with client-side validation. Server-side validation includes honeypot detection and rate limiting (3 submissions per minute per IP/email).

## Environment Variables

The application uses these environment variables (managed through Manus Secrets):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Authentication token signing |
| `VITE_APP_TITLE` | Site title |
| `VITE_APP_LOGO` | Logo URL |

## Running Locally

The development server runs on port 3000. Key commands:

```bash
pnpm dev          # Start development server
pnpm test         # Run test suite
pnpm db:push      # Apply schema changes to database
pnpm build        # Production build
```
