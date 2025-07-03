"use client"
import Image from "next/image";
import SearchBox from "../components/SearchBox";
import React, { useState } from "react";

interface Book {
  title: string;
}

interface BookInfo {
  title: string;
  image_url: string;
}

interface RecommendationResponse {
  searched_book: BookInfo;
  recommendations: BookInfo[];
}

export default function Home() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [prediction, setPrediction] = useState<BookInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBookSelect = async (book: Book) => {
    setSelectedBook(book);
    setPrediction(null);
    setError(null);
    
    try {
      // Call the FastAPI recommendation endpoint with the selected book title
      const encodedTitle = encodeURIComponent(book.title);
      const res = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/recommend/${encodedTitle}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || `Error: ${res.status}`);
      }
      
      const data: RecommendationResponse = await res.json();
      setPrediction(data.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch recommendations");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white px-4 animate-fade-in">
      <header className="mb-10 mt-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight" style={{ fontFamily: "var(--font-geist-sans)" }}>
          Book Recommendation Engine
        </h1>
        <p className="text-lg text-gray-400" style={{ fontFamily: "var(--font-geist-sans)" }}>
          Discover your next favorite book. Start typing to search!
        </p>
      </header>
      <main className="w-full max-w-xl">
        <SearchBox onBookSelect={handleBookSelect} />
        {selectedBook && (
          <div className="mt-8 animate-fade-in-up">
            <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-geist-sans)" }}>
              Recommendations for "{selectedBook.title}"
            </h2>
            {error ? (
              <div className="text-red-400 bg-[#2c1c1c] p-4 rounded-lg">{error}</div>
            ) : prediction === null ? (
              <div className="text-blue-400 animate-pulse">Loading recommendations...</div>
            ) : prediction.length > 0 ? (
              <ul className="mt-4 space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prediction.map((book, idx) => (
                  <li key={book.title + idx} className="bg-[#18181b] rounded-lg p-4 shadow-md transition-all duration-300 hover:bg-[#23232b] flex flex-col items-center">
                    <img 
                      src={book.image_url} 
                      alt={book.title} 
                      className="w-24 h-36 object-cover rounded mb-3 shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/150x225?text=No+Image";
                      }}
                    />
                    <span style={{ fontFamily: "var(--font-geist-sans)" }} className="text-center">{book.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No recommendations found.</div>
            )}
          </div>
        )}
      </main>
      <footer className="mt-16 text-gray-500 text-sm" style={{ fontFamily: "var(--font-geist-mono)" }}>
        &copy; {new Date().getFullYear()} Book Recommendation Engine
      </footer>
    </div>
  );
}
