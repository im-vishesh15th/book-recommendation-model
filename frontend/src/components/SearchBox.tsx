"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Search, BookIcon, Loader2, X } from "lucide-react"

interface Book {
  title: string
}

const SearchBox: React.FC<{ onBookSelect: (book: Book) => void }> = ({ onBookSelect }) => {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [focused, setFocused] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchSuggestions = async (q: string) => {
    setLoading(true)
    try {
      const res = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/books`)
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`)
      }

      const bookList = await res.json()

      const filteredBooks = bookList
        .filter((bookTitle: string) => bookTitle.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 8)
        .map((title: string) => ({ title }))

      setSuggestions(filteredBooks)
    } catch (e) {
      console.error("Error fetching book suggestions:", e)
      setSuggestions([])
    }
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setShowDropdown(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (val.length > 1) fetchSuggestions(val)
      else setSuggestions([])
    }, 300)
  }

  const handleSelect = (book: Book) => {
    setQuery(book.title)
    setShowDropdown(false)
    onBookSelect(book)
  }

  const clearSearch = () => {
    setQuery("")
    setSuggestions([])
    setShowDropdown(false)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className={`relative transition-all duration-300 ${focused ? "transform scale-105" : ""}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div
          className={`relative glass-effect rounded-2xl border transition-all duration-300 ${
            focused ? "border-purple-400/50 shadow-lg shadow-purple-500/25" : "border-slate-700/50"
          }`}
        >
          <div className="flex items-center">
            <div className="pl-6 pr-4">
              <Search
                className={`w-6 h-6 transition-colors duration-300 ${focused ? "text-purple-400" : "text-slate-400"}`}
              />
            </div>

            <input
              type="text"
              className="flex-1 py-5 bg-transparent text-white placeholder-slate-400 focus:outline-none text-lg font-medium font-inter"
              placeholder="Search for a book you love..."
              value={query}
              onChange={handleChange}
              onFocus={() => {
                setFocused(true)
                setShowDropdown(true)
              }}
              onBlur={() => {
                setFocused(false)
                setTimeout(() => setShowDropdown(false), 200)
              }}
              autoComplete="off"
            />

            <div className="pr-6 pl-4 flex items-center gap-2">
              {loading && <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />}
              {query && !loading && (
                <button
                  onClick={clearSearch}
                  className="p-1 hover:bg-slate-700/50 rounded-full transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-3 glass-effect rounded-xl border border-slate-700/50 shadow-2xl z-50 animate-slide-in overflow-hidden overflow-y-scroll ">
          <div className="p-2">
            {suggestions.map((book, idx) => (
              <div
                key={book.title + idx}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-700/30 rounded-lg transition-all duration-200 group z-50"
                onClick={() => handleSelect(book)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all duration-200">
                  <BookIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium font-inter group-hover:text-purple-300 transition-colors duration-200">
                    {book.title}
                  </div>
                  <div className="text-slate-400 text-sm">Click to get recommendations</div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Search className="w-3 h-3 text-purple-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {suggestions.length > 0 && (
            <div className="border-t border-slate-700/50 px-4 py-2 bg-slate-800/30">
              <div className="text-xs text-slate-500 font-jetbrains-mono">
                {suggestions.length} result{suggestions.length !== 1 ? "s" : ""} found
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox
