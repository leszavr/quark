from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/v1/analyze")
def analyze(content: str):
    # Ваш код анализа SEO
    return {"score": 85, "suggestions": ["Добавьте ALT-текст"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3010)