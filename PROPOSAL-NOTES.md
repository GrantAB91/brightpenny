# Bright Penny site — notes for the reply to the client

The brief asked for: rough cost, timeline, platform recommendation, and what we need
from you. Cost is yours to price; everything else is below, ready to lift into an email.

## Platform recommendation

**Static site on Netlify (free tier).**

- No CMS and no database: nothing to update, patch or break, and hosting is effectively
  free with HTTPS and a global CDN included.
- The contact form uses Netlify's built-in form handling: submissions arrive by email,
  with honeypot + Akismet spam filtering, no server involved.
- Editing later is a text change in an HTML file: any web person can do it in minutes,
  and the README documents every step. If you later outgrow this (blog, case studies,
  frequent edits), the same design can be lifted onto a CMS without rebuilding the brand.
- Analytics is Google Analytics 4 behind a consent banner. The site sets no analytics
  cookies unless a visitor accepts. (If you'd rather avoid a banner entirely, Plausible
  (~£7/month) works without cookies; the site supports either.)

## What's built

- 6 public pages (Home, Finance options, Sectors, About, Contact, Privacy placeholder)
  plus thank-you and 404 pages, all responsive, mobile-first.
- Introducer-safe copy throughout: descriptive product information reworded from source
  material, no advice language, no reproduced PMD claims/statistics/FCA references.
  All PMD-related wording is flagged inline for their sign-off.
- Enquiry form captures name, business, email, phone, finance type, message, and a
  required consent tick covering both contact and passing details to PMD, with the
  privacy policy linked.
- Basic SEO done: per-page titles/descriptions, canonical URLs, Open Graph image,
  sitemap, robots, structured data. Lighthouse targets 90+ across the board.

## Suggested timeline shape (fill in dates)

1. Now: site built and reviewable on a temporary URL.
2. [X days] Your review: copy tweaks, imagery preferences.
3. [X days] PMD sign-off round: partner descriptions, disclosure wording, privacy policy
   (their compliance people will want to see every mention of PMD).
4. [X days] Launch plumbing: domain pointed at Netlify, enquiry inbox confirmed, GA4
   property created, form notification tested end-to-end.
5. Launch. (Recommend a quiet soft-launch before the next cold-email send.)

## What we need from Bright Penny

1. **Domain**: the domain name itself + access to its DNS (or delegate to us).
2. **Enquiry inbox**: the address that should receive form submissions.
3. **Company details**: registered legal name + company number for the footer.
4. **PMD sign-off**: introductions to whoever at PMD reviews financial-promotion wording;
   every flagged placeholder needs their approval before launch.
5. **Privacy policy text**: we supply the structure (already on the site); it needs
   completing and a legal once-over, since enquiries are shared with PMD.
6. **Analytics**: a Google account to own the GA4 property (or the nod to use Plausible).
7. Optional but recommended: a named contact person (and photo if you're comfortable)
   for the About/Contact pages. An introducer site converts better when it's visibly
   run by a person, and it's one more thing that separates it from spam.

## Open design notes

- The build uses the supplied logo (grey/orange). The brief's navy/gold suggestion is
  interpreted as deep navy structure + the logo's penny-orange as the single accent,
  so the brand assets and the site agree with each other.
- Photography is documentary-style UK industry from Pexels (licensed for commercial
  use). If Bright Penny ever commissions real photography of introduced businesses
  (with permission), swapping it in is a straight file replacement.
