import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, Lamp, Loader2, Clock } from 'lucide-react'

export default function RSVP() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading') // loading | prompt | accepted | declined | expired | error
  const [invitation, setInvitation] = useState(null)

  useEffect(() => {
    async function fetchInvitation() {
      const { data, error } = await supabase
        .from('invitations')
        .select('*, waitlist(*)')
        .eq('token', token)
        .single()

      if (error || !data) {
        setStatus('error')
        return
      }

      if (data.status === 'accepted') {
        setStatus('accepted')
      } else if (data.status === 'declined') {
        setStatus('declined')
      } else if (new Date(data.expires_at) < new Date()) {
        setStatus('expired')
      } else {
        setStatus('prompt')
      }
      setInvitation(data)
    }

    if (token) fetchInvitation()
  }, [token])

  const respond = async (response) => {
    setStatus('loading')
    const newStatus = response === 'yes' ? 'accepted' : 'declined'

    // Update invitation
    await supabase
      .from('invitations')
      .update({ status: newStatus, responded_at: new Date().toISOString() })
      .eq('token', token)

    // Update waitlist entry
    if (invitation?.waitlist_id) {
      await supabase
        .from('waitlist')
        .update({
          status: newStatus,
          responded_at: new Date().toISOString(),
        })
        .eq('id', invitation.waitlist_id)
    }

    setStatus(newStatus)

    // If declined, the edge function cascade handler will pick up the next person
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-lamp-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lamp className="w-8 h-8 text-lamp-500" />
          </div>
          <h1 className="font-serif text-2xl text-warm-900">Under the Lamp</h1>
          <p className="text-warm-400 text-sm">Book Club RSVP</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100 text-center">
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="w-8 h-8 text-lamp-500 animate-spin mx-auto" />
            </div>
          )}

          {status === 'prompt' && invitation && (
            <>
              <h2 className="font-serif text-xl mb-2">You're Invited!</h2>
              <p className="text-warm-500 text-sm mb-6">
                Hi <strong>{invitation.waitlist?.name}</strong>, a spot has opened up at
                our next book club gathering! Would you like to join us?
              </p>
              <p className="text-xs text-warm-300 mb-8">
                This invitation expires in 24 hours.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => respond('yes')}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600
                             text-white font-medium py-3 rounded-xl transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  Yes, I'm in!
                </button>
                <button
                  onClick={() => respond('no')}
                  className="flex-1 flex items-center justify-center gap-2 bg-warm-200 hover:bg-warm-300
                             text-warm-700 font-medium py-3 rounded-xl transition"
                >
                  <XCircle className="w-5 h-5" />
                  Not this time
                </button>
              </div>
            </>
          )}

          {status === 'accepted' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-serif text-xl text-green-800 mb-2">You're In!</h2>
              <p className="text-warm-500 text-sm">
                Your spot is confirmed. We'll send you the details soon. See you under the lamp!
              </p>
            </>
          )}

          {status === 'declined' && (
            <>
              <XCircle className="w-16 h-16 text-warm-300 mx-auto mb-4" />
              <h2 className="font-serif text-xl mb-2">Maybe Next Time</h2>
              <p className="text-warm-500 text-sm">
                No worries! You'll stay on the list and we'll reach out again next month.
              </p>
            </>
          )}

          {status === 'expired' && (
            <>
              <Clock className="w-16 h-16 text-warm-300 mx-auto mb-4" />
              <h2 className="font-serif text-xl mb-2">Invitation Expired</h2>
              <p className="text-warm-500 text-sm">
                This invitation has expired, but don't worry — you'll be offered the next available spot.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h2 className="font-serif text-xl mb-2">Invalid Link</h2>
              <p className="text-warm-500 text-sm">
                This RSVP link doesn't seem valid. Please check your email for the correct link.
              </p>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-warm-400 hover:text-lamp-600 transition">
            ← Back to Under the Lamp
          </Link>
        </div>
      </div>
    </div>
  )
}
