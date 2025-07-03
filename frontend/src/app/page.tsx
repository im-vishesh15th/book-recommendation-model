"use client"
import SearchBox from "../components/SearchBox"
import { useState } from "react"
import { BookOpen, Sparkles, TrendingUp, Users, Star, Calendar ,CircleUserRound ,Building2} from "lucide-react"

interface Book {
  title: string
}

interface BookInfo {
  title: string
  image_url: string,
  author:string,
  year: number,
  rating:number,
  confidence:number,
  publisher:string
}

interface RecommendationResponse {
  searched_book: BookInfo
  recommendations: BookInfo[]
}

export default function Home() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [prediction, setPrediction] = useState<BookInfo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleBookSelect = async (book: Book) => {
    setSelectedBook(book)
    setPrediction(null)
    setError(null)
    setIsLoading(true)

    try {
      const encodedTitle = encodeURIComponent(book.title)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommend/${encodedTitle}`)
   
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.detail || `Error: ${res.status}`)
      }
    
      const data: RecommendationResponse = await res.json()
      console.log("data=",data)
      setPrediction(data.recommendations || [])
       console.log("Pred=",prediction)
    } catch (err) {
      console.error("Error fetching recommendations:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch recommendations")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <BookOpen className="w-16 h-16 text-purple-400 animate-glow" />
                <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-4 gradient-text font-inter tracking-tight">BookMind</h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-2 font-inter">AI-Powered Book Discovery</p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-inter leading-relaxed">
              Discover your next literary adventure with our intelligent recommendation engine. Simply search for a book
              you love, and let AI find your perfect match.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm">
              <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">270K+ Books</span>
              </div>
              <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Smart AI</span>
              </div>
              <div className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">Personalized</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <div className="mb-16 animate-fade-in-up">
            <SearchBox onBookSelect={handleBookSelect} />
          </div>

          {/* Results Section */}
          {selectedBook && (
            <div className="animate-fade-in-up z-0">
              <div className="glass-effect rounded-2xl p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white font-inter">Recommendations for</h2>
                    <p className="text-purple-300 text-lg font-medium">"{selectedBook.title}"</p>
                  </div>
                </div>

                {error ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                    <div className="text-red-400 text-lg font-medium mb-2">Oops! Something went wrong</div>
                    <div className="text-red-300">{error}</div>
                  </div>
                ) : isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center gap-3 text-purple-300">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                      <span className="text-lg font-medium">Finding perfect matches...</span>
                    </div>
                  </div>
                ) : prediction && prediction.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prediction.map((book, idx) => (
                      <div key={book.title + idx} className="glass-effect rounded-xl p-6 card-hover group z-0">
                        <div className="relative mb-4 z-0">
                          <img
                            src={book.image_url || "/placeholder.svg"}
                            alt={book.title}
                            className="w-full h-64 object-cover rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-300 z-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "https://via.placeholder.com/200x300/1e293b/64748b?text=No+Image"
                            }}
                          />
                          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 z-0">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-white font-medium">
                                {book.rating.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-bold text-white text-lg leading-tight font-inter group-hover:text-purple-300 transition-colors">
                            {book.title}
                          </h3>

                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                              <CircleUserRound className="w-3 h-3" />
                              {book.author}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                              <Calendar className="w-3 h-3" />
                              {book.year}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                              <Building2 className="w-3 h-3" />
                              {book.publisher}
                            </span>
                          </div>

                          <div className="pt-2">
                            <div className="flex items-center justify-between text-sm text-slate-400">
                              <span>Match Score</span>
                              <span className="text-green-400 font-medium">{(book.confidence*100).toFixed(2)}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                              <div
                                className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${book.confidence*100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <div className="text-slate-400 text-lg">No recommendations found for this book.</div>
                    <div className="text-slate-500 text-sm mt-2">Try searching for a different title.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Welcome Message */}
          {!selectedBook && (
            <div className="text-center animate-fade-in-up glass-effect rounded-2xl p-12">
              <BookOpen className="w-20 h-20 text-purple-400 mx-auto mb-6 animate-float" />
              <h3 className="text-2xl font-bold text-white mb-4 font-inter">Ready to Discover?</h3>
              <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed">
                Start by searching for a book you enjoyed. Our AI will analyze your taste and suggest similar books
                you'll love.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold gradient-text font-inter">BookMind</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
                Powered by advanced AI algorithms to help you discover your next favorite book. Join thousands of
                readers finding their perfect literary matches.
              </p>
              <div className="flex gap-4">
                <div className="glass-effect px-4 py-2 rounded-lg">
                  <div className="text-purple-400 font-bold text-lg">250K+</div>
                  <div className="text-slate-400 text-sm">Books Analyzed</div>
                </div>
                
               
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 font-inter">Features</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  AI Recommendations
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Smart Matching
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  Personalized Results
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 font-inter">About</h4>
              <ul className="space-y-2 text-slate-400">
                <li>How it Works</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm font-jetbrains-mono">
              &copy; {new Date().getFullYear()} BookMind. Crafted with AI and passion for books.
            </p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="text-slate-500 text-sm">Powered by</span>
              <span className="text-purple-400 font-medium">FastAPI</span>
              <span className="text-slate-500">+</span>
              <span className="text-blue-400 font-medium">Next.js</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
