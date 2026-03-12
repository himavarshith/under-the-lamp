import WaitlistForm from "../components/WaitlistForm";
import BookOfTheMonth from "../components/BookOfTheMonth";
import { Lamp, Users, BookOpen, Heart, MapPin, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-carbon overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 text-parchment/50 text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-10 border border-parchment/20">
            <MapPin className="w-3.5 h-3.5" />
            Bangalore's read-along book club
          </div>

          <h1 className="font-display text-6xl md:text-8xl text-lime mb-2 leading-none uppercase font-bold tracking-tight">
            Under the Lamp
          </h1>

          <p className="font-serif italic text-parchment/50 text-2xl md:text-3xl mb-12">
            book club
          </p>

          <p className="text-parchment/70 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-sans">
            A discussion-driven book club where readers meet once a month to
            dive deep into great stories.
          </p>

          <a
            href="#join"
            className="inline-flex items-center gap-2 border-2 border-lime text-lime hover:bg-lime hover:text-carbon
                       font-display font-bold uppercase tracking-wider px-8 py-4 rounded-xl transition"
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
              title: "Intimate Gatherings",
              desc: "We meet once a month on Sundays, 3–6 PM, at central Bangalore spots — Cubbon Park, Church Street, and more.",
            },
            {
              icon: BookOpen,
              title: "Read-Along Community",
              desc: "Each month, we (core team or members) pick one book for everyone to read, then hold a meeting to discuss it together.",
            },
            {
              icon: Heart,
              title: "Becoming a Member",
              desc: "Attend your first meeting as an invitee. Come a second time and you're an official UTL member with voting rights and access to events.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-lavender/40 rounded-2xl p-8 hover:bg-lavender/60 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-carbon rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-lime" />
              </div>
              <h3 className="font-display text-xl mb-2 uppercase tracking-wide text-brand-blue">
                {title}
              </h3>
              <p className="text-carbon/70 text-sm leading-relaxed font-sans">
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Book of the Month */}
        <BookOfTheMonth />
      </section>

      {/* Waitlist Sign-Up */}
      <section id="join" className="bg-lime py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-serif italic text-3xl mb-3 text-carbon">
              Join the Waitlist
            </h2>
            <p className="text-carbon/70 text-sm font-sans">
              We're currently at capacity, but we'd love to have you join us
              soon. Add your name and we'll reach out as soon as a spot opens
              up.
            </p>
            <p className="text-carbon/50 text-xs mt-2 font-sans leading-relaxed">
              If you're invited but can't attend, just let us know — you'll stay
              on the list. Decline twice and we'll move you down so others get a
              chance too.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-parchment-dark">
            <WaitlistForm />
          </div>
        </div>
      </section>
    </div>
  );
}
