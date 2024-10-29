import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.app.helpers import load_model_and_class_dict
from backend.app.routes import router  # Import your app's routes
from backend.app.database import engine, Base  # Import database and ORM setup

# Load environment variables from .env file if present
load_dotenv()



# Initialize database tables
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI app
app = FastAPI()
    
# Directory Paths
uploads_dir = "uploads"

# Serve static files for the 'uploads' directory if it exists
if os.path.isdir(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
else:
    print(f"Warning: Uploads directory '{uploads_dir}' not found.")
# Load the model when the application starts
@app.on_event("startup")
def startup_event():
    load_model_and_class_dict()


# Configure CORS settings from environment variables
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600  # Cache the preflight response for 1 hour
)

# Include the main router for your application's endpoints
app.include_router(router)

# Run the application if executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
