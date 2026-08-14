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

## The enquiry form

**Working.** The form posts to a Cloud Function (`enquiry`, europe-west2), served
same-origin at `/api/enquiry` via a Hosting rewrite so it satisfies the site's CSP.

Every submission is **written to Firestore first, then emailed**. If the mail transport
is down or misconfigured the enquiry is still captured and the visitor still sees the
thank-you page, so a lead can never be silently lost. Submissions live in the
`enquiries` collection:

https://console.firebase.google.com/project/bp-ads-manager/firestore/data/~2Fenquiries

Firestore rules deny all browser access; only the function can write, using the Admin SDK.

### One step left: turn on the email

The function needs an SMTP credential, stored in Secret Manager as `SMTP_URL`. Until it
is set, enquiries are captured but not emailed.

**Microsoft 365** (keeps everything in-house; needs SMTP AUTH enabled on the mailbox and
an app password):

```bash
printf 'smtp://hello@brightpenny.co.uk:APP_PASSWORD@smtp.office365.com:587' | \
  gcloud secrets versions add SMTP_URL --project=bp-ads-manager --data-file=-
```

**SendGrid / Resend** (better deliverability; free tier is plenty):

```bash
printf 'smtp://apikey:YOUR_API_KEY@smtp.sendgrid.net:587' | \
  gcloud secrets versions add SMTP_URL --project=bp-ads-manager --data-file=-
```

Then redeploy the function so it picks up the new version:

```bash
firebase deploy --only functions --project bp-ads-manager
```

⚠️ If you use a third party, the SPF record is currently `-all` (strict). You must add
their include to it or the mail will be rejected. Microsoft 365 needs no SPF change.

### Still outstanding

1. **Placeholders in the copy** — regulatory disclosure, company number, fee/commission
   wording, and the privacy policy body. Search the `site/` folder for `[`.
3. **GA4** — put the real measurement ID in `site/assets/js/main.js` (`GA_ID`).
4. **Privacy page is `noindex`** until the policy is finalised; remove that meta tag and
   add the page to `sitemap.xml` when it's signed off.

### One DNS record still to fix

The `www` CNAME did not import — it still points at the apex instead of Firebase. Edit
that single record in GoDaddy:

| Type | Name | Value |
|---|---|---|
| CNAME | `www` | `bp-ads-manager.web.app` |

The apex (`brightpenny.co.uk`) imported correctly and is already serving.
