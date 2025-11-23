// src/api.js
import { BACKEND_URL } from "./config";

async function handleJson(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

export async function sendMoodChat(mood, message) {
  const res = await fetch(`${BACKEND_URL}/chat/mood`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood, message }),
  });
  return handleJson(res);
}

export async function getFitnessPlan(goal, activityLevel, ageGroup) {
  const res = await fetch(`${BACKEND_URL}/fitness/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      goal,
      activity_level: activityLevel,
      age_group: ageGroup,
    }),
  });
  return handleJson(res);
}

export async function sendChatboxMessage(message) {
  const res = await fetch(`${BACKEND_URL}/chatbox`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return handleJson(res);
}

export async function uploadHealthReport(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BACKEND_URL}/health/report`, {
    method: "POST",
    body: form,
  });
  return handleJson(res);
}
