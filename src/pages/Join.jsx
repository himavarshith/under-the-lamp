import WaitlistForm from "../components/WaitlistForm";

export default function Join() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center px-6 py-16 gap-8">
      {/* Logo */}
      <img
        src="/UTL Main Logo.svg"
        alt="Under the Lamp"
        className="w-72 md:w-[28rem] opacity-90"
      />

      <div className="w-full max-w-md">
        <div className="text-center mb-5">
          <h2 className="font-serif italic text-3xl mb-2 text-carbon">
            Join the Waitlist
          </h2>
          <p className="text-carbon/60 text-sm font-sans leading-relaxed">
            We're currently at capacity, but we'd love to have you join us soon.
            Add your name and we'll reach out as soon as a spot opens up.
          </p>
          <p className="text-carbon/40 text-xs mt-2 font-sans leading-relaxed">
            If you're invited but can't attend, just let us know — you'll stay
            on the list. Decline twice and we'll move you down so others get a
            chance too.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl mb-10">
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
}
