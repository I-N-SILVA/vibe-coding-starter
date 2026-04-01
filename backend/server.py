"""
PLYAZ Backend Proxy
Routes /api/* requests to the Next.js dev server on port 3000.
The Kubernetes ingress routes /api/* to port 8001 (this server),
and all other routes to port 3000 (Next.js directly).
"""
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PLYAZ API Proxy")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NEXTJS_URL = "http://localhost:3000"


@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"])
async def proxy_api(request: Request, path: str):
    target_url = f"{NEXTJS_URL}/api/{path}"
    query = str(request.url.query)
    if query:
        target_url += f"?{query}"

    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)

    body = await request.body()

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
            )
            excluded_headers = {"transfer-encoding", "content-encoding", "content-length"}
            response_headers = {
                k: v for k, v in resp.headers.items()
                if k.lower() not in excluded_headers
            }
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers=response_headers,
            )
        except httpx.ConnectError:
            return Response(
                content='{"error": "Next.js server not ready yet"}',
                status_code=503,
                media_type="application/json",
            )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "plyaz-proxy"}
