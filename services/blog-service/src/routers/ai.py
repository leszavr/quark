from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/draft")
async def generate_draft():
    """Запрос к ai-orchestrator на генерацию черновика"""
    # Здесь будет логика генерации черновика
    raise HTTPException(status_code=501, detail="Not implemented")

@router.post("/summarize")
async def summarize_content():
    """Краткое содержание"""
    # Здесь будет логика создания краткого содержания
    raise HTTPException(status_code=501, detail="Not implemented")