# Пример: AI Ops Agent предлагает оптимизацию

## Сценарий
- Grafana фиксирует: `latency > 2s` в `media-service`
- AI Ops Agent:
  1. Находит: `resize_image` — синхронная функция
  2. Генерирует асинхронную версию
  3. Создаёт PR

## PR: "Переписать resize_image на async"

```python
# Было
def resize_image(image, size):
    return PIL.Image.resize(image, size)

# Стало
async def resize_image_async(image, size):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, resize_image, image, size)
```

## Обоснование
- Снижает блокировку event loop
- Увеличивает throughput на 3x

## Тесты
```python
def test_resize_async():
    result = await resize_image_async(test_image, (800, 600))
    assert result.size == (800, 600)