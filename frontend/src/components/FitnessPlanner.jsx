import { useState } from "react";
import { getFitnessPlan } from "../api";

export default function FitnessPlanner() {
  const [goal, setGoal] = useState("Weight Loss");
  const [activityLevel, setActivityLevel] = useState("Beginner");
  const [ageGroup, setAgeGroup] = useState("18-25");
  const [plan, setPlan] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      const data = await getFitnessPlan(goal, activityLevel, ageGroup);
      setPlan(data.plan || []);
      setTips(data.tips || []);
    } catch (err) {
      console.error(err);
      setPlan(["Error fetching fitness plan. Please try again."]);
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        borderRadius: "1rem",
        padding: "1.25rem",
        background: "white",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
        minHeight: "380px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Fitness Coach</h2>
      <p style={{ fontSize: "0.9rem", color: "#4b5563" }}>
        Get a simple, non-medical workout plan based on your goal and activity
        level.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <label style={{ fontSize: "0.9rem" }}>Goal:</label>
          <br />
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={{ padding: "0.25rem 0.5rem" }}
          >
            <option>Weight Loss</option>
            <option>Muscle Gain / Strength</option>
            <option>General Fitness & Health</option>
            <option>Flexibility & Mobility</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "0.9rem" }}>Activity Level:</label>
          <br />
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            style={{ padding: "0.25rem 0.5rem" }}
          >
            <option>Beginner</option>
            <option>Moderate</option>
            <option>Active</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "0.9rem" }}>Age Group:</label>
          <br />
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            style={{ padding: "0.25rem 0.5rem" }}
          >
            <option>18-25</option>
            <option>26-35</option>
            <option>36-45</option>
            <option>46+</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGeneratePlan}
        disabled={loading}
        style={{
          marginTop: "0.75rem",
          padding: "0.5rem 1rem",
          background: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Plan"}
      </button>

      {plan.length > 0 && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#f9fafb",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong>Suggested Plan:</strong>
          <ul style={{ marginTop: "0.5rem" }}>
            {plan.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>

          {tips.length > 0 && (
            <>
              <strong>General Tips:</strong>
              <ul style={{ marginTop: "0.5rem" }}>
                {tips.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
