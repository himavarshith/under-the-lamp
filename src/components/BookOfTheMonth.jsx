import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

const DEMO_BOOKS = [
  {
    id: "demo-1",
    month: "2026-01-01",
    title: "The Hitchhiker's Guide to the Galaxy",
    author: "Douglas Adams",
    cover_url: null,
    description:
      "Seconds before the Earth is demolished to make way for a hyperspace bypass, Arthur Dent is plucked off the planet by his friend Ford Prefect.",
    is_current: false,
  },
  {
    id: "demo-2",
    month: "2026-02-01",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    cover_url: null,
    description:
      "Told from the perspective of an Artificial Friend, this is a luminous novel about love, loss, and what it means to be human.",
    is_current: false,
  },
  {
    id: "demo-3",
    month: "2026-03-01",
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover_url: null,
    description:
      "A lone astronaut must save the earth from disaster in this propulsive science fiction adventure — from the author of The Martian.",
    is_current: true,
  },
];

function monthLabel(monthStr) {
  return new Date(monthStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

// Group flat book list into slides: one slide per month (array of books), newest first
function groupByMonth(books) {
  const map = {};
  for (const b of books) {
    const key = b.month.slice(0, 7); // YYYY-MM
    if (!map[key]) map[key] = [];
    map[key].push(b);
  }
  return Object.keys(map)
    .sort()
    .reverse()
    .map((k) => map[k]);
}

export default function BookOfTheMonth() {
  const [slides, setSlides] = useState([]); // each slide = array of books for that month
  const [activeIdx, setActiveIdx] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const directionLocked = useRef(null);
  const activePillRef = useRef(null);

  // Scroll active pill into view whenever it changes
  useEffect(() => {
    activePillRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIdx]);

  useEffect(() => {
    async function fetchBooks() {
      const { data } = await supabase
        .from("books")
        .select("*")
        .order("month", { ascending: true });

      const list = data?.length ? data : DEMO_BOOKS;
      const grouped = groupByMonth(list);
      setSlides(grouped);
      const currentIdx = grouped.findIndex((s) => s.some((b) => b.is_current));
      setActiveIdx(currentIdx >= 0 ? currentIdx : grouped.length - 1);
    }
    fetchBooks();
  }, []);

  if (!slides.length) return null;

  const n = slides.length;

  function goTo(idx) {
    if (idx < 0 || idx >= n) return;
    setActiveIdx(idx);
    setDragOffset(0);
    setIsDragging(false);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    directionLocked.current = null;
    setDragOffset(0);
  }

  function handleTouchMove(e) {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!directionLocked.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      directionLocked.current = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
    }

    if (directionLocked.current !== "h") return;

    setIsDragging(true);
    const atEdge =
      (activeIdx === 0 && dx > 0) || (activeIdx === n - 1 && dx < 0);
    setDragOffset(atEdge ? dx * 0.2 : dx);
  }

  function handleTouchEnd() {
    if (directionLocked.current === "h") {
      const THRESHOLD = 60;
      if (dragOffset < -THRESHOLD && activeIdx < n - 1) {
        goTo(activeIdx + 1);
      } else if (dragOffset > THRESHOLD && activeIdx > 0) {
        goTo(activeIdx - 1);
      } else {
        setDragOffset(0);
        setIsDragging(false);
      }
    } else {
      setDragOffset(0);
      setIsDragging(false);
    }
    touchStartX.current = null;
    directionLocked.current = null;
  }

  return (
    <section className="bg-brand-blue rounded-3xl p-6 md:p-12 text-parchment">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-lime shrink-0" />
        <span className="text-xs uppercase tracking-widest font-display font-bold bg-lime text-carbon px-3 py-1 rounded-full">
          Book of the Month
        </span>
      </div>

      {/* Month pill tabs */}
      {n > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none]">
          {slides.map((s, i) => (
            <button
              key={s[0].month}
              ref={i === activeIdx ? activePillRef : null}
              onClick={() => goTo(i)}
              className={`shrink-0 text-xs font-sans font-medium px-3 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap
                ${
                  i === activeIdx
                    ? "bg-lime text-carbon border-lime"
                    : "bg-transparent text-parchment/60 border-parchment/20 hover:text-parchment hover:border-parchment/50"
                }`}
            >
              {monthLabel(s[0].month)}
              {s.some((b) => b.is_current) && (
                <span
                  className={`ml-1.5 ${i === activeIdx ? "opacity-60" : "text-lime"}`}
                >
                  ·
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Carousel with flanking arrows */}
      <div className="flex items-center gap-3">
        {/* Left arrow — desktop only */}
        {n > 1 && (
          <button
            onClick={() => goTo(activeIdx - 1)}
            disabled={activeIdx === 0}
            aria-label="Previous book"
            className="hidden md:flex shrink-0 w-9 h-9 rounded-full border border-parchment/20 items-center justify-center
                       text-parchment/60 hover:text-parchment hover:bg-parchment/10 hover:border-parchment/40
                       disabled:opacity-20 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Sliding track */}
        <div className="flex-1 overflow-hidden">
          <div
            className="flex select-none"
            style={{
              transform: `translateX(calc(-${activeIdx * 100}% + ${dragOffset}px))`,
              transition: isDragging
                ? "none"
                : "transform 350ms cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "transform",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {slides.map((slideBooks) => (
              <div key={slideBooks[0].month} className="w-full shrink-0">
                {/* Month + current badge */}
                <p className="text-lime/70 text-xs uppercase tracking-widest font-display flex items-center gap-2 mb-4">
                  {monthLabel(slideBooks[0].month)}
                  {slideBooks.some((b) => b.is_current) && (
                    <span className="bg-lime text-carbon px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Current
                    </span>
                  )}
                  {slideBooks.length > 1 && (
                    <span className="text-parchment/40 text-[10px] font-sans normal-case tracking-normal">
                      {slideBooks.length} co-picks
                    </span>
                  )}
                </p>

                {/* Books — first one full-size, extras compact below a divider */}
                {slideBooks.map((b, bi) => (
                  <div key={b.id}>
                    {bi > 0 && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-parchment/10" />
                        <span className="text-parchment/30 text-[10px] uppercase tracking-widest font-sans">
                          also
                        </span>
                        <div className="flex-1 h-px bg-parchment/10" />
                      </div>
                    )}

                    <div
                      className={`flex gap-4 items-start ${bi === 0 ? "flex-col md:flex-row md:gap-8" : "flex-row"}`}
                    >
                      {/* Cover */}
                      <div
                        className={`bg-carbon-light rounded-xl flex items-center justify-center shrink-0 shadow-xl overflow-hidden border border-parchment/10
                        ${bi === 0 ? "mx-auto md:mx-0 w-44 h-60 md:w-40 md:h-56" : "w-12 h-16"}`}
                      >
                        {b.cover_url ? (
                          <img
                            src={b.cover_url}
                            alt={b.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <BookOpen
                              className={`text-lime/30 mx-auto ${bi === 0 ? "w-10 h-10 mb-2" : "w-4 h-4"}`}
                            />
                            {bi === 0 && (
                              <p className="text-xs text-parchment/30 font-sans">
                                Cover
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-serif italic text-parchment leading-snug mb-1 ${bi === 0 ? "text-2xl md:text-3xl" : "text-base"}`}
                        >
                          {b.title}
                        </h3>
                        <p
                          className={`text-parchment/50 font-sans ${bi === 0 ? "text-sm mb-4" : "text-xs mb-1"}`}
                        >
                          by {b.author}
                        </p>
                        {bi === 0 && (
                          <p className="text-parchment/70 leading-relaxed font-sans text-sm md:text-base">
                            {b.description}
                          </p>
                        )}
                        {bi > 0 && b.description && (
                          <p className="text-parchment/50 font-sans text-xs line-clamp-2">
                            {b.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right arrow — desktop only */}
        {n > 1 && (
          <button
            onClick={() => goTo(activeIdx + 1)}
            disabled={activeIdx === n - 1}
            aria-label="Next book"
            className="hidden md:flex shrink-0 w-9 h-9 rounded-full border border-parchment/20 items-center justify-center
                       text-parchment/60 hover:text-parchment hover:bg-parchment/10 hover:border-parchment/40
                       disabled:opacity-20 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dots + mobile arrows */}
      {n > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          {/* Prev — mobile only */}
          <button
            onClick={() => goTo(activeIdx - 1)}
            disabled={activeIdx === 0}
            aria-label="Previous book"
            className="md:hidden w-8 h-8 rounded-full border border-parchment/20 flex items-center justify-center
                       text-parchment/60 hover:text-parchment hover:bg-parchment/10
                       disabled:opacity-20 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to month ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIdx
                    ? "w-5 h-2 bg-lime"
                    : "w-2 h-2 bg-parchment/25 hover:bg-parchment/50"
                }`}
              />
            ))}
          </div>

          {/* Next — mobile only */}
          <button
            onClick={() => goTo(activeIdx + 1)}
            disabled={activeIdx === n - 1}
            aria-label="Next book"
            className="md:hidden w-8 h-8 rounded-full border border-parchment/20 flex items-center justify-center
                       text-parchment/60 hover:text-parchment hover:bg-parchment/10
                       disabled:opacity-20 transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
