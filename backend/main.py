from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import random
import io
import re

from docx import Document
from pypdf import PdfReader

app = FastAPI()

# ---------- CORS ----------

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- MODELS ----------

class MoodRequest(BaseModel):
    mood: str
    message: Optional[str] = None

class FitnessRequest(BaseModel):
    goal: str
    activity_level: str
    age_group: Optional[str] = None

class ChatboxRequest(BaseModel):
    message: str


# ============================================================
#   MENTAL WELLNESS CONTENT (MOOD-SPECIFIC)
# ============================================================

SUPPORTIVE_RESPONSES = {
    "happy": [
        "That’s wonderful to hear! What made you feel good today?",
        "I’m happy for you — would you like to reflect on what went well?",
        "That’s great! Anything exciting happening that you’d like to remember?",
    ],
    "neutral": [
        "Thanks for sharing. How can I support you right now?",
        "It’s okay to have a calm or neutral day. Anything on your mind?",
        "I’m here with you, even if nothing big is happening today.",
    ],
    "stressed": [
        "I’m sorry you’re feeling stressed. Let’s slow things down for a moment.",
        "You’re doing your best — it’s okay to pause and breathe.",
        "Stress can feel heavy. You don’t have to handle everything at once.",
    ],
    "anxious": [
        "Anxiety can be tough. You’re not alone in feeling this way.",
        "It sounds like your mind is very full right now. We can take things one step at a time.",
        "Thank you for sharing this. It’s okay to feel how you feel.",
    ],
    "sad": [
        "I’m really sorry you’re feeling down. Your feelings are valid.",
        "It’s okay to have low days. Be gentle with yourself today.",
        "You matter, even when things feel heavy or unclear.",
    ],
    "lonely": [
        "Loneliness can feel very heavy. You’re not alone here.",
        "Thank you for opening up. Want to reflect on what might help you feel more connected?",
        "It’s okay to need people. Reaching out, even a little, is a brave step.",
    ],
    "angry": [
        "It sounds like something really frustrated or upset you.",
        "Anger is a valid emotion. We can explore what’s underneath it if you’d like.",
        "It’s okay to feel angry. You don’t have to judge yourself for it.",
    ],
    "tired": [
        "You sound exhausted. Rest is also a form of productivity.",
        "Burnout can sneak up on us. Your energy and well-being matter.",
        "Your body and mind both need care. Even a small pause can help.",
    ],
    "overwhelmed": [
        "It’s okay to feel overwhelmed. You’re carrying a lot right now.",
        "We can try to break things into smaller, more manageable pieces.",
        "You don’t have to solve everything at once. One small next step is enough.",
    ],
    "unmotivated": [
        "Motivation comes and goes, and that doesn’t define your worth.",
        "Thanks for being honest about how you feel. We can start with something very small.",
        "You’re allowed to move slowly. Tiny steps still count.",
    ],
}

MINDFULNESS_TECHNIQUES = [
    "Try box breathing: inhale 4 seconds, hold 4, exhale 4, hold 4 and repeat a few times.",
    "Use the 5-4-3-2-1 grounding method: notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you can taste.",
    "Take a slow 5-minute walk and focus on your footsteps and breathing.",
    "Do a quick body scan from head to toe, gently relaxing any tense areas.",
    "Practice 4-7-8 breathing: inhale 4 seconds, hold 7, exhale 8 to calm your nervous system.",
    "Pause and notice your posture, then adjust to a more open and relaxed position.",
]

MENTAL_HEALTH_TIPS_BY_MOOD = {
    "happy": [
        "Take a moment to really savor this feeling and note what contributed to it.",
        "Share your good mood with someone — a kind message or compliment can spread positivity.",
    ],
    "neutral": [
        "Even on neutral days, a small act of self-care can lift your mood slightly.",
        "Check in with your body: do you need water, food, a stretch, or a small break?",
    ],
    "stressed": [
        "Break big tasks into smaller pieces and focus on just one at a time.",
        "Schedule a short break away from screens to reset your mind.",
    ],
    "anxious": [
        "Write your worries down and separate what you can control from what you can’t.",
        "Gently limit caffeine and give yourself a calm, slow breathing break.",
    ],
    "sad": [
        "Reach out to someone you trust, even with a small message like “I’m having a heavy day.”",
        "Do one comforting activity, like listening to soft music or sitting somewhere peaceful.",
    ],
    "lonely": [
        "Consider sending a message or voice note to someone you feel safe with.",
        "Joining an interest-based group (online or offline) can slowly build connection.",
    ],
    "angry": [
        "Give your body a safe outlet: a brisk walk, stretching, or squeezing a stress ball.",
        "If possible, pause before reacting and note what boundary or value feels crossed.",
    ],
    "tired": [
        "Try to prioritize sleep and short rest periods, even if you can’t fully slow down.",
        "Notice if you’re saying yes to too many things; it’s okay to set limits.",
    ],
    "overwhelmed": [
        "List everything on your mind, then circle just one thing to do next.",
        "Ask yourself, “What can I postpone, delegate, or simplify right now?”",
    ],
    "unmotivated": [
        "Commit to a tiny action (2–5 minutes). Often motivation comes after starting.",
        "Be kind to yourself; low-energy days are part of being human.",
    ],
}

JOURNALING_PROMPTS_BY_MOOD = {
    "happy": [
        "What made you feel happy today, and how can you bring more of that into your life?",
        "If you could bottle this feeling and open it later, what would you want to remember?",
    ],
    "neutral": [
        "How would you describe today in a few words, and what would make it 5% better?",
        "Is there anything quietly sitting in the background of your mind right now?",
    ],
    "stressed": [
        "What are the main things stressing you out? Which of them are within your control?",
        "If you could take one small step to reduce stress today, what would it be?",
    ],
    "anxious": [
        "What are your mind’s “worst-case scenarios” right now, and how likely are they really?",
        "If you talked to yourself like a caring friend, what would you say about your worries?",
    ],
    "sad": [
        "What feels heaviest on your heart right now?",
        "Who or what do you miss, and what would you want to tell them if you could?",
    ],
    "lonely": [
        "When have you felt more connected in the past, and what was different then?",
        "What kind of connection or relationship are you craving right now?",
    ],
    "angry": [
        "What exactly triggered your anger, and what value or boundary feels crossed?",
        "If you could express your anger without consequences, what would you say?",
    ],
    "tired": [
        "What has been draining your energy lately?",
        "If you could remove or reduce one demand from your week, what would it be?",
    ],
    "overwhelmed": [
        "List everything on your plate. Which 1–2 items truly need your attention first?",
        "What would “good enough” look like instead of “perfect” right now?",
    ],
    "unmotivated": [
        "What makes it hard to start today? Is it fear, exhaustion, boredom, or something else?",
        "What is one small step you’re willing to try, even if you don’t feel like it?",
    ],
}

GENERIC_TIPS = [
    "Take a short break to stretch, hydrate, or step outside for a minute.",
    "Notice one thing you’re grateful for, even if it’s very small.",
]

GENERIC_JOURNALING_PROMPTS = [
    "How would you describe your current mood in your own words?",
    "What is one kind thing you can do for yourself today?",
]


# ======================= FITNESS ============================

# Base plans by goal (we will adapt them by activity level & age)
WEIGHT_LOSS_BASE = [
    "Day 1 – 15–20 min brisk walk + 5–10 min light stretching (neck, shoulders, legs).",
    "Day 2 – 3 rounds: 20x march in place, 15x step touches, 10x chair squats. Rest 30–60 sec between rounds.",
    "Day 3 – 10–15 min slow walk + gentle stretching or basic yoga.",
    "Day 4 – 3 rounds: 20x jumping jacks (or half-jacks), 15x high knees (slow), 10x wall pushups.",
]

MUSCLE_GAIN_BASE = [
    "Warm-up – 2–3 min arm circles, leg swings, light jogging in place.",
    "3–4 sets: 10–12x pushups (wall or knee pushups if needed).",
    "3–4 sets: 12–15x bodyweight squats.",
    "3–4 sets: 10–12x lunges each leg (use a chair for support if needed).",
    "3–4 sets: 20–30 sec plank.",
    "Cool-down – 5 min stretching (legs, back, chest, shoulders).",
]

GENERAL_FITNESS_BASE = [
    "Day 1 – 20 min brisk walk or light jog + 5 min stretching.",
    "Day 2 – 3 sets: 12x squats, 12x wall pushups, 20 sec plank, 15x glute bridges.",
    "Day 3 – 15–20 min walk + 10 min mobility (ankle circles, hip circles, arm swings).",
    "Day 4 – 10 min walk + 2 sets: 15x chair squats, 15x step-ups, 20x march in place.",
    "Day 5 – Any light fun activity: dancing, walking with friends, or light sports.",
]

FLEXIBILITY_BASE = [
    "Neck rotations – 10 each side, slow and gentle.",
    "Shoulder rolls – 10 forward, 10 backward.",
    "Arm circles – 10 each direction.",
    "Hip circles – 10 each direction.",
    "Hamstring stretch – hold 10–20 seconds gently.",
    "Calf stretch against a wall – hold 10–20 seconds each leg.",
    "Ankle circles – 10 each side.",
]

FITNESS_TIPS = [
    "Start small and build up slowly. Even 5–10 minutes of activity is a good start.",
    "Warm up your body before exercise and cool down afterwards.",
    "Stay hydrated throughout the day.",
    "Rest days are important for recovery.",
    "Good sleep supports both mental wellness and fitness.",
    "Consistency matters more than perfection.",
]


# ======================= HELPERS ============================

def normalize_mood_label(mood: str) -> str:
    if not mood:
        return "neutral"
    m = mood.lower().strip()
    mapping = {
        "happy": "happy",
        "neutral": "neutral",
        "stressed": "stressed",
        "anxious": "anxious",
        "sad": "sad",
        "lonely": "lonely",
        "angry": "angry",
        "tired / burned out": "tired",
        "tired/burned out": "tired",
        "tired": "tired",
        "overwhelmed": "overwhelmed",
        "unmotivated / low energy": "unmotivated",
        "unmotivated": "unmotivated",
        "low energy": "unmotivated",
    }
    if m in mapping:
        return mapping[m]
    for key in mapping:
        if key in m:
            return mapping[key]
    return "neutral"


def get_supportive_response(mood: str) -> str:
    mood_key = normalize_mood_label(mood)
    responses = SUPPORTIVE_RESPONSES.get(mood_key, SUPPORTIVE_RESPONSES["neutral"])
    return random.choice(responses)


def get_mindfulness_suggestion() -> str:
    return random.choice(MINDFULNESS_TECHNIQUES)


def get_mood_tip(mood: str) -> str:
    mood_key = normalize_mood_label(mood)
    tips = MENTAL_HEALTH_TIPS_BY_MOOD.get(mood_key)
    return random.choice(tips) if tips else random.choice(GENERIC_TIPS)


def get_mood_journaling_prompt(mood: str) -> str:
    mood_key = normalize_mood_label(mood)
    prompts = JOURNALING_PROMPTS_BY_MOOD.get(mood_key)
    return random.choice(prompts) if prompts else random.choice(GENERIC_JOURNALING_PROMPTS)


def select_fitness_plan(goal: str, activity_level: str, age_group: Optional[str]) -> List[str]:
    """
    Choose a base plan by goal, then adapt it based on activity level and age.
    This makes the output clearly different for different combinations.
    """
    g = (goal or "").lower()
    lvl = (activity_level or "").lower()
    age = (age_group or "").lower()

    # 1. Pick base plan by goal
    if "loss" in g:
        plan = list(WEIGHT_LOSS_BASE)
    elif "muscle" in g or "strength" in g:
        plan = list(MUSCLE_GAIN_BASE)
    elif "flexibility" in g or "mobility" in g:
        plan = list(FLEXIBILITY_BASE)
    else:
        plan = list(GENERAL_FITNESS_BASE)

    # 2. Adapt for age group
    if "46" in age or "46+" in age:
        plan.insert(
            0,
            "Because you selected age 46+, this plan focuses on lower-impact movements and extra warm-up and recovery. "
            "Listen to your body and stop any exercise that causes pain.",
        )
        # soften high-impact wording
        plan = [
            p.replace("jumping jacks (or half-jacks)", "low-impact side steps or gentle marching in place")
            for p in plan
        ]
    elif "18-25" in age or "26-35" in age:
        plan.insert(
            0,
            "This plan balances cardio and strength to build overall fitness for your age group. "
            "Increase duration slowly if it feels comfortable.",
        )
    elif "36-45" in age:
        plan.insert(
            0,
            "For your age group, this plan keeps a mix of moderate-intensity work and recovery days. "
            "Focus on good form rather than speed.",
        )

    # 3. Adapt for activity level
    if "beginner" in lvl:
        plan.insert(
            1,
            "Because you selected Beginner, aim for about 2–3 active days per week and keep the pace comfortable. "
            "You can skip a round or reduce reps if it feels too much.",
        )
    elif "moderate" in lvl:
        plan.insert(
            1,
            "With a Moderate activity level, aim for about 3–4 active days per week. "
            "Try to complete the listed sets, but it’s fine to take longer rests.",
        )
    elif "active" in lvl or "high" in lvl:
        plan.insert(
            1,
            "Since you’re already Active, you can gradually increase duration or add an extra round on days you feel strong. "
            "Keep at least 1–2 lighter recovery days per week.",
        )

    return plan


def detect_mood_from_message(message: str) -> str:
    text = (message or "").lower()
    if any(w in text for w in ["stress", "stressed", "pressure", "overload"]):
        return "stressed"
    if any(w in text for w in ["anxious", "anxiety", "panic"]):
        return "anxious"
    if any(w in text for w in ["sad", "upset", "depressed", "down"]):
        return "sad"
    if any(w in text for w in ["angry", "mad", "furious"]):
        return "angry"
    if any(w in text for w in ["lonely", "alone", "no one"]):
        return "lonely"
    if any(w in text for w in ["tired", "exhausted", "burned out", "burnt out"]):
        return "tired"
    if any(w in text for w in ["overwhelmed", "too much"]):
        return "overwhelmed"
    if any(w in text for w in ["no motivation", "unmotivated", "lazy"]):
        return "unmotivated"
    if any(w in text for w in ["happy", "good", "excited"]):
        return "happy"
    return "neutral"


# ================ REPORT TEXT EXTRACTION ====================

def extract_text_from_docx_bytes(raw: bytes) -> str:
    file_like = io.BytesIO(raw)
    doc = Document(file_like)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def extract_text_from_pdf_bytes(raw: bytes) -> str:
    file_like = io.BytesIO(raw)
    reader = PdfReader(file_like)
    pages_text = []
    for page in reader.pages[:5]:
        try:
            pages_text.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n".join(pages_text)


def extract_text_from_upload(file: UploadFile, raw: bytes) -> str:
    name = (file.filename or "").lower()
    if name.endswith(".docx"):
        return extract_text_from_docx_bytes(raw)
    if name.endswith(".pdf"):
        return extract_text_from_pdf_bytes(raw)
    try:
        return raw.decode("utf-8", errors="ignore")
    except Exception:
        return ""


# ================ SIMPLE "AI" REPORT ANALYSIS =================

def analyze_report_text(text: str) -> List[str]:
    findings = []
    lower = text.lower()

    bp_match = re.search(r"(\d{2,3})\s*/\s*(\d{2,3})\s*mmhg", lower)
    if bp_match:
        sys = int(bp_match.group(1))
        dia = int(bp_match.group(2))
        if sys >= 140 or dia >= 90:
            findings.append(
                f"Blood pressure appears elevated around {sys}/{dia} mmHg, "
                "which can be consistent with high blood pressure. Only a doctor can accurately interpret this."
            )

    chol_match = re.search(r"cholesterol.*?(\d+)\s*mg/dl", lower)
    if chol_match:
        total_chol = int(chol_match.group(1))
        if total_chol > 200:
            findings.append(
                f"Total cholesterol is around {total_chol} mg/dL, which is above common reference ranges."
            )

    ldl_match = re.search(r"ldl.*?(\d+)\s*mg/dl", lower)
    if ldl_match:
        ldl = int(ldl_match.group(1))
        if ldl > 130:
            findings.append(
                f"LDL (often called 'bad' cholesterol) is about {ldl} mg/dL, which is higher than many guidelines suggest."
            )

    hdl_match = re.search(r"hdl.*?(\d+)\s*mg/dl", lower)
    if hdl_match:
        hdl = int(hdl_match.group(1))
        if hdl < 40:
            findings.append(
                f"HDL (sometimes called 'good' cholesterol) is around {hdl} mg/dL, which can be on the lower side."
            )

    tri_match = re.search(r"triglycerides.*?(\d+)\s*mg/dl", lower)
    if tri_match:
        tri = int(tri_match.group(1))
        if tri > 150:
            findings.append(
                f"Triglycerides are about {tri} mg/dL, which is somewhat higher than typical reference values."
            )

    return findings


# ========================= ROUTES ===========================

@app.get("/")
def root():
    return {"status": "ok", "message": "AI Well-Being backend running"}


@app.post("/chat/mood")
def chat_mood(req: MoodRequest):
    supportive = get_supportive_response(req.mood)
    mindfulness = get_mindfulness_suggestion()
    tip = get_mood_tip(req.mood)
    journaling = get_mood_journaling_prompt(req.mood)

    reply = (
        f"{supportive} "
        f"{mindfulness} "
        f"Tip: {tip} "
        f"Journaling prompt: {journaling}"
    )
    return {"reply": reply}


@app.post("/fitness/plan")
def fitness_plan(req: FitnessRequest):
    """
    Returns a plan that adapts to goal + activity level + age group.
    """
    plan = select_fitness_plan(req.goal, req.activity_level, req.age_group)
    return {
        "goal": req.goal,
        "activity_level": req.activity_level,
        "age_group": req.age_group,
        "plan": plan,
        "tips": FITNESS_TIPS,
    }


@app.post("/chatbox")
def chatbox(req: ChatboxRequest):
    message = req.message or ""
    detected_mood = detect_mood_from_message(message)

    supportive = get_supportive_response(detected_mood)
    mindfulness = get_mindfulness_suggestion()
    tip = get_mood_tip(detected_mood)
    journaling = get_mood_journaling_prompt(detected_mood)

    reply = (
        f"{supportive} "
        f"{mindfulness} "
        f"Tip: {tip} "
        f"Journaling prompt: {journaling}"
    )
    return {"reply": reply}


@app.post("/health/report")
async def analyze_report(file: UploadFile = File(...)):
    raw = await file.read()
    text = extract_text_from_upload(file, raw)

    if not text.strip():
        summary = (
            "I could not read the contents of this file. It may be an image or a "
            "format that this demo does not fully support."
        )
        findings: List[str] = []
    else:
        preview = text[:1500]
        lines = [ln.strip() for ln in preview.splitlines() if ln.strip()]
        preview_part = " ".join(lines[:3]) + (" ..." if len(lines) > 3 else "")

        findings = analyze_report_text(text)

        summary_lines = ["Key points I can see in the text (non-medical):"]
        if findings:
            for f in findings:
                summary_lines.append(f"- " + f)
        else:
            summary_lines.append("- No obvious abnormal values detected by this simple checker.")

        summary_lines.append("")
        summary_lines.append("Short preview from the report:")
        summary_lines.append(preview_part)

        summary = "\n".join(summary_lines)

    general_guidance = [
        "I am not a doctor and cannot provide a diagnosis or prescribe medicines.",
        "Please discuss this report with a qualified healthcare professional for accurate interpretation.",
        "If you have serious symptoms like chest pain, trouble breathing, severe pain, or confusion, seek emergency medical help immediately.",
        "In general, follow your doctor's instructions, take medicines only as prescribed, rest adequately, stay hydrated, and maintain a balanced diet.",
        "For borderline blood pressure or cholesterol, lifestyle changes such as regular physical activity, balanced diet, stress management, and avoiding smoking are often recommended — but your doctor is the best person to guide you.",
    ]

    return {
        "file_name": file.filename,
        "summary": summary,
        "general_advice": general_guidance,
    }
