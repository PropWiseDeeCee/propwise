from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import fitz

from analyzer import analyze_agreement


app = FastAPI()


# ==============================
# CORS
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# CONFIG
# ==============================

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


# ==============================
# ROOT
# ==============================

@app.get("/")
def root():
    return {
        "status": "PropWise AI Backend Running"
    }


# ==============================
# PDF TEXT EXTRACTION
# ==============================

def extract_text_pdf(contents):

    pdf = fitz.open(stream=contents, filetype="pdf")

    text = ""

    for page in pdf:
        text += page.get_text()

    return text


# ==============================
# ANALYZE ENDPOINT
# ==============================

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):

    try:

        # READ FILE
        contents = await file.read()

        # FILE SIZE CHECK
        if len(contents) > MAX_FILE_SIZE:

            return {
                "success": False,
                "error": "File too large. Max 10MB allowed."
            }

        # TEXT EXTRACTION
        text = extract_text_pdf(contents)

        # EMPTY TEXT CHECK
        if len(text.strip()) < 50:

            return {
                "success": False,
                "error": "Unable to extract text. PDF may be scanned or invalid."
            }

        # AI ANALYSIS
        analysis = analyze_agreement(text)

        return {
            "success": True,
            "characters": len(text),
            "analysis": analysis
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }