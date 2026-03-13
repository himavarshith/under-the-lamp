import { useState, useEffect, useRef } from "react";
import BookOfTheMonth from "../components/BookOfTheMonth";
import { Users, BookOpen, Heart, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";

// Auto-scrolling photo carousel with logo overlay
function HeroCarousel() {
  const [photos, setPhotos] = useState([]);
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const posRef = useRef(0);

  useEffect(() => {
    async function fetchPhotos() {
      const { data: albums } = await supabase
        .from("albums")
        .select("id")
        .order("month", { ascending: false })
        .limit(6);
      if (!albums?.length) return;
      const ids = albums.map((a) => a.id);
      const { data: photoData } = await supabase
        .from("photos")
        .select("id, url")
        .in("album_id", ids)
        .limit(20);
      if (photoData?.length) setPhotos(photoData);
    }
    fetchPhotos();
  }, []);

  // Continuous pixel-by-pixel scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track || photos.length === 0) return;
    const speed = 0.5; // px per frame

    function step() {
      posRef.current += speed;
      const halfWidth = track.scrollWidth / 2;
      if (posRef.current >= halfWidth) posRef.current = 0;
      track.style.transform = `translateX(-${posRef.current}px)`;
      animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [photos]);

  const displayPhotos = photos.length ? [...photos, ...photos] : [];

  return (
    <section className="relative bg-carbon overflow-hidden h-[70vw] max-h-[560px] min-h-[260px]">
      {/* Scrolling photo strip */}
      {displayPhotos.length > 0 && (
        <div
          ref={trackRef}
          className="absolute inset-0 flex gap-2 will-change-transform"
          style={{ width: "max-content" }}
        >
          {displayPhotos.map((p, i) => (
            <img
              key={`${p.id}-${i}`}
              src={p.url}
              alt=""
              className="h-full w-auto object-cover opacity-60"
              draggable={false}
            />
          ))}
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />

      {/* Main logo centered + bottom-anchored */}
      <div className="absolute inset-x-0 bottom-8 md:bottom-12 flex flex-col items-center gap-3 px-4">
        <img
          src="/UTL Main Logo.svg"
          alt="Under the Lamp"
          className="w-56 md:w-80 lg:w-96 opacity-90 brightness-0 invert"
        />
        <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest font-sans">
          <MapPin className="w-3 h-3" />
          Bangalore's read-along book club
        </div>
        <p className="text-white/70 text-sm font-sans text-center max-w-sm">
          A discussion-driven book club where readers meet once a month to dive
          deep into great stories.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      {/* Hero — photo carousel */}
      <HeroCarousel />

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
    </div>
  );
}
