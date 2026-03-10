import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function WaitlistForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', reason: '', area: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const { error } = await supabase.from('waitlist').insert({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        reason: form.reason.trim() || null,
        area: form.area || null,
        status: 'waiting',
      })

      if (error) {
        if (error.code === '23505') {
          setErrorMsg('This email is already on the waitlist!')
        } else {
          setErrorMsg('Something went wrong. Please try again.')
        }
        setStatus('error')
        return
      }

      setStatus('success')
      setForm({ name: '', email: '', phone: '', reason: '', area: '' })
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-serif text-xl text-green-800 mb-2">You're on the List!</h3>
        <p className="text-green-600 text-sm">
          We'll reach out when it's your turn. Keep an eye on your inbox.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm text-green-700 underline hover:no-underline"
        >
          Add another person
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="wl-name" className="block text-sm font-medium text-warm-700 mb-1">
          Name
        </label>
        <input
          id="wl-name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-900
                     placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-lamp-400/50
                     focus:border-lamp-400 transition"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="wl-email" className="block text-sm font-medium text-warm-700 mb-1">
          Email
        </label>
        <input
          id="wl-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-900
                     placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-lamp-400/50
                     focus:border-lamp-400 transition"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="wl-phone" className="block text-sm font-medium text-warm-700 mb-1">
          Mobile Number
          <span className="text-warm-400 font-normal"> — to coordinate</span>
        </label>
        <input
          id="wl-phone"
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-900
                     placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-lamp-400/50
                     focus:border-lamp-400 transition"
          placeholder="+91 98765 43210"
        />
      </div>

      <div>
        <label htmlFor="wl-reason" className="block text-sm font-medium text-warm-700 mb-1">
          Why do you want to join UTL?
          <span className="text-warm-400 font-normal"> — this won't affect your joining, be honest</span>
        </label>
        <textarea
          id="wl-reason"
          required
          rows={3}
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-900
                     placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-lamp-400/50
                     focus:border-lamp-400 transition resize-none"
          placeholder="I love reading and…"
        />
      </div>

      <div>
        <label htmlFor="wl-area" className="block text-sm font-medium text-warm-700 mb-1">
          Which area in Bangalore do you live in?
        </label>
        <select
          id="wl-area"
          value={form.area}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-900
                     focus:outline-none focus:ring-2 focus:ring-lamp-400/50
                     focus:border-lamp-400 transition"
        >
          <option value="">Select your area…</option>
          <option value="Koramangala">Koramangala</option>
          <option value="Indiranagar">Indiranagar</option>
          <option value="HSR Layout">HSR Layout</option>
          <option value="Whitefield">Whitefield</option>
          <option value="Jayanagar">Jayanagar</option>
          <option value="JP Nagar">JP Nagar</option>
          <option value="Malleshwaram">Malleshwaram</option>
          <option value="Rajajinagar">Rajajinagar</option>
          <option value="BTM Layout">BTM Layout</option>
          <option value="Electronic City">Electronic City</option>
          <option value="Marathahalli">Marathahalli</option>
          <option value="Bannerghatta Road">Bannerghatta Road</option>
          <option value="Yelahanka">Yelahanka</option>
          <option value="Hebbal">Hebbal</option>
          <option value="Sadashivanagar">Sadashivanagar</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 bg-lamp-500 hover:bg-lamp-600
                   text-white font-medium py-3 px-6 rounded-xl transition disabled:opacity-60
                   disabled:cursor-not-allowed shadow-lg shadow-lamp-500/20"
      >
        <Send className="w-4 h-4" />
        {status === 'loading' ? 'Joining...' : 'Join the Waitlist'}
      </button>
    </form>
  )
}
