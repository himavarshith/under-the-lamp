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

export default function BookOfTheMonth() {
  const [books, setBooks] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const directionLocked = useRef(null);

  useEffect(() => {
    async function fetchBooks() {
      const { data } = await supabase
        .from("books")
        .select("*")
        .order("month", { ascending: true });

      const list = data?.length ? data : DEMO_BOOKS;
      setBooks(list);
      const currentIdx = list.findIndex((b) => b.is_current);
      setActiveIdx(currentIdx >= 0 ? currentIdx : list.length - 1);
    }
    fetchBooks();
  }, []);

  if (!books.length) return null;

  const n = books.length;

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
    <section className="bg-brand-blue rounded-3xl p-8 md:p-12 text-parchment">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-lime" />
          <span className="text-xs uppercase tracking-widest font-display font-bold bg-lime text-carbon px-3 py-1 rounded-full">
            Book of the Month
          </span>
        </div>

        {/* Month picker dropdown */}
        {n > 1 && (
          <select
            value={activeIdx}
            onChange={(e) => goTo(Number(e.target.value))}
            className="bg-brand-blue-dark text-parchment text-xs rounded-lg px-3 py-1.5 border border-parchment/20
                       focus:outline-none focus:ring-2 focus:ring-lime/40 font-sans cursor-pointer"
          >
            {books.map((b, i) => (
              <option key={b.id} value={i}>
                {monthLabel(b.month)}
                {b.is_current ? " · Current" : ""}
              </option>
            ))}
          </select>
        )}
      </div>

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
            {books.map((b) => (
              <div
                key={b.id}
                className="w-full shrink-0 flex flex-col md:flex-row gap-6 md:gap-8 items-start"
              >
                {/* Cover — centred on mobile */}
                <div className="mx-auto md:mx-0 w-44 h-60 md:w-40 md:h-56 bg-carbon-light rounded-xl flex items-center justify-center shrink-0 shadow-2xl overflow-hidden border border-parchment/10">
                  {b.cover_url ? (
                    <img
                      src={b.cover_url}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <BookOpen className="w-10 h-10 text-lime/30 mx-auto mb-2" />
                      <p className="text-xs text-parchment/30 font-sans">
                        Cover
                      </p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-lime/70 text-xs uppercase tracking-widest font-display mb-2 flex items-center gap-2">
                    {monthLabel(b.month)}
                    {b.is_current && (
                      <span className="bg-lime text-carbon px-2 py-0.5 rounded-full text-[10px] font-bold">
                        Current
                      </span>
                    )}
                  </p>
                  <h3 className="font-serif italic text-2xl md:text-3xl text-parchment mb-1 leading-snug">
                    {b.title}
                  </h3>
                  <p className="text-parchment/50 text-sm mb-4 font-sans">
                    by {b.author}
                  </p>
                  <p className="text-parchment/70 leading-relaxed font-sans text-sm md:text-base">
                    {b.description}
                  </p>
                </div>
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
            {books.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to book ${i + 1}`}
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
