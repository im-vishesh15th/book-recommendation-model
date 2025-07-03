import React, { useState, useRef } from "react";

interface Book {
  title: string;
}

const SearchBox: React.FC<{ onBookSelect: (book: Book) => void }> = ({ onBookSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (q: string) => {
    setLoading(true);
    try {
      // Fetch all books from the FastAPI endpoint
      
      const res = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/books`);
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      
      const bookList = await res.json();
      
      // Filter books based on the query
      const filteredBooks = bookList
        .filter((bookTitle: string) => 
          bookTitle.toLowerCase().includes(q.toLowerCase())
        )
        .slice(0, 10) // Limit to 10 suggestions
        .map((title: string) => ({ title }));
      
      setSuggestions(filteredBooks);
    } catch (e) {
      console.error("Error fetching book suggestions:", e);
      setSuggestions([]);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setShowDropdown(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (val.length > 1) fetchSuggestions(val);
      else setSuggestions([]);
    }, 250);
  };

  const handleSelect = (book: Book) => {
    setQuery(book.title);
    setShowDropdown(false);
    onBookSelect(book);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <input
        type="text"
        className="w-full px-5 py-3 rounded-lg bg-[#18181b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-lg text-lg font-medium"
        placeholder="Search for a book..."
        value={query}
        onChange={handleChange}
        onFocus={() => setShowDropdown(true)}
        autoComplete="off"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-2 bg-[#23232b] rounded-lg shadow-xl z-10 animate-fade-in overflow-hidden max-h-80 overflow-y-auto">
          {suggestions.map((book, idx) => (
            <li
              key={book.title + idx}
              className="px-5 py-3 cursor-pointer hover:bg-[#31313b] transition-colors duration-200 text-white border-b border-[#282828] last:border-b-0"
              onClick={() => handleSelect(book)}
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              {book.title}
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <div className="absolute right-4 top-3 animate-spin text-blue-400">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#60a5fa" strokeWidth="4" strokeDasharray="60" strokeDashoffset="40"/></svg>
        </div>
      )}
    </div>
  );
};

export default SearchBox;