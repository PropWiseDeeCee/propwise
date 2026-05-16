from openai import OpenAI
from dotenv import load_dotenv

import os
import json

load_dotenv()

# ==============================
# OPENROUTER CLIENT
# ==============================

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

# ==============================
# SYSTEM PROMPT
# ==============================

SYSTEM_PROMPT = """
You analyze Indian property agreements.

Task:
Identify buyer risks, missing protections, vague clauses, financial/legal imbalance, builder-favoring terms.

Focus only on:
- possession delay
- payment risk
- maintenance ambiguity
- parking rights
- cancellation/refund
- liability limitation
- unilateral builder rights
- hidden charges
- arbitration/legal restrictions
- vague timelines

Rules:
- Output ONLY valid JSON
- No markdown
- No extra text
- Keep responses concise
- Max 5 critical issues
- Max 5 moderate issues
- Each issue < 12 words
- Summary < 60 words

JSON format:

{
  "risk_level": "Low|Medium|High",
  "score": 0,
  "critical": [],
  "moderate": [],
  "summary": ""
}

Scoring:
0-30 = Low
31-70 = Medium
71-100 = High

If agreement is incomplete or unclear:
- lower confidence
- avoid assumptions
- mention ambiguity briefly
"""

# ==============================
# IMPORTANT KEYWORDS
# ==============================

IMPORTANT_KEYWORDS = [
    "possession",
    "delay",
    "penalty",
    "refund",
    "cancellation",
    "maintenance",
    "parking",
    "liability",
    "termination",
    "charges",
    "gst",
    "force majeure",
    "arbitration",
    "interest",
    "default"
]

# ==============================
# CLAUSE EXTRACTION
# ==============================

def extract_relevant_clauses(text):

    lines = text.split("\n")

    selected = []

    for line in lines:

        lower = line.lower()

        if any(k in lower for k in IMPORTANT_KEYWORDS):

            clean = line.strip()

            if len(clean) > 20:
                selected.append(clean)

    return "\n".join(selected[:80])


# ==============================
# MAIN ANALYZER
# ==============================

def analyze_agreement(text):

    relevant_text = extract_relevant_clauses(text)

    # Fallback if extraction weak
    if len(relevant_text.strip()) < 300:
        relevant_text = text[:4000]

    prompt = f"""
Agreement clauses:

{relevant_text[:6000]}
"""

    try:

        response = client.chat.completions.create(
            model="openai/gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=300
        )

        print("RAW RESPONSE:")
        print(response)

        # ==============================
        # SAFE CONTENT EXTRACTION
        # ==============================

        content = (
            response
            .choices[0]
            .message
            .content
        )

        # NULL SAFETY
        if not content:

            return {
                "risk_level": "Medium",
                "score": 50,
                "critical": [],
                "moderate": [
                    "AI returned empty response"
                ],
                "summary": "No usable AI response received."
            }

        # ==============================
        # CLEAN RESPONSE
        # ==============================

        content = (
            content
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        # ==============================
        # FORMAT VALIDATION
        # ==============================

        if not content.startswith("{"):

            return {
                "risk_level": "Medium",
                "score": 50,
                "critical": [],
                "moderate": [
                    "Unexpected AI response format"
                ],
                "summary": content[:200]
            }

        # ==============================
        # PARSE JSON
        # ==============================

        result = json.loads(content)

        # ==============================
        # SAFETY DEFAULTS
        # ==============================

        result.setdefault("risk_level", "Medium")
        result.setdefault("score", 50)
        result.setdefault("critical", [])
        result.setdefault("moderate", [])
        result.setdefault("summary", "")

        return result

    except Exception as e:

        print("AI ANALYSIS ERROR:")
        print(str(e))

        return {
            "risk_level": "Medium",
            "score": 50,
            "critical": [],
            "moderate": [
                f"Analysis failed: {str(e)}"
            ],
            "summary": "AI analysis could not be completed."
        }