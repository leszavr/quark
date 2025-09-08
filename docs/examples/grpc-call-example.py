"""
Пример вызова ai-writer через gRPC
"""
import grpc
from proto import ai_writer_pb2, ai_writer_pb2_grpc

def generate_text(prompt: str) -> str:
    with grpc.secure_channel('ai-writer:50051', grpc.ssl_channel_credentials()) as channel:
        stub = ai_writer_pb2_grpc.AIWriterStub(channel)
        request = ai_writer_pb2.GenerateRequest(prompt=prompt, max_tokens=100)
        response = stub.Generate(request)
        return response.text

# Использование
result = generate_text("Напиши пост о пользе медитации")
print(result)
