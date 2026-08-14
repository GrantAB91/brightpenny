/**
 * Bright Penny — enquiry form handler.
 *
 * Served same-origin at /api/enquiry via a Firebase Hosting rewrite, which
 * matters because the site's CSP sets `form-action 'self'`.
 *
 * Every enquiry is written to Firestore FIRST and emailed second. If the mail
 * transport is unconfigured or fails, the enquiry is still captured and the
 * visitor still gets the thank-you page — a lead is never silently lost.
 */
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import nodemailer from "nodemailer";

initializeApp();
const db = getFirestore();

// smtp://user:password@host:587  — works for Microsoft 365, SendGrid, Resend, etc.
const SMTP_URL = defineSecret("SMTP_URL");
const MAIL_TO = defineString("MAIL_TO", { default: "hello@brightpenny.co.uk" });
const MAIL_FROM = defineString("MAIL_FROM", { default: "hello@brightpenny.co.uk" });

const FIELDS = ["name", "business", "email", "phone", "finance-type", "message"];
const MAX_LEN = 4000;

const clean = (v) => String(v ?? "").trim().slice(0, MAX_LEN);
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

function seeOther(res, path) {
  res.set("Cache-Control", "no-store");
  res.redirect(303, path);
}

export const enquiry = onRequest(
  {
    region: "europe-west2",
    secrets: [SMTP_URL],
    cors: false,
    memory: "256MiB",
    timeoutSeconds: 30,
    maxInstances: 10,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.set("Allow", "POST");
      res.status(405).send("Method not allowed");
      return;
    }

    const body = req.body ?? {};

    // Honeypot: real people never fill this in. Redirect as if all was well so
    // the bot learns nothing.
    if (clean(body["bot-field"])) {
      logger.info("enquiry rejected: honeypot filled");
      seeOther(res, "/thank-you/");
      return;
    }

    const data = Object.fromEntries(FIELDS.map((f) => [f, clean(body[f])]));

    if (!data.name || !data.business || !looksLikeEmail(data.email)) {
      logger.warn("enquiry rejected: missing or invalid required fields");
      res.status(400).send("Please go back and check your name, business and email address.");
      return;
    }

    const record = {
      ...data,
      consent: Boolean(clean(body.consent)),
      receivedAt: FieldValue.serverTimestamp(),
      userAgent: clean(req.get("user-agent")).slice(0, 400),
      // Firebase Hosting passes the visitor IP through this header
      ip: clean(req.get("x-forwarded-for")).split(",")[0].slice(0, 64),
    };

    // 1. Capture first. This is the bit that must not fail.
    let docId = null;
    try {
      const doc = await db.collection("enquiries").add(record);
      docId = doc.id;
      logger.info("enquiry stored", { docId });
    } catch (err) {
      logger.error("FAILED to store enquiry", err);
    }

    // 2. Then try to forward it on.
    const smtp = SMTP_URL.value();
    if (smtp && smtp.startsWith("smtp")) {
      try {
        const transport = nodemailer.createTransport(smtp);
        const lines = [
          `Name:      ${data.name}`,
          `Business:  ${data.business}`,
          `Email:     ${data.email}`,
          `Phone:     ${data.phone || "(not given)"}`,
          `Finance:   ${data["finance-type"] || "(not specified)"}`,
          "",
          "Message:",
          data.message || "(none)",
          "",
          `Consent given: ${record.consent ? "yes" : "NO"}`,
          docId ? `Reference: ${docId}` : "",
        ].filter(Boolean);

        await transport.sendMail({
          to: MAIL_TO.value(),
          from: MAIL_FROM.value(),
          replyTo: data.email,
          subject: `Website enquiry — ${data.business}`,
          text: lines.join("\n"),
        });
        logger.info("enquiry emailed", { docId });
      } catch (err) {
        // Deliberately swallowed: the enquiry is already safe in Firestore.
        logger.error("enquiry email failed (record is still stored)", err);
      }
    } else {
      logger.warn("SMTP_URL not configured — enquiry stored but not emailed", { docId });
    }

    seeOther(res, "/thank-you/");
  }
);
