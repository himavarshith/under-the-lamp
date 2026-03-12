import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

// Demo books ordered oldest → newest (carousel scrolls left=older, right=newer)
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
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    async function fetchBooks() {
      const { data } = await supabase
        .from("books")
        .select("*")
        .order("month", { ascending: true });

      const list = data?.length ? data : DEMO_BOOKS;
      setBooks(list);
      // Start at the current book, or the latest
      const currentIdx = list.findIndex((b) => b.is_current);
      setActiveIdx(currentIdx >= 0 ? currentIdx : list.length - 1);
    }
    fetchBooks();
  }, []);

  // Scroll to a card by index smoothly
  const scrollToIdx = useCallback((idx) => {
    const card = cardRefs.current[idx];
    if (card && scrollRef.current) {
      const container = scrollRef.current;
      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const containerWidth = container.offsetWidth;
      container.scrollTo({
        left: cardLeft - (containerWidth - cardWidth) / 2,
        behavior: "smooth",
      });
    }
    setActiveIdx(idx);
  }, []);

  useEffect(() => {
    // After books load, scroll to active index without animation
    if (books.length && cardRefs.current[activeIdx]) {
      const card = cardRefs.current[activeIdx];
      const container = scrollRef.current;
      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const containerWidth = container.offsetWidth;
      container.scrollLeft = cardLeft - (containerWidth - cardWidth) / 2;
    }
  }, [books]); // eslint-disable-line react-hooks/exhaustive-deps

  const goPrev = () => scrollToIdx(Math.max(0, activeIdx - 1));
  const goNext = () => scrollToIdx(Math.min(books.length - 1, activeIdx + 1));

  const active = books[activeIdx];

  if (!books.length) return null;

  return (
    <section className="bg-brand-blue rounded-3xl overflow-hidden text-parchment">
      {/* Header bar */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-lime" />
          <span className="text-xs uppercase tracking-widest font-display font-bold bg-lime text-carbon px-3 py-1 rounded-full">
            Book of the Month
          </span>
        </div>

        {/* Month/year dropdown */}
        <select
          value={activeIdx}
          onChange={(e) => scrollToIdx(Number(e.target.value))}
          className="bg-brand-blue-dark text-parchment text-sm rounded-lg px-3 py-2 border border-parchment/20
                     focus:outline-none focus:ring-2 focus:ring-lime/40 font-sans cursor-pointer"
        >
          {books.map((b, i) => (
            <option key={b.id} value={i}>
              {monthLabel(b.month)}
              {b.is_current ? " · Current" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Carousel scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth px-8 pb-8 pt-2"
        style={{ scrollbarWidth: "none" }}
      >
        {books.map((book, i) => (
          <div
            key={book.id}
            ref={(el) => (cardRefs.current[i] = el)}
            onClick={() => scrollToIdx(i)}
            className={`flex-none w-[min(80vw,560px)] rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start cursor-pointer transition-all duration-300
              ${
                i === activeIdx
                  ? "bg-parchment/15 ring-2 ring-lime/60"
                  : "bg-parchment/5 opacity-60 hover:opacity-80"
              }`}
          >
            {/* Cover */}
            <div className="w-36 h-52 bg-carbon rounded-xl flex items-center justify-center shrink-0 shadow-xl overflow-hidden border border-parchment/10">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <BookOpen className="w-8 h-8 text-lime/30 mx-auto mb-2" />
                  <p className="text-xs text-parchment/30 font-sans">Cover</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-lime/70 text-xs uppercase tracking-widest font-display mb-2">
                {monthLabel(book.month)}
                {book.is_current && (
                  <span className="ml-2 bg-lime text-carbon px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Current
                  </span>
                )}
              </p>
              <h3 className="font-serif italic text-2xl text-parchment mb-1 leading-snug">
                {book.title}
              </h3>
              <p className="text-parchment/50 text-sm mb-3 font-sans">
                by {book.author}
              </p>
              <p className="text-parchment/70 text-sm leading-relaxed font-sans line-clamp-4">
                {book.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next controls + dot indicators */}
      <div className="flex items-center justify-center gap-4 pb-6">
        <button
          onClick={goPrev}
          disabled={activeIdx === 0}
          className="w-9 h-9 rounded-full bg-parchment/10 hover:bg-parchment/20 disabled:opacity-30 flex items-center justify-center transition"
        >
          <ChevronLeft className="w-5 h-5 text-parchment" />
        </button>

        <div className="flex items-center gap-2">
          {books.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIdx(i)}
              className={`rounded-full transition-all duration-300 ${i === activeIdx ? "w-6 h-2 bg-lime" : "w-2 h-2 bg-parchment/30"}`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={activeIdx === books.length - 1}
          className="w-9 h-9 rounded-full bg-parchment/10 hover:bg-parchment/20 disabled:opacity-30 flex items-center justify-center transition"
        >
          <ChevronRight className="w-5 h-5 text-parchment" />
        </button>
      </div>
    </section>
  );
}
