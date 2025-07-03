import pickle
import numpy as np
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn
from typing import List, Optional
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from rapidfuzz import fuzz
# Create FastAPI app
app = FastAPI(title="Book Recommendation System", description="API for book recommendations using collaborative filtering")




origins = [ 
    "http://localhost:3000",
    "http://localhost",
    "https://bookmindai-tawny.vercel.app",
    "https://bookmindai-vishesh-guptas-projects.vercel.app",
    "https://bookmindai-git-main-vishesh-guptas-projects.vercel.app/"
   
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load model and data
try:
    model = pickle.load(open('artifacts/model.pkl', 'rb'))
    book_names = pickle.load(open('artifacts/book_names.pkl', 'rb'))
    final_rating = pickle.load(open('artifacts/final_rating.pkl', 'rb'))
    book_pivot = pickle.load(open('artifacts/book_pivot.pkl', 'rb'))
    model_loaded = True
except Exception as e:
    print(f"Warning: Error loading model or data: {e}")
    print("API will run in limited mode without recommendation functionality.")
    model_loaded = False
    # Create empty placeholders for the model and data
    model = None
    book_names = []
    final_rating = None
    book_pivot = None

# Define response models
class BookInfo(BaseModel):
    title: str
    image_url: str
    year: Optional[str] = None
    publisher: Optional[str] = None
    author: Optional[str] = None
    rating: Optional[float] = None
    confidence: Optional[float] = None

class RecommendationResponse(BaseModel):
    searched_book: BookInfo
    recommendations: List[BookInfo]

# Helper function to fetch book poster URL
def fetch_book_details(book_title):
    try:
        book_data = final_rating[final_rating['title'] == book_title].iloc[0]
        print("YOOOOOOO"+str(book_data))
        return {
            "title": book_title,
            "image_url": book_data['image_url'],
            "year": str(book_data['year']),
            "publisher": book_data['publisher'],
            "author": book_data['author'],
            "rating": float(book_data['avg_rating'])
        }
    except Exception as e:
        print(f"Error fetching details for {book_title}: {e}")
        return {
            "title": book_title,
            "image_url": "https://via.placeholder.com/150x225?text=No+Image+Available",
            "year": None,
            "publisher": None,
            "author": None,
            "rating": None
        }

# Recommendation function
def recommend_books(book_name, num_recommendations=5):
    try:
        # Find the index of the book in the pivot table
        book_id = np.where(book_pivot.index == book_name)[0][0]
        
        # Get recommendations using the model
        distance, suggestion = model.kneighbors(
            book_pivot.iloc[book_id, :].values.reshape(1, -1), 
            n_neighbors=num_recommendations+1  # +1 because the book itself will be included
        )
        print(suggestion)
        
        # Get the recommended book titles
        recommended_books = []
        similarities = 1 - distance.flatten()  # Convert cosine distance to similarity
        # Normalize similarities (excluding the input book itself)
        normalized_similarities = similarities[1:] / similarities[1:].sum()
       
        for i in range(1, len(suggestion[0])):
            book_index = suggestion[0][i]
            book_title = book_pivot.index[book_index]

            if book_title != book_name:
                book_details = fetch_book_details(book_title)
               
                book_details['confidence'] = round(float(normalized_similarities[i - 1]), 4)
        
            recommended_books.append(book_details)
        
        # Get the searched book's details
        searched_book_details = fetch_book_details(book_name)
        
        return {
            "searched_book": searched_book_details,
            "recommendations": recommended_books
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Error generating recommendations: {str(e)}")

# API endpoints
@app.get("/", response_class=HTMLResponse)
async def root():
    return "<html><body><h1>Book Recommendation API</h1><p>Visit <a href='/docs'>/docs</a> for API documentation</p></body></html>"

@app.get("/health")
async def health_check():
    """Health check endpoint to verify service status"""
    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "service_capabilities": {
            "recommendations": model_loaded,
            "book_list": model_loaded
        }
    }

@app.get("/books", response_model=List[str])
async def get_all_books(query: Optional[str] = None):
    """Get a list of all available books, optionally filtered by a search query"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Book recommendation service is currently unavailable. Please try again later.")
    
    if query:
        # Filter book names using fuzzy matching
        # You can adjust the threshold (e.g., 70) based on desired strictness
        suggestions = [
            book for book in book_names 
            if fuzz.partial_ratio(query.lower(), book.lower()) > 70
        ]
        # Limit to top 10 suggestions for performance and UI
        return suggestions[:10]
    return list(book_names)

@app.get("/recommend/{book_name}", response_model=RecommendationResponse)
async def get_recommendation(book_name: str, num_recommendations: Optional[int] = 5):
    """Get book recommendations based on a book name"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Book recommendation service is currently unavailable. Please try again later.")
    
    if book_name not in book_names:
        raise HTTPException(status_code=404, detail=f"Book '{book_name}' not found")
    
    if num_recommendations < 1 or num_recommendations > 20:
        raise HTTPException(status_code=400, detail="Number of recommendations must be between 1 and 20")
    
    return recommend_books(book_name, num_recommendations)

# Run the application
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
