# examples/nats-event-publisher.py
import asyncio
from nats.aio.client import Client as NATS

async def publish_event():
    nc = NATS()
    await nc.connect("nats://localhost:4222")

    event = {
        "id": "post-123",
        "authorId": "user-456",
        "title": "Мой первый пост",
        "timestamp": "2025-04-05T12:00:00Z"
    }

    await nc.publish("post.published", json.dumps(event).encode())
    await nc.close()

if __name__ == "__main__":
    asyncio.run(publish_event())