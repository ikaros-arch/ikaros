from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.proxy import ProxyMiddleware
import os
import shutil
from pathlib import Path
from imgProcessingJP2 import convert_image_to_jp2
from docProcessingPDF import convert_pdf

app = FastAPI()

# Array of allowed origins
allowedDomains = [
  'https://app.ikarosarchaeology.com',
  'https://app-dev.ikarosarchaeology.com',
]

# CORS options setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_domains,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory setup
UPLOAD_DIR = Path("/files")
PROCESSED_DIR = Path(__file__).parent / "files_processed"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/")
async def upload_file(uuid: str, file: UploadFile = File(...)):
    try:
        file_path = UPLOAD_DIR / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        ext = file.filename.split('.')[-1]
        new_filename = f"{uuid}.{ext}"
        new_path = UPLOAD_DIR / new_filename

        if ext in ['jpg', 'jpeg', 'png']:
            await convert_image_to_jp2(file_path, PROCESSED_DIR / f"{uuid}.jp2")
        elif ext == 'pdf':
            await convert_pdf(file_path, PROCESSED_DIR, uuid)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        os.rename(file_path, new_path)
        return {"message": "File uploaded and renamed successfully.", "file": new_filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files/{filename}")
async def get_file(filename: str):
    file_path = UPLOAD_DIR / filename
    if file_path.exists():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

@app.middleware("http")
async def proxy_middleware(request: Request, call_next):
    if request.url.path.startswith("/redirect"):
        target_url = request.query_params.get("url") or request.headers.get("X-Target-URL")
        if target_url:
            request.scope["path"] = target_url
            request.scope["raw_path"] = target_url.encode("utf-8")
    response = await call_next(request)
    return response

app.add_middleware(
    ProxyMiddleware,
    proxy_url="http://example.com",  # Replace with actual proxy URL
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
