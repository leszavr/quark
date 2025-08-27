from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import blogs, posts, comments, ai

app = FastAPI(
    title="Blog Service",
    description="Manages blogs, posts, comments and AI-generated content",
    version="1.0.0"
)

# Добавляем middleware для CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.get("/")
def root():
    return {"message": "Blog Service is running"}

@app.head("/")
def root_head():
    return

# Подключение роутеров
app.include_router(blogs.router, tags=["blogs"])
app.include_router(posts.router, tags=["posts"])
app.include_router(comments.router, tags=["comments"])
app.include_router(ai.router, tags=["ai"])