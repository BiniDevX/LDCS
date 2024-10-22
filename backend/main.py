from fastapi import FastAPI
from app.routes import router
from app.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.helpers import load_model_and_class_dict

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    load_model_and_class_dict()
    os.makedirs('./uploads', exist_ok=True)  # Ensure uploads directory exists

app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

# Define the allowed origins
origins = [
    "http://localhost:3000",  
    "http://192.168.50.28:3000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

# Include your routes
app.include_router(router)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
