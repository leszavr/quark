import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import profiles, settings, subscriptions

app = FastAPI(
    title="User Service",
    description="Управление профилями, подписками и настройками пользователей",
    version="0.1.0"
)

# Добавляем CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем маршруты
app.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
app.include_router(settings.router, prefix="/settings", tags=["settings"])
app.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])

@app.get("/")
async def root():
    return {"message": "User Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3002)