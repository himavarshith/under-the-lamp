/**
 * Supabase Edge Function: Expire Overdue Invitations
 *
 * Deploy with: supabase functions deploy expire-invitations
 * Schedule via Supabase Dashboard cron: 0 * * * * (every hour)
 */
import { expireOverdueInvitations } from '../waitlist-engine/index.js'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const result = await expireOverdueInvitations()
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
