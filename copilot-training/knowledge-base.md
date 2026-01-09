# Lehigh Valley Wellness - Copilot Knowledge Base

## Business Overview

Lehigh Valley Wellness is a medical practice owned and operated by **Stephen McCarthy, PA-C**, specializing in two core services: **medical weight loss for complex cases** and **perimenopause/menopause hormone replacement therapy (HRT)** for women. The practice serves patients in Pennsylvania through both in-person appointments and telehealth consultations, with plans to expand telehealth services to Utah in the future.

The practice philosophy centers on evidence-based medicine with compassionate, personalized care. All marketing and patient communications must maintain a professional tone, avoid guaranteed outcomes, and include appropriate medical disclaimers.

## Services Offered

### Medical Weight Loss Program

The weight loss program treats obesity as a complex chronic disease rather than a willpower issue. Treatment options include FDA-approved GLP-1 medications (such as Semaglutide and Tirzepatide), comprehensive metabolic testing, personalized nutrition guidance, and ongoing medical monitoring. The program is designed for patients who have struggled with traditional diet and exercise approaches.

### Menopause & Hormone Replacement Therapy

The HRT program provides evidence-based hormone therapy for women experiencing perimenopause and menopause symptoms. Treatment focuses on bioidentical hormones and transdermal delivery methods when appropriate. Common symptoms addressed include hot flashes, night sweats, sleep disturbances, mood changes, brain fog, and genitourinary symptoms.

## Pricing Structure

The practice uses a subscription-based pricing model with three tiers for each service area. Pricing is configured in `/client/src/config/pricing.ts` and can be modified without code changes. Current program tiers include Essential, Comprehensive, and Premium levels with monthly fees ranging from $149 to $449 depending on the service and tier selected.

## Contact Information

The primary phone number is **(484) 357-1916**. The practice email is **info@lehighvalleywellness.com**. The physical service area covers the Lehigh Valley region including Allentown, Bethlehem, and Easton, Pennsylvania.

## Website Architecture

The website is built with React 19, TypeScript, and Tailwind CSS 4, using a full-stack architecture with tRPC for API communication and a MySQL database for data persistence. The design follows a "Clinical Serenity" theme with a Navy (#1e3a5f), Teal (#0d9488), and Warm Gold (#d4a853) color palette.

### Page Structure

| Route | Purpose |
|-------|---------|
| `/` | Homepage with hero section and service overview |
| `/services/weight-loss` | Detailed weight loss program information |
| `/services/menopause-hrt` | Detailed HRT program information |
| `/programs` | Pricing tiers and subscription options |
| `/about` | Provider bio and practice philosophy |
| `/faq` | Frequently asked questions |
| `/contact` | Contact form that creates leads in CRM |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/disclaimer` | Medical and emergency disclaimers |
| `/admin` | CRM dashboard (requires authentication) |
| `/admin/leads` | Lead management interface |
| `/admin/leads/:id` | Individual lead detail view |

## CRM System

The built-in CRM stores consultation requests submitted through the contact form. Each lead record includes the patient's name, email, phone, state, service interest, preferred contact method and time, status, internal notes, and timestamps.

### Lead Statuses

Leads progress through four statuses: **NEW** (just submitted), **CONTACTED** (initial outreach made), **SCHEDULED** (appointment booked), and **CLOSED** (consultation completed or declined).

### Role-Based Access

The CRM uses two roles. **Admin** users have full access including the ability to export leads as CSV. **Staff** users can view and edit leads but cannot export data. The project owner is automatically assigned admin role.

## Compliance Requirements

All public-facing content must include appropriate disclaimers. The website explicitly states it is not for medical emergencies and directs users to call 911. The contact form includes a warning not to submit personal medical details. The privacy policy clarifies that the website does not constitute a medical record.

No protected health information (PHI) or detailed medical history should be collected through the website. Medical information is only gathered during clinical visits and stored in the practice's HIPAA-compliant EHR system.

## Common Tasks

### Updating Pricing

Edit the file `/client/src/config/pricing.ts` to modify program prices, tier names, or included features. The Programs page automatically reflects these changes.

### Adding FAQ Questions

Edit `/client/src/pages/FAQ.tsx` to add new accordion items within the appropriate category section (General, Weight Loss, or HRT).

### Modifying Contact Information

Phone numbers appear in the Header, Footer, and Contact page components. Search for `484-357-1916` or `+14843571916` to find all instances.

### Managing Leads

Access the CRM at `/admin/leads` to view, filter, and update lead records. Use the search bar to find specific leads, filter by status or interest type, and click individual leads to update their status or add internal notes.
