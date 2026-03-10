/**
 * Under the Lamp — Waitlist Cascade Engine
 *
 * This module contains the core logic for the automated invitation cascade system.
 * It's designed to run as a Supabase Edge Function (Deno Deploy) but the logic
 * is portable to any serverless environment.
 *
 * FLOW:
 * 1. Monthly Trigger (cron) → sends invites to top N waiters
 * 2. RSVP Response → if "No" or timeout → cascade to next person
 * 3. Confirmation → if "Yes" → lock spot, send confirmation
 */

// ─── Configuration ───────────────────────────────────────────
const INVITE_BATCH_SIZE = 4; // How many people to invite per month
const RSVP_TIMEOUT_HOURS = 24; // Hours before an invite expires
const SITE_URL = Deno.env.get("SITE_URL") || "https://underthelamp.club";
const RESEND_API_KEY =
  Deno.env.get("re_JVL19u6r_PWemJp663cZegiHPSSKib79g") || "";
const FROM_EMAIL = "Under the Lamp <https://underthelamp.club>";

// ─── Supabase Client (server-side with service role key) ─────
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  );
}

// ─── Email Service (Resend integration) ─────────────────────
async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Body preview: ${html.substring(0, 200)}...`);
    return { success: true, mock: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });

  return { success: res.ok, data: await res.json() };
}

// ─── Email Templates ────────────────────────────────────────
function invitationEmailHtml(name, rsvpToken) {
  const yesUrl = `${SITE_URL}/rsvp/${rsvpToken}?r=yes`;
  const noUrl = `${SITE_URL}/rsvp/${rsvpToken}?r=no`;
  const rsvpUrl = `${SITE_URL}/rsvp/${rsvpToken}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Georgia',serif;background-color:#FAF5F0;">
  <div style="max-width:520px;margin:40px auto;padding:40px;background:white;border-radius:16px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:32px;margin-bottom:8px;">🪔</div>
      <h1 style="font-size:24px;color:#3F2A18;margin:0;">Under the Lamp</h1>
      <p style="color:#9A7548;font-size:13px;margin-top:4px;">Book Club</p>
    </div>

    <p style="color:#3F2A18;font-size:16px;line-height:1.6;">
      Hi <strong>${name}</strong>,
    </p>
    <p style="color:#5E4328;font-size:15px;line-height:1.6;">
      Great news — a spot has opened up at our next book club gathering!
      We'd love to have you join us under the lamp.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${rsvpUrl}" style="display:inline-block;background-color:#F59E0B;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
        RSVP Now
      </a>
    </div>

    <p style="color:#9A7548;font-size:13px;text-align:center;">
      ⏳ This invitation expires in 24 hours.
    </p>

    <hr style="border:none;border-top:1px solid #F0E6D8;margin:24px 0;">
    <p style="color:#C6A478;font-size:12px;text-align:center;">
      Under the Lamp Book Club · One book, one lamp, one story at a time.
    </p>
  </div>
</body>
</html>`;
}

function confirmationEmailHtml(name) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Georgia',serif;background-color:#FAF5F0;">
  <div style="max-width:520px;margin:40px auto;padding:40px;background:white;border-radius:16px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:32px;margin-bottom:8px;">✨</div>
      <h1 style="font-size:24px;color:#3F2A18;margin:0;">You're In!</h1>
    </div>

    <p style="color:#3F2A18;font-size:16px;line-height:1.6;">
      Hi <strong>${name}</strong>,
    </p>
    <p style="color:#5E4328;font-size:15px;line-height:1.6;">
      Your spot is confirmed for this month's gathering. We'll send you the
      time, place, and book details closer to the date.
    </p>
    <p style="color:#5E4328;font-size:15px;line-height:1.6;">
      See you under the lamp! 🪔
    </p>

    <hr style="border:none;border-top:1px solid #F0E6D8;margin:24px 0;">
    <p style="color:#C6A478;font-size:12px;text-align:center;">
      Under the Lamp Book Club
    </p>
  </div>
</body>
</html>`;
}

// ─── Core Engine Functions ───────────────────────────────────

/**
 * Send invitations to the top N people on the waitlist.
 * Triggered manually by the admin from the dashboard.
 */
export async function sendMonthlyInvites() {
  const supabase = getSupabaseAdmin();
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01"; // e.g. "2026-03-01"

  // Get the next people in line
  const { data: waiters, error } = await supabase
    .from("waitlist")
    .select("*")
    .eq("status", "waiting")
    .order("position")
    .limit(INVITE_BATCH_SIZE);

  if (error || !waiters?.length) {
    console.log("No one to invite:", error?.message || "empty queue");
    return { invited: 0 };
  }

  const results = [];

  for (const person of waiters) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + RSVP_TIMEOUT_HOURS * 60 * 60 * 1000,
    );

    // Create invitation record
    const { error: invError } = await supabase.from("invitations").insert({
      waitlist_id: person.id,
      month: currentMonth,
      token,
      status: "pending",
      expires_at: expiresAt.toISOString(),
    });

    if (invError) {
      console.error(
        `Failed to create invitation for ${person.email}:`,
        invError,
      );
      continue;
    }

    // Update waitlist status
    await supabase
      .from("waitlist")
      .update({ status: "invited", invited_at: new Date().toISOString() })
      .eq("id", person.id);

    // Send invitation email
    const emailResult = await sendEmail({
      to: person.email,
      subject: "You're invited to Under the Lamp! 🪔",
      html: invitationEmailHtml(person.name, token),
    });

    results.push({
      name: person.name,
      email: person.email,
      token,
      emailResult,
    });
  }

  console.log(`Sent ${results.length} invitations`);
  return { invited: results.length, results };
}

/**
 * Handle an RSVP response (yes/no).
 * If "no", automatically cascade to the next person.
 */
export async function handleRSVP(token, response) {
  const supabase = getSupabaseAdmin();

  // Find the invitation
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*, waitlist(*)")
    .eq("token", token)
    .single();

  if (error || !invitation) {
    return { error: "Invalid invitation token" };
  }

  if (invitation.status !== "pending") {
    return { error: "This invitation has already been responded to" };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { error: "This invitation has expired" };
  }

  const newStatus = response === "yes" ? "accepted" : "declined";

  // Update invitation
  await supabase
    .from("invitations")
    .update({ status: newStatus, responded_at: new Date().toISOString() })
    .eq("id", invitation.id);

  // Update waitlist entry
  await supabase
    .from("waitlist")
    .update({
      status: newStatus,
      responded_at: new Date().toISOString(),
    })
    .eq("id", invitation.waitlist_id);

  if (response === "yes") {
    // Reset decline count on acceptance
    await supabase
      .from("waitlist")
      .update({ decline_count: 0 })
      .eq("id", invitation.waitlist_id);

    // Send confirmation email
    await sendEmail({
      to: invitation.waitlist.email,
      subject: "Confirmed! See you under the lamp ✨",
      html: confirmationEmailHtml(invitation.waitlist.name),
    });

    return { status: "accepted", name: invitation.waitlist.name };
  } else {
    // Increment decline count
    const newDeclineCount = (invitation.waitlist.decline_count || 0) + 1;
    const updates = { decline_count: newDeclineCount };

    // Decline twice = moved down the list so others get a chance
    if (newDeclineCount >= 2) {
      // Get the last position in the queue
      const { data: lastEntry } = await supabase
        .from("waitlist")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)
        .single();

      updates.position = (lastEntry?.position || 0) + 1;
      updates.status = "waiting";
      updates.decline_count = 0; // reset after being moved down

      await supabase
        .from("waitlist")
        .update(updates)
        .eq("id", invitation.waitlist_id);
    }

    // CASCADE: Invite the next person in line
    await cascadeToNext(invitation.month);
    return {
      status: "declined",
      cascaded: true,
      movedDown: newDeclineCount >= 2,
    };
  }
}

/**
 * Cascade: invite the next waiting person for this month.
 */
async function cascadeToNext(month) {
  const supabase = getSupabaseAdmin();

  // Find the next person who hasn't been invited yet
  const { data: nextPerson } = await supabase
    .from("waitlist")
    .select("*")
    .eq("status", "waiting")
    .order("position")
    .limit(1)
    .single();

  if (!nextPerson) {
    console.log("No more people in the queue to cascade to");
    return;
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + RSVP_TIMEOUT_HOURS * 60 * 60 * 1000);

  await supabase.from("invitations").insert({
    waitlist_id: nextPerson.id,
    month,
    token,
    status: "pending",
    expires_at: expiresAt.toISOString(),
  });

  await supabase
    .from("waitlist")
    .update({ status: "invited", invited_at: new Date().toISOString() })
    .eq("id", nextPerson.id);

  await sendEmail({
    to: nextPerson.email,
    subject: "A spot just opened — you're invited! 🪔",
    html: invitationEmailHtml(nextPerson.name, token),
  });

  console.log(
    `Cascaded invitation to ${nextPerson.name} (${nextPerson.email})`,
  );
}

/**
 * Expire overdue invitations and cascade.
 * Should run every hour via cron.
 */
export async function expireOverdueInvitations() {
  const supabase = getSupabaseAdmin();

  const { data: expired } = await supabase
    .from("invitations")
    .select("*, waitlist(*)")
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString());

  if (!expired?.length) return { expired: 0 };

  for (const inv of expired) {
    await supabase
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", inv.id);

    await supabase
      .from("waitlist")
      .update({ status: "expired" })
      .eq("id", inv.waitlist_id);

    // Cascade to next person
    await cascadeToNext(inv.month);
  }

  return { expired: expired.length };
}
