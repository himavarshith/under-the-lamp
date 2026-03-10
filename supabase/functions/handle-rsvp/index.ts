/**
 * Supabase Edge Function: Handle RSVP Response
 *
 * Deploy with: supabase functions deploy handle-rsvp
 * Called by the RSVP page when a user clicks Yes or No.
 */
import { handleRSVP } from "../waitlist-engine/index.js";
// @ts-ignore: Deno global is available in Supabase Edge Functions
declare const Deno: any;

// Explicitly type req as Request
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { token, response } = await req.json();

    if (!token || !["yes", "no"].includes(response)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await handleRSVP(token, response);

    return new Response(JSON.stringify(result), {
      status: result.error ? 400 : 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
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
