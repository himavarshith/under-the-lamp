/**
 * Supabase Edge Function: Send Invites (Manual Trigger)
 *
 * Deploy with: supabase functions deploy send-monthly-invites
 * Triggered manually from the Admin Dashboard — no cron schedule.
 */
import { sendMonthlyInvites } from "../waitlist-engine/index.js";

// @ts-ignore: Deno global is available in Supabase Edge Functions
declare const Deno: any;

// Explicitly type req as Request
Deno.serve(async (req: Request) => {
  // Verify this is called by the Supabase scheduler or an admin
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const result = await sendMonthlyInvites();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    // Handle unknown error type safely
    let message = "Unknown error";
    if (err && typeof err === "object" && "message" in err) {
      message = (err as any).message;
    } else if (typeof err === "string") {
      message = err;
    }
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
