// src/components/About.jsx

const teamMembers = [
  {
    name: "Muhammad Junaid Nazar",
    role: "Team Lead, Full-Stack Developer and AI Expert",
    tasks: [
      "Frontend (React + Vite)",
      "Backend (FastAPI) integration",
      "Connecting wellness & fitness modules",
    ],
  },
  {
    name: "Noor Fatima Mir",
    role: "Mental Wellness Content & Prompt Engineer",
    tasks: [
      "Mood categories & supportive responses",
      "Prompt design for safe, non-medical replies",
      "Mapping moods to tips & journaling prompts",
    ],
  },
  {
    name: "Zainab",
    role: "Mindfulness & Stress Relief Specialist",
    tasks: [
      "Breathing techniques & grounding exercises",
      "Mindfulness descriptions for the app",
      "Short, easy-to-use relaxation routines",
    ],
  },
  {
    name: "Zunaira Sajad",
    role: "Journaling & Mental Health Tips Writer",
    tasks: [
      "Journaling prompts for each mood",
      "General mental health tips text",
      "Review of tone & language (empathetic)",
    ],
  },
  {
    name: "Muhammad Junaid Nazar",
    role: "Fitness Plan & Workout Designer",
    tasks: [
      "Weight loss / muscle / general fitness plans",
      "Beginner-friendly home workouts",
      "Daily fitness tips library",
    ],
  },
  {
    name: "Dr. Ammar Masood",
    role: "UI/UX & Presentation Lead",
    tasks: [
      "Screen design, colors, and layout",
      "Hackathon pitch slides & demo flow",
      "Documentation & coordination",
    ],
  },
];

export default function About() {
  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "1.5rem auto",
        padding: "0 1rem 2rem",
      }}
    >
      <h2 style={{ marginTop: 0 }}>About the Team</h2>
      <p style={{ fontSize: "0.95rem", color: "#4b5563", maxWidth: "750px" }}>
        We are a 6 member team collaborating to build an AI-powered Well-Being Companion
        that supports both mental wellness and physical fitness in a simple web interface.
      </p>

      {/* Team cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {teamMembers.map((member) => (
          <div
            key={member.name}
            style={{
              background: "white",
              borderRadius: "1rem",
              padding: "1rem",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "999px",
                background: "#2563eb",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              {member.name.split(" ").pop()?.[0] || "T"}
            </div>
            <h3 style={{ margin: "0 0 0.25rem", fontSize: "1rem" }}>{member.name}</h3>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "#4b5563" }}>
              {member.role}
            </p>
            <ul style={{ paddingLeft: "1.15rem", margin: 0, fontSize: "0.85rem", color: "#4b5563" }}>
              {member.tasks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Work division */}
      <section style={{ marginTop: "2rem" }}>
        <h3>Work Division Overview</h3>
        <p style={{ fontSize: "0.9rem", color: "#4b5563" }}>
          The work is divided so that each member owns a clear part of the system:
        </p>
        <ul style={{ fontSize: "0.9rem", color: "#374151" }}>
          <li>
            <strong>Muhammad Junaid Nazar:</strong> Web development (React + Vite), FastAPI integration, deployment-ready setup.
          </li>
          <li>
            <strong>Noor Fatima Mir:</strong> Mental wellness mood mapping, supportive messages, prompt engineering.
          </li>
          <li>
            <strong>Zainab:</strong> Mindfulness & stress relief techniques (breathing, grounding, relaxation flows).
          </li>
          <li>
            <strong>Zunaria Sajad:</strong> Journaling prompts and mental health tips for each mood.
          </li>
          <li>
            <strong>Muhammad Junaid Nazar:</strong> Fitness plans & workout routines (weight loss, muscle, general fitness, flexibility).
          </li>
          <li>
            <strong>Dr. Ammar Masood:</strong> UI/UX design, branding, slides, and final hackathon presentation.
          </li>
        </ul>
      </section>
    </div>
  );
}
