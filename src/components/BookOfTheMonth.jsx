import { useState, useEffect } from "react";
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

  const book = books[activeIdx];

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
        {books.length > 1 && (
          <select
            value={activeIdx}
            onChange={(e) => setActiveIdx(Number(e.target.value))}
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

      {/* Book card */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Cover */}
        <div className="w-40 h-56 bg-carbon-light rounded-xl flex items-center justify-center shrink-0 shadow-2xl overflow-hidden border border-parchment/10">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <BookOpen className="w-10 h-10 text-lime/30 mx-auto mb-2" />
              <p className="text-xs text-parchment/30 font-sans">Cover</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="text-lime/70 text-xs uppercase tracking-widest font-display mb-2 flex items-center gap-2">
            {monthLabel(book.month)}
            {book.is_current && (
              <span className="bg-lime text-carbon px-2 py-0.5 rounded-full text-[10px] font-bold">
                Current
              </span>
            )}
          </p>
          <h3 className="font-serif italic text-3xl text-parchment mb-1 leading-snug">
            {book.title}
          </h3>
          <p className="text-parchment/50 text-sm mb-4 font-sans">
            by {book.author}
          </p>
          <p className="text-parchment/70 leading-relaxed font-sans">
            {book.description}
          </p>
        </div>
      </div>

      {/* Prev / Next navigation */}
      {books.length > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-parchment/10">
          <button
            onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
            disabled={activeIdx === 0}
            className="flex items-center gap-2 text-sm text-parchment/60 hover:text-parchment disabled:opacity-20 transition font-sans"
          >
            <ChevronLeft className="w-4 h-4" />
            {activeIdx > 0 ? monthLabel(books[activeIdx - 1].month) : "Older"}
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {books.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === activeIdx ? "w-5 h-2 bg-lime" : "w-2 h-2 bg-parchment/25 hover:bg-parchment/50"}`}
              />
            ))}
          </div>

          <button
            onClick={() =>
              setActiveIdx((i) => Math.min(books.length - 1, i + 1))
            }
            disabled={activeIdx === books.length - 1}
            className="flex items-center gap-2 text-sm text-parchment/60 hover:text-parchment disabled:opacity-20 transition font-sans"
          >
            {activeIdx < books.length - 1
              ? monthLabel(books[activeIdx + 1].month)
              : "Newer"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
