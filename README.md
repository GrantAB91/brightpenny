# Bright Penny — website

Static brochure site. Plain HTML + Bootstrap 5.3 + one custom stylesheet.
No CMS, no build step: what's in this folder is exactly what gets deployed.

## Layout

```
site/                     <- deploy THIS folder
  index.html              Home
  finance-options/        Finance options (9 products, jump nav)
  sectors/                Sector grid
  about/                  Introducer model + PMD partnership
  contact/                Enquiry form (Netlify Forms)
  privacy/                PLACEHOLDER policy (noindex until finalised)
  thank-you/              Form success page (noindex)
  404.html                Not-found page (Netlify serves it automatically)
  assets/css/             bootstrap.min.css (5.3.8, untouched) + theme.css (all custom styling)
  assets/js/              bootstrap.bundle.min.js (untouched) + main.js (cookie banner + analytics)
  assets/fonts/           Cabinet Grotesk + Switzer (Fontshare, free for commercial use)
  assets/img/             photos (AVIF/WebP/JPG at multiple sizes), logo SVGs, og-image
  assets/video/           hero-a1.mp4 (14s, 720p, muted, ~1MB)
  netlify.toml            headers, caching, CSP
  robots.txt, sitemap.xml
```

Source photos and the tooling that produced the derived assets live one level up
(`src-images/`, `tools/`) and must NOT be deployed. Photo credits: `src-images/CREDITS.md`.

## Editing content

- Every page is plain HTML. Text lives where you'd expect; sections are marked with
  `<!-- SECTION: ... -->` comments.
- The header nav and footer are duplicated in ALL EIGHT html files between
  `<!-- NAV -->` and `<!-- /NAV -->`, and `<!-- FOOTER -->` and `<!-- /FOOTER -->`.
  If you change a link or footer line, change it in all eight (search for the old text
  across the folder and replace).
- The highlighted nav item is the `aria-current="page"` attribute on each page's own link.
- **Cache busting:** `/assets/*` is served with a one-year immutable cache. If you edit
  `theme.css` or `main.js` after launch, rename the reference in all pages from
  `theme.css` to `theme.css?v=2` (and bump the number each time).

## The hero video

The home page hero uses a short looping clip of the A1 in Yorkshire.

- It is **not** in the HTML. `main.js` injects the `<video>` only when the viewport
  is 768px or wider and the visitor has not asked for reduced motion. This is
  deliberate: an autoplaying video is downloaded by the browser even when it is
  `display:none` with `preload="none"`, which was costing phones ~1.2MB for
  something they never saw. Home is 299KB on mobile with this approach.
- Phones and reduced-motion visitors get the poster image instead.
- There is a "Pause background video" control in the top right (WCAG 2.2.2 — any
  motion that autoplays for more than five seconds needs a way to stop it). Don't
  remove it.
- To swap the clip: replace `assets/video/hero-a1.mp4`, regenerate a poster frame,
  and update the `data-video` / `data-poster` attributes on `#hero-media` in
  `index.html`.

## Imagery rules

The art direction is "what the money buys" — vans, plant, racking, premises, a
shop counter. Two rules matter if you replace anything:

1. **Open the image at full size and look at it before using it.** Thumbnails hide
   foreign signage. Several candidates only failed on full-size inspection
   (Chinese banners, Arabic signage, an American "violators will be towed" sign).
2. **UK-plausible or geography-neutral.** No left-hand drive, foreign plates,
   non-UK signage or architecture. Bright and uncluttered, not dark and grimy.

`src-images/CREDITS.md` records every image, why it passed, and a list of rejected
candidates so the same mistakes don't get made twice.

## Placeholders that MUST be resolved before launch

Search the whole folder for `[` to find them all. In short:

1. Domain: replace `https://brightpenny.co.uk` in every canonical/og:url, `sitemap.xml`,
   `robots.txt` and the JSON-LD block on the home page.
2. Enquiry inbox: replace `enquiries@brightpenny.co.uk` (footer, contact page, privacy, JSON-LD).
3. Footer disclosure box + partner descriptions: wording to be agreed with PMD.
4. Company legal name + number in the footer bottom line.
5. Privacy policy: full text + legal review, then remove its
   `<meta name="robots" content="noindex, follow">` and add
   `<url><loc>…/privacy/</loc></url>` to `sitemap.xml`.
6. Analytics: put the real GA4 measurement ID in `assets/js/main.js` (`GA_ID` at the top).
   Nothing loads until it's set AND a visitor accepts the banner.
7. All copy that mentions PMD: get PMD sign-off (financial-promotion review) before launch.

## Deploying to Netlify (recommended)

1. Push this repo to GitHub (or drag-and-drop the `site/` folder in the Netlify UI).
2. New site from Git -> publish directory: `site` (no build command). If you deploy by
   drag-and-drop instead, drop the `site` folder itself and move `netlify.toml` along with it.
3. Custom domain -> add the real domain, let Netlify provision HTTPS.
4. After HTTPS is live, uncomment the `Strict-Transport-Security` line in `netlify.toml`.

### Forms (this is the bit people miss)

Netlify form detection is OFF by default on new sites:

1. Site configuration -> Forms -> **Enable form detection**, then **redeploy**.
2. Submit a test enquiry on the live site; check it appears under Forms -> `enquiry`
   (the honeypot means bot fills are silently dropped; Akismet filters the rest).
3. Forms -> Form submission notifications -> add **Email notification** to the enquiry
   inbox. First email may land in spam; whitelist the sender.
4. Free tier includes 100 submissions/month; upgrade if outreach volume warrants it.

**Hosting somewhere other than Netlify?** The form needs a backend. Easiest swap is
Formspree: change the form tag to `<form action="https://formspree.io/f/YOUR_ID" method="POST">`,
delete the `data-netlify`, `netlify-honeypot` attributes and the hidden `form-name` input,
and rename the honeypot input to `_gotcha`. Note the free Formspree tier caps at 50
submissions/month and shows their thank-you page instead of `/thank-you/`.

## Post-deploy checklist

- [ ] Form detection enabled, redeployed, test submission received by email
- [ ] `curl -sI https://DOMAIN/ | grep -iE 'strict|frame|nosniff|referrer|permissions|security'`
      shows the security headers
- [ ] `https://DOMAIN/about` 301-redirects to `/about/` (Netlify Pretty URLs)
- [ ] Lighthouse re-run against the production URL (expect scores at or above the local ones)
- [ ] GA4 ID set + banner accept fires exactly one gtag request
- [ ] Placeholders list above fully cleared

## Fonts & photo licences

- Cabinet Grotesk and Switzer are from Fontshare (Indian Type Foundry) under the
  Fontshare Free Font Licence: free for commercial web use, self-hosting allowed.
- Photography is from Pexels under the Pexels licence (free for commercial use, no
  attribution required). Credits kept in `src-images/CREDITS.md` as a courtesy.
