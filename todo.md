# Project TODO

## Initial Website Build
- [x] Basic homepage layout with hero section
- [x] Navigation menu with responsive mobile design
- [x] Weight Loss service page
- [x] Menopause HRT service page
- [x] Programs page with configurable pricing
- [x] About page with provider bio
- [x] FAQ page
- [x] Contact page
- [x] Privacy Policy page
- [x] Terms of Service page
- [x] Medical Disclaimer page
- [x] SEO meta tags and OpenGraph
- [x] Footer with legal links
- [x] CTA sections throughout site

## Content Updates (from input file)
- [x] Updated pricing configuration with detailed tiers
- [x] Updated branding colors (Navy/Teal/Gold)
- [x] Updated provider bio and care philosophy
- [x] Updated contact phone number
- [x] Added global disclosures to programs page

## Database/CRM Integration
- [x] Upgraded to full-stack with database support
- [x] Created leads table schema with all required fields
- [x] Added indexes for created_at, email, status
- [x] Created database abstraction layer (db.ts)
- [x] Created tRPC API endpoints for leads (create, list, getById, update)
- [x] Integrated Contact form with leads API
- [x] Added form validation and error handling
- [x] Added success confirmation page
- [x] Added owner notification on new lead
- [x] Created vitest tests for leads API

## Contact Form Enhancements
- [x] Add honeypot hidden field for spam prevention
- [x] Add rate limiting to prevent duplicate submissions
- [x] Add medical disclaimer text above submit button
- [x] Enhance server-side validation and sanitization
- [x] Run end-to-end test to verify database submission

## Admin CRM Dashboard
- [x] Update user schema with staff role
- [x] Create protected admin API endpoints with RBAC
- [x] Build admin layout with sidebar navigation
- [x] Build /admin/leads list page with search, filter, sorting
- [x] Build /admin/leads/[id] detail page
- [x] Add status update and internal notes editing
- [x] Add CSV export for admins only
- [x] Add "Mark as Contacted" quick action
- [x] Ensure updated_at tracking on all edits
- [x] Prevent lead deletion from UI
- [x] Test CSV export with recent submissions

## Production Hardening
- [x] Add clear error states to contact form
- [x] Add loading states to contact form
- [x] Enhance spam protection with IP-based rate limiting
- [x] Verify tel: and mailto: links work
- [x] Add robots.txt
- [x] Add sitemap.xml
- [x] Add privacy policy placeholder language
- [x] Add disclaimer that site is not medical record/not for emergencies
- [x] Audit for PHI - ensure no medical history requested
- [x] QA: Contact form creates DB lead
- [x] QA: Admin dashboard shows lead
- [x] QA: Admin can update status + notes
- [x] QA: Admin can export CSV
- [x] QA: Staff role cannot export (RBAC verified)

## Bug Fixes
- [x] Update all "Book Consultation" buttons to link to /contact form
- [x] Clarify Contact page location section to specify Pennsylvania for telehealth
- [x] Create Copilot agent training files and setup guide
- [x] Add custom logo to the site header
- [x] Make phone number required on contact form
- [x] Update database schema to make phone field required
- [x] Make logo more prominent across the site (header, footer, homepage)
- [x] Generate new hero image with Lehigh Valley Wellness logo instead of "Serene Wellness" text
- [x] Create REST API specification file (OpenAPI) for Copilot agent
- [x] Update contact phone number to (484) 619-2876
- [x] Add professional headshot to About page
- [x] Fix Menopause & HRT text color on homepage to be more readable
- [x] Update website disclaimer page with provided text file content
- [x] Create AI chat agent with knowledge base
- [x] Build chat widget UI component
- [x] Integrate chat with lead creation for consultations
- [x] Add chat widget to all pages
- [x] Create patient portal page with full-screen AI chat
- [x] Integrate established patient training data
- [x] Add patient messages table to database
- [x] Add CRM message capture for unanswerable questions
- [x] Add patient detail collection form
- [x] Fix Patient Portal "unexpected error occurred" issue (added HelmetProvider)
- [x] Fix DialogTitle accessibility error on Menopause HRT page (added SheetTitle)
- [x] Create complete project export archive with all files
- [x] Replace const.ts, oauth.ts, sdk.ts with user's debugged versions
- [x] Update address to 6081 Hamilton Blvd Suite 600, Allentown, PA 18106
- [x] Add Google Maps embed to Contact page showing office location
- [x] Replace Disclaimer.tsx, Terms.tsx, Privacy.tsx with user's modified versions (in legal folder)
- [x] Revise patient support AI chat to gather information conversationally and send to CRM instead of showing staff message form
- [x] Implement hybrid AI chat: AI triage + inline form for data collection + auto-submit to CRM
- [x] Align hours and telehealth scope across Footer, Contact, and Patient Portal (PA now, Utah coming soon, Mon/Thur 10-6)
- [x] Add Stephen McCarthy professional portrait to main page and other relevant locations
- [x] Add note about 24/7 AI patient support availability under hours on main page
- [x] Hide patient reviews section on home page
- [x] Update Facebook link to https://www.facebook.com/profile.php?id=61552994302272
- [x] Remove Instagram link from footer
- [x] Add PA supervision disclosure for Stephen McCarthy to comply with state law
- [x] Update Programs page with new pricing structure (Weight Loss tiers, Women's Hormone, Men's Health, Peptide Therapy)
- [x] Add booking deposit and no-show policy section
- [x] Update Weight Loss service page with new tier structure
- [x] Add Men's Health service page (ED + Hair Loss)
- [x] Add Peptide Therapy service page
- [x] Update Menopause HRT page with new pricing
- [x] Add Stripe payment integration for memberships and booking deposits

## Site Restructuring
- [x] Add Men's Health and Peptide Therapy tiles to homepage (like Weight Loss and Menopause)
- [x] Remove pricing from Weight Loss service page, add Book Now link
- [x] Remove pricing from Menopause HRT service page, add Book Now link
- [x] Remove pricing from Men's Health service page, add Book Now link
- [x] Remove pricing from Peptide Therapy service page, add Book Now link
- [x] Rename Programs page to "Book Now" and update all navigation
- [x] Update Book Now page to allow program selection and start booking process
- [x] Replace Contact form with AI chat + contact info only
- [x] Remove Patient Portal page from site and navigation
- [x] Update AI chat to handle both potential and current patient questions
- [x] Add inline contact form in AI chat when human assistance needed
- [x] Add CRM alerts when someone signs up through Stripe

## Homepage Button and Image Updates
- [x] Link Book Consultation buttons to /book page
- [x] Make Explore Services button scroll to tiles section
- [x] Add better image for Men's Health tile
- [x] Add better image for Peptide Therapy tile

## Footer and Button Fixes
- [x] Fix second Book Consultation button to link to /book
- [x] Remove Services section from footer (keep Contact and Legal only)

## Contact Page Reorganization
- [x] Move AI chat to top of Contact page
- [x] Move contact info and map below AI chat

## Favicon
- [x] Set brain/mountain logo as browser tab favicon

## AI Training Data Update
- [x] Replace AI training data with new JSON file

## Phone Number Revert
- [x] Change phone number back to (484) 619-2876 across all files

## New Booking Workflow
- [x] Update database schema with appointment preference fields
- [x] Create booking form to collect user info and preferred appointment time
- [x] Update Stripe checkout to charge deposit and create lead in CRM
- [x] Remove separate Pay Booking Deposit button
- [x] Test complete booking workflow
