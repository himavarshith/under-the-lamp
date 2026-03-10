import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BookOpen } from 'lucide-react'

export default function BookOfTheMonth() {
  const [book, setBook] = useState(null)

  useEffect(() => {
    async function fetchBook() {
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('is_current', true)
        .limit(1)
        .single()

      if (data) setBook(data)
    }
    fetchBook()
  }, [])

  // Fallback demo data when Supabase isn't connected
  const display = book || {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    cover_url: null,
    description:
      'A lone astronaut must save the earth from disaster in this propulsive, page-turning science fiction adventure — from the author of The Martian.',
  }

  return (
    <section className="bg-warm-900 rounded-3xl p-8 md:p-12 text-warm-100">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-lamp-400" />
        <span className="text-xs uppercase tracking-widest text-lamp-400 font-medium">
          Book of the Month
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Book Cover */}
        <div className="w-40 h-56 bg-warm-800 rounded-xl flex items-center justify-center shrink-0 shadow-2xl overflow-hidden">
          {display.cover_url ? (
            <img
              src={display.cover_url}
              alt={display.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <BookOpen className="w-10 h-10 text-lamp-500/40 mx-auto mb-2" />
              <p className="text-xs text-warm-500">Cover</p>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1">
          <h3 className="font-serif text-3xl text-lamp-200 mb-2">{display.title}</h3>
          <p className="text-warm-400 text-sm mb-4">by {display.author}</p>
          <p className="text-warm-300 leading-relaxed">{display.description}</p>
        </div>
      </div>
    </section>
  )
}
