import { useState, useRef, useEffect } from "react";
import { sendMoodChat } from "../api";

const moodOptions = [
  "Happy",
  "Neutral",
  "Stressed",
  "Anxious",
  "Sad",
  "Lonely",
  "Angry",
  "Tired / Burned Out",
  "Overwhelmed",
  "Unmotivated / Low Energy",
];

export default function MoodChat() {
  const [mood, setMood] = useState("Stressed");
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]); // trail of chats
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom when new message added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations]);

  const handleSend = async () => {
    if (!mood && !message.trim()) return;

    try {
      setLoading(true);
      const data = await sendMoodChat(mood, message);

      // Append new exchange to trail
      setConversations((prev) => [
        ...prev,
        {
          id: Date.now(),
          mood,
          userText: message.trim() || "(No extra description, only mood selected.)",
          reply: data.reply,
        },
      ]);

      // clear textbox after sending
      setMessage("");
    } catch (err) {
      console.error(err);
      setConversations((prev) => [
        ...prev,
        {
          id: Date.now(),
          mood,
          userText: message || "(message failed to send)",
          reply: "Something went wrong while contacting the assistant.",
        },
      ]);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      // allow Ctrl+Enter to send
      e.preventDefault();
      if (!loading) handleSend();
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "0.25rem" }}>Mental Wellness</h2>
      <p style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: 0 }}>
        Share how you feel and get a gentle, non-medical response with
        mindfulness tips and a journaling prompt for reflection.
      </p>

      <label style={{ fontSize: "0.9rem" }}>Select your mood:</label>
      <br />
      <select
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        style={{
          margin: "0.5rem 0 0.75rem",
          padding: "0.35rem 0.75rem",
          borderRadius: "999px",
          border: "1px solid #d1d5db",
        }}
      >
        {moodOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <textarea
        rows={4}
        placeholder="Write about how you're feeling (optional)..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          marginTop: "0.5rem",
          padding: "0.6rem 0.8rem",
          borderRadius: "0.75rem",
          border: "1px solid #d1d5db",
          resize: "vertical",
        }}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        style={{
          marginTop: "0.75rem",
          padding: "0.5rem 1.2rem",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "999px",
          cursor: "pointer",
          fontWeight: 500,
          alignSelf: "flex-start",
        }}
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      {/* Conversation trail */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          background: "#f9fafb",
          borderRadius: "0.75rem",
          border: "1px solid #e5e7eb",
          maxHeight: "260px",
          overflowY: "auto",
        }}
      >
        <strong>Assistant:</strong>
        {conversations.length === 0 ? (
          <p
            style={{
              marginTop: "0.35rem",
              fontSize: "0.9rem",
              color: "#9ca3af",
            }}
          >
            Your responses will appear here. Each entry includes a mindfulness
            tip and a journaling prompt you can use in a separate notebook.
          </p>
        ) : (
          conversations.map((c) => (
            <div
              key={c.id}
              style={{ marginTop: "0.75rem", fontSize: "0.95rem" }}
            >
              <p style={{ margin: 0 }}>
                <strong>You ({c.mood}):</strong> {c.userText}
              </p>
              <p style={{ margin: "0.25rem 0 0", whiteSpace: "pre-wrap" }}>
                <strong>AI:</strong> {c.reply}
              </p>
              <hr
                style={{
                  marginTop: "0.6rem",
                  border: "none",
                  borderBottom: "1px solid #e5e7eb",
                }}
              />
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
