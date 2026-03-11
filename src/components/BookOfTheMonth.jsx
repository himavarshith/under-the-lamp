import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { BookOpen } from "lucide-react";

export default function BookOfTheMonth() {
  const [book, setBook] = useState(null);

  useEffect(() => {
    async function fetchBook() {
      const { data } = await supabase
        .from("books")
        .select("*")
        .eq("is_current", true)
        .limit(1)
        .single();

      if (data) setBook(data);
    }
    fetchBook();
  }, []);

  // Fallback demo data when Supabase isn't connected
  const display = book || {
    title: "Project Hail Mary",
    author: "Andy Weir",
    cover_url: null,
    description:
      "A lone astronaut must save the earth from disaster in this propulsive, page-turning science fiction adventure — from the author of The Martian.",
  };

  return (
    <section className="bg-carbon rounded-3xl p-8 md:p-12 text-parchment">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-brand-blue" />
        <span className="text-xs uppercase tracking-widest font-display font-bold bg-brand-blue/20 text-brand-blue px-3 py-1 rounded-full">
          Book of the Month
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Book Cover */}
        <div className="w-40 h-56 bg-carbon-light rounded-xl flex items-center justify-center shrink-0 shadow-2xl overflow-hidden border border-parchment/10">
          {display.cover_url ? (
            <img
              src={display.cover_url}
              alt={display.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <BookOpen className="w-10 h-10 text-lime/30 mx-auto mb-2" />
              <p className="text-xs text-parchment/30 font-sans">Cover</p>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1">
          <h3 className="font-serif italic text-3xl text-lime mb-1">
            {display.title}
          </h3>
          <p className="text-parchment/50 text-sm mb-4 font-sans">
            by {display.author}
          </p>
          <p className="text-parchment/70 leading-relaxed font-sans">
            {display.description}
          </p>
        </div>
      </div>
    </section>
  );
}
