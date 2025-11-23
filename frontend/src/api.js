import axios from "axios";
import { BACKEND_URL } from "./config";

export async function sendMoodChat(mood, message) {
  const res = await axios.post(`${BACKEND_URL}/chat/mood`, {
    mood,
    message,
  });
  return res.data; // { reply: "..." }
}

export async function getFitnessPlan(goal, activityLevel, ageGroup) {
  const res = await axios.post(`${BACKEND_URL}/fitness/plan`, {
    goal,
    activity_level: activityLevel,
    age_group: ageGroup,
  });
  return res.data; // { goal, activity_level, age_group, plan: [...], tips: [...] }
}

export async function analyzeReport(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${BACKEND_URL}/health/report`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // { file_name, summary, general_advice }
}
