from fastapi import FastAPI, UploadFile, File
from fastapi import Request
from fastapi.responses import JSONResponse
import time
from fastapi.middleware.cors import CORSMiddleware

import fitz
import docx

print("================================")
print("PROPWISE BACKEND STARTED")
print("================================")

from analyzer import analyze_agreement

app = FastAPI()


# ==============================
# CORS
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://propwiseindia.com",
    "https://www.propwiseindia.com"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# CONFIG
# ==============================

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

# ==============================
# RATE LIMITING
# ==============================

RATE_LIMIT_SECONDS = 300  # 5 minutes

analysis_tracker = {}


# ==============================
# ROOT
# ==============================

@app.get("/")
def root():

    return {
        "status": "PropWise AI Backend Running"
    }


# ==============================
# PDF EXTRACTION
# ==============================

def extract_text_pdf(contents):

    try:

        pdf = fitz.open(
            stream=contents,
            filetype="pdf"
        )

        text = ""

        for page in pdf:

            text += page.get_text()

        return text

    except Exception as e:

        print("PDF EXTRACTION ERROR:", str(e))
        return ""


# ==============================
# DOCX EXTRACTION
# ==============================

def extract_text_docx(contents):

    try:

        from io import BytesIO

        doc = docx.Document(
            BytesIO(contents)
        )

        text = "\n".join(
            para.text
            for para in doc.paragraphs
        )

        return text

    except Exception as e:

        print("DOCX EXTRACTION ERROR:", str(e))
        return ""


# ==============================
# DOC EXTRACTION
# ==============================

def extract_text_doc(contents):

    try:

        from tempfile import NamedTemporaryFile

        with NamedTemporaryFile(
            delete=False,
            suffix=".doc"
        ) as temp:

            temp.write(contents)

            temp_path = temp.name

        text = textract.process(
            temp_path
        ).decode("utf-8")

        return text

    except Exception as e:

        print("DOC EXTRACTION ERROR:", str(e))
        return ""


# ==============================
# TXT EXTRACTION
# ==============================

def extract_text_txt(contents):

    try:

        return contents.decode("utf-8")

    except Exception as e:

        print("TXT EXTRACTION ERROR:", str(e))
        return ""


# ==============================
# MAIN ANALYZE ENDPOINT
# ==============================

@app.post("/analyze")
async def analyze(
    request: Request,
    file: UploadFile = File(...)
):

    try:

        # ==============================
        # VALIDATION
        # ==============================

        if not file:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "No file provided"
                }
            )

        # ==============================
        # RATE LIMIT CHECK
        # ==============================

        client_ip = request.headers.get(
            "x-forwarded-for",
            request.client.host
        )

        now = int(time.time())

        if client_ip in analysis_tracker:

            last_request = analysis_tracker[client_ip]

            elapsed = now - last_request

            if elapsed < RATE_LIMIT_SECONDS:

                remaining = (
                    RATE_LIMIT_SECONDS - elapsed
                )

                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "error": "Rate limit exceeded",
                        "retry_after": remaining
                    }
                )

        filename = file.filename.lower()

        contents = await file.read()

        if len(contents) > MAX_FILE_SIZE:

            return {
                "success": False,
                "error": "File too large. Max 20MB allowed."
            }

        # ==============================
        # FILE TYPE EXTRACTION
        # ==============================

        text = ""

        # PDF
        if filename.endswith(".pdf"):

            text = extract_text_pdf(contents)

        # DOCX
        elif filename.endswith(".docx"):

            text = extract_text_docx(contents)

        # DOC
        elif filename.endswith(".doc"):
            return {
                "success": False,
                "error": ".doc files temporarily unsupported. Use PDF or DOCX."
        }

        # TXT
        elif filename.endswith(".txt"):

            text = extract_text_txt(contents)

        else:

            return {
                "success": False,
                "error": (
                    "Unsupported file type. "
                    "Use PDF, DOCX, DOC, or TXT."
                )
            }

        # ==============================
        # EMPTY TEXT CHECK
        # ==============================

        if len(text.strip()) < 50:

            return {
                "success": False,
                "error": (
                    "Unable to extract sufficient text."
                )
            }

        # ==============================
        # AI ANALYSIS
        # ==============================

        analysis = analyze_agreement(text)

        analysis_tracker[client_ip] = now

        return {
            "success": True,
            "characters": len(text),
            "analysis": analysis
        }

    except Exception as e:

        print("ANALYZE ERROR:", str(e))

        return {
            "success": False,
            "error": str(e)
        }