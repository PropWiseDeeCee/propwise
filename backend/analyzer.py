
from unittest import result

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
You are an Indian real-estate agreement analyst.

Analyze residential property agreements from a buyer's perspective.

Focus on:

- Possession & delay risks
- RERA compliance
- Hidden costs
- Financial obligations
- Builder-friendly clauses
- Buyer protections
- Transfer restrictions
- Maintenance obligations
- Refund & cancellation rights
- Defect liability
- Timeline mismatches
- Project phase dependency
- Amenity dependency
- Title or litigation concerns

Return ONLY valid JSON.

Schema:

{
  "summary": ""
}

IMPORTANT:

Do NOT calculate risk score.
Do NOT calculate risk level.

Only identify findings.
PropWise calculates risk scoring separately.

Additional sections may be included ONLY if findings exist:

Additional sections may be included ONLY if findings exist:

- positive_findings
- critical_risks
- moderate_risks
- financial_obligations
- hidden_costs
- builder_friendly_clauses
- buyer_friendly_clauses
- rera_findings
- timeline_findings
- project_structure_risks
- negotiation_points

Rules:

- Omit empty sections completely.
- Do not invent findings.
- Use agreement-specific findings only.
- Each finding must be under 15 words.
- Maximum 3 findings per section.
- Focus on practical buyer risks.
- Output JSON only.
"""

# ==============================
# IMPORTANT KEYWORDS
# ==============================

IMPORTANT_KEYWORDS = [

    "rera",
    "registration",
    "occupancy certificate",
    "completion certificate",

    "possession",
    "handover",
    "completion",

    "delay",
    "penalty",
    "compensation",

    "force majeure",

    "maintenance",
    "association",

    "clubhouse",
    "amenities",

    "phase",
    "phase i",
    "phase ii",

    "future development",

    "transfer",
    "assignment",

    "cancellation",
    "termination",
    "refund",

    "corpus",
    "maintenance charges",

    "gst",
    "statutory charges",

    "water charges",

    "khata",

    "title",
    "encumbrance",
    "litigation",

    "landowner",
    "developer",

    "defect liability",

    "parking",

    "interest",

    "default",

    "holding charges",

    "arbitration",

    "dispute resolution"
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

    return "\n".join(selected[:100])


# ==============================
# MAIN ANALYZER
# ==============================

def analyze_agreement(text):

    relevant_text = extract_relevant_clauses(text)

    # Fallback if extraction weak
    if len(relevant_text.strip()) < 400:
        relevant_text = text[:8000]

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
            max_tokens=500
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

        print("================================")
        print("AI CONTENT:")
        print(content)
        print("================================")

        # NULL SAFETY
        if not content:

            return {
        "risk_score": 50,
        "safety_score": 50,
        "risk_level": "Medium",
        "agreement_grade": "C",
        "critical_risks": [],
        "moderate_risks": [
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
            "risk_score": 50,
            "risk_level": "Medium",
            "critical_risks": [],
            "moderate_risks": [
            "Unexpected AI response format"
         ],
        "summary": content[:200]
    }

        # ==============================
        # PARSE JSON
        # ==============================

        result = json.loads(content)

        if not isinstance(result, dict):
            raise ValueError("AI did not return JSON object")

        print("================================")
        print("PARSED RESULT:")
        print(json.dumps(result, indent=2))
        print("================================")

        if "score" in result and "risk_score" not in result:
            result["risk_score"] = result["score"]

        if "critical" in result and "critical_risks" not in result:
            result["critical_risks"] = result["critical"]

        if "moderate" in result and "moderate_risks" not in result:
            result["moderate_risks"] = result["moderate"]

        risk_score = calculate_risk_score(result)

        result["risk_score"] = risk_score
        result["safety_score"] = calculate_safety_score(risk_score)
        result["risk_level"] = get_risk_level(risk_score)
        result["agreement_grade"] = get_agreement_grade(risk_score)

        # ==============================
        # SAFETY DEFAULTS
        # ==============================

        result.setdefault("risk_score", 50)
        result.setdefault("safety_score", 50)
        result.setdefault("risk_level", "Medium Risk")
        result.setdefault("agreement_grade", "C")

        result.setdefault("positive_findings", [])

        result.setdefault("critical_risks", [])
        result.setdefault("moderate_risks", [])

        result.setdefault("financial_obligations", [])
        result.setdefault("hidden_costs", [])

        result.setdefault("builder_friendly_clauses", [])
        result.setdefault("buyer_friendly_clauses", [])

        result.setdefault("rera_findings", [])
        result.setdefault("timeline_findings", [])

        result.setdefault("project_structure_risks", [])

        result.setdefault("negotiation_points", [])

        result.setdefault("summary", "")

        return result
    except Exception as e:
        print("AI ANALYSIS ERROR:")
        print(str(e))

        return {
    "risk_score": 50,
    "safety_score": 50,
    "risk_level": "Medium Risk",
    "agreement_grade": "C",
    "critical_risks": [],
    "moderate_risks": [
        f"Analysis failed: {str(e)}"
    ],
    "financial_obligations": [],
    "hidden_costs": [],
    "builder_friendly_clauses": [],
    "buyer_friendly_clauses": [],
    "rera_findings": [],
    "timeline_findings": [],
    "project_structure_risks": [],
    "negotiation_points": [],
    "positive_findings": [],
    "summary": "AI analysis could not be completed."
}


def calculate_risk_score(result):
    score = 0

    score += len(result.get("critical_risks", [])) * 10
    score += len(result.get("moderate_risks", [])) * 5

    score += len(result.get("builder_friendly_clauses", [])) * 4

    score += len(result.get("hidden_costs", [])) * 2
    score += len(result.get("financial_obligations", [])) * 2

    score += len(result.get("project_structure_risks", [])) * 3
    score += len(result.get("timeline_findings", [])) * 3

    score -= len(result.get("buyer_friendly_clauses", [])) * 2

    score -= min(
    len(result.get("rera_findings", [])),
    3
) * 2

    score -= rera_bonus * 2

    score = max(0, min(score, 100))

    return score


def calculate_safety_score(risk_score):
    return max(0, 100 - risk_score)


def get_risk_level(score):
    if score <= 20:
        return "Very Safe"
    elif score <= 40:
        return "Low Risk"
    elif score <= 60:
        return "Medium Risk"
    elif score <= 80:
        return "High Risk"

    return "Very High Risk"


def get_agreement_grade(score):
    if score <= 20:
        return "A"
    elif score <= 40:
        return "B"
    elif score <= 60:
        return "C"
    elif score <= 80:
        return "D"

    return "F"