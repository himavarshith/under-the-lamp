import WaitlistForm from '../components/WaitlistForm'
import BookOfTheMonth from '../components/BookOfTheMonth'
import { Lamp, Users, BookOpen, Heart, MapPin, Calendar } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-warm-900 overflow-hidden">
        {/* Lamp glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-lamp-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-lamp-500/10 text-lamp-300 text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <MapPin className="w-3.5 h-3.5" />
            Bangalore's read-along book club
          </div>

          <h1 className="font-serif text-5xl md:text-7xl text-lamp-100 mb-6 leading-tight">
            Under the <span className="text-lamp-400">Lamp</span>
          </h1>

          <p className="text-warm-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            A discussion-driven book club where readers meet once a month to dive deep into
            great stories. One book, one lamp, one conversation at a time.
          </p>

          <a
            href="#join"
            className="inline-flex items-center gap-2 bg-lamp-500 hover:bg-lamp-600 text-white
                       font-medium px-8 py-4 rounded-xl transition shadow-lg shadow-lamp-500/20"
          >
            Join the Waitlist
          </a>
        </div>
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Users,
              title: 'Intimate Gatherings',
              desc: 'We meet once a month on Sundays, 3–6 PM, at central Bangalore spots — Cubbon Park, Church Street, and more.',
            },
            {
              icon: BookOpen,
              title: 'Read-Along Community',
              desc: 'Each month, we (core team or members) pick one book for everyone to read, then hold a meeting to discuss it together.',
            },
            {
              icon: Heart,
              title: 'Becoming a Member',
              desc: 'Attend your first meeting as an invitee. Come a second time and you\'re an official UTL member with voting rights and access to events.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100 hover:shadow-md transition"
            >
              <div className="w-12 h-12 bg-lamp-50 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-lamp-600" />
              </div>
              <h3 className="font-serif text-xl mb-2">{title}</h3>
              <p className="text-warm-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Book of the Month */}
        <BookOfTheMonth />
      </section>

      {/* Waitlist Sign-Up */}
      <section id="join" className="bg-warm-100/50 py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl mb-3">Join the Waitlist</h2>
            <p className="text-warm-500 text-sm">
              We're currently at capacity, but we'd love to have you join us soon.
              Add your name and we'll reach out as soon as a spot opens up.
            </p>
            <p className="text-warm-400 text-xs mt-2">
              If you're invited but can't attend, just let us know — you'll stay on the list.
              Decline twice and we'll move you down so others get a chance too.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
            <WaitlistForm />
          </div>
        </div>
      </section>
    </div>
  )
}
