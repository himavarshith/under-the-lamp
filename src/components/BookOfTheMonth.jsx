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
      // After reversing, index 0 = newest. Use current book's index, else default to 0.
      const currentIdx = grouped.findIndex((s) => s.some((b) => b.is_current));
      setActiveIdx(currentIdx >= 0 ? currentIdx : 0);
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

      {/* Carousel */}
      <div className="overflow-hidden h-[272px] md:h-[232px]">
        <div
          className="flex select-none h-full"
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
            <div
              key={slideBooks[0].month}
              className="w-full h-full shrink-0 flex flex-col"
            >
              {/* Month + current badge */}
              <p className="text-lime/70 text-xs uppercase tracking-widest font-display flex items-center gap-2 mb-3 shrink-0">
                {monthLabel(slideBooks[0].month)}
                {slideBooks.some((b) => b.is_current) && (
                  <span className="bg-lime text-carbon px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Current
                  </span>
                )}
              </p>

              {slideBooks.length === 1 ? (
                /* ── Single pick: full-size layout ── */
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch flex-1 min-h-0">
                  <div
                    className="mx-auto md:mx-0 w-44 md:w-40 shrink-0 self-start md:self-stretch bg-carbon-light rounded-xl flex items-center justify-center shadow-xl overflow-hidden border border-parchment/10"
                    style={{ height: "100%", maxHeight: "224px" }}
                  >
                    {slideBooks[0].cover_url ? (
                      <img
                        src={slideBooks[0].cover_url}
                        alt={slideBooks[0].title}
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
                  <div className="flex-1 min-w-0 flex flex-col min-h-0">
                    <h3 className="font-serif italic text-2xl md:text-3xl text-parchment mb-1 leading-snug shrink-0">
                      {slideBooks[0].title}
                    </h3>
                    <p className="text-parchment/50 text-sm mb-3 font-sans shrink-0">
                      by {slideBooks[0].author}
                    </p>
                    <p className="text-parchment/70 leading-relaxed font-sans text-sm md:text-base overflow-y-auto flex-1 min-h-0 pr-1 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none]">
                      {slideBooks[0].description}
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Co-picks: side by side, each mirrors single-book layout at smaller scale ── */
                <div className="flex items-stretch flex-1 min-h-0">
                  {slideBooks.flatMap((b, bi) => {
                    const bookEl = (
                      <div
                        key={b.id}
                        className="flex-1 min-w-0 flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4"
                      >
                        {/* Cover */}
                        <div className="w-20 h-28 md:w-[88px] md:h-[120px] bg-carbon-light rounded-lg flex items-center justify-center shrink-0 shadow-lg overflow-hidden border border-parchment/10">
                          {b.cover_url ? (
                            <img
                              src={b.cover_url}
                              alt={b.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-5 h-5 text-lime/30" />
                          )}
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0 text-center md:text-left">
                          <h3 className="font-serif italic text-parchment text-sm md:text-base leading-snug mb-0.5 line-clamp-2">
                            {b.title}
                          </h3>
                          <p className="text-parchment/40 text-xs font-sans mb-0 md:mb-2">
                            by {b.author}
                          </p>
                          <p
                            className="hidden md:block text-parchment/60 text-xs leading-relaxed font-sans overflow-y-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none]"
                            style={{ maxHeight: "7rem" }}
                          >
                            {b.description}
                          </p>
                        </div>
                      </div>
                    );
                    if (bi === 0) return [bookEl];
                    return [
                      <div
                        key={`divider-${bi}`}
                        className="w-px bg-parchment/15 mx-4 md:mx-6 self-stretch shrink-0"
                      />,
                      bookEl,
                    ];
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav — prev/next with position counter */}
      {n > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-parchment/10">
          <button
            onClick={() => goTo(activeIdx - 1)}
            disabled={activeIdx === 0}
            aria-label="Newer month"
            className="flex items-center gap-1.5 text-xs font-sans text-parchment/50 hover:text-parchment disabled:opacity-20 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Newer
          </button>

          <span className="text-xs font-sans text-parchment/30">
            {activeIdx + 1} / {n}
          </span>

          <button
            onClick={() => goTo(activeIdx + 1)}
            disabled={activeIdx === n - 1}
            aria-label="Older month"
            className="flex items-center gap-1.5 text-xs font-sans text-parchment/50 hover:text-parchment disabled:opacity-20 transition"
          >
            Older
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
