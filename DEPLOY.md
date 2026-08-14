# Bright Penny — hosting and domain

**Live now:** https://bp-ads-manager.web.app
**Target:** https://brightpenny.co.uk (with www redirecting to it)

Hosted on **Firebase Hosting** inside the existing GCP project **bp-ads-manager**
(project number 694884790279, region europe-west2). Free tier, managed SSL, global CDN.

---

## ⚠️ Read this before editing DNS

`brightpenny.co.uk` **already has live Microsoft 365 email on it.** The current DNS holds:

| Type | Value | What it does |
|---|---|---|
| MX | `brightpenny-co-uk.mail.protection.outlook.com` | **Delivers your email. Do not touch.** |
| TXT | `NETORGFT21029602.onmicrosoft.com` | Microsoft 365 domain verification. **Do not touch.** |
| TXT | `v=spf1 include:secureserver.net -all` | SPF, stops your mail being marked as spam. **Do not touch.** |
| A | `13.248.243.5` and `76.223.105.230` | GoDaddy parking page. **These two get replaced.** |
| CNAME | `www` → `brightpenny.co.uk` | **This one gets replaced.** |

You are only changing the **A records** and the **www CNAME**, and **adding** one TXT.
If you delete the MX record or either existing TXT, email stops working immediately.

---

## What to do in GoDaddy

Sign in → **My Products** → find `brightpenny.co.uk` → **DNS** → **Manage DNS**.

### 1. Turn off domain forwarding first
If there's a **Forwarding** section with anything set, delete it. GoDaddy forwarding
overrides A records and will silently break the site.

### 2. Delete the two parking A records

Find both rows with **Type: A**, **Name: @** and delete them:

- `13.248.243.5`
- `76.223.105.230`

### 3. Add the new A record

| Field | Value |
|---|---|
| Type | `A` |
| Name | `@` |
| Value | `199.36.158.100` |
| TTL | 1 hour (or 600 seconds while testing) |

### 4. Add the ownership TXT record

| Field | Value |
|---|---|
| Type | `TXT` |
| Name | `@` |
| Value | `hosting-site=bp-ads-manager` |
| TTL | 1 hour |

This is an **addition**. Leave the two TXT records already there alone.

### 5. Replace the www CNAME

Find **Type: CNAME**, **Name: www** (currently pointing at `brightpenny.co.uk`) and
change its value to:

| Field | Value |
|---|---|
| Type | `CNAME` |
| Name | `www` |
| Value | `bp-ads-manager.web.app` |
| TTL | 1 hour |

### 6. Optional — speeds up the SSL certificate

If the certificate hasn't issued after a couple of hours, add this and it will:

| Field | Value |
|---|---|
| Type | `TXT` |
| Name | `_acme-challenge` |
| Value | `4q6jqdPC9jSYmt-9X3PWJbuTYEYv70cbSUf34Z13QcQ` |

Delete it once the padlock is showing.

---

## Then what

Google picks the change up automatically. Typically:

- **15 minutes to 2 hours** — DNS propagates, the site starts answering on the domain.
- **Up to 24 hours** — the SSL certificate issues and the padlock appears. Until it does
  you may see a browser warning. That's expected; don't panic and don't change anything.

Check progress at:
https://console.firebase.google.com/project/bp-ads-manager/hosting/sites

To check from a terminal:

```bash
dig +short brightpenny.co.uk A && curl -sI https://brightpenny.co.uk | head -1
```

You want to see `199.36.158.100` and `HTTP/2 200`.

---

## Redeploying after content changes

From the project folder:

```bash
firebase deploy --only hosting --project bp-ads-manager
```

Takes about 30 seconds. HTML is served with no cache so changes appear immediately;
images, fonts and CSS are cached for a year, so if you edit `theme.css` or `main.js`
rename the reference in the HTML (`theme.css?v=2`) to bust it.

---

## Still outstanding

1. **The enquiry form does not work yet.** Firebase Hosting is static, so there is no
   backend to receive the submission. Right now a visitor filling it in gets the
   thank-you page and **the enquiry is silently lost**. This must be wired up before any
   outreach goes out. See below.
2. **Placeholders in the copy** — regulatory disclosure, company number, fee/commission
   wording, and the privacy policy body. Search the `site/` folder for `[`.
3. **GA4** — put the real measurement ID in `site/assets/js/main.js` (`GA_ID`).
4. **Privacy page is `noindex`** until the policy is finalised; remove that meta tag and
   add the page to `sitemap.xml` when it's signed off.

### Wiring up the form

The intended route is a Cloud Function in the same project (europe-west2) that receives
the POST, emails `hello@brightpenny.co.uk` and writes a copy to Firestore so no enquiry
is ever lost. It needs one credential to send mail — either:

- a **Microsoft 365 app password** for the existing mailbox (keeps everything in-house), or
- a free **SendGrid / Resend API key** (more deliverable, but a third party).

Note: if you send via a third party, the SPF record will need updating, and that record
is currently `-all` (strict), so mail from an unlisted sender will be rejected.
