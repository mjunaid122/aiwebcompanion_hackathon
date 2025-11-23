import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { analyzeReport } from "../api";

export default function Chatbox() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "You", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/chatbox`, {
        message: input,
      });
      const botMsg = { sender: "AI", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "Error contacting the wellness assistant." },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleAnalyzeReport = async () => {
    if (!file) return;

    const userMsg = {
      sender: "You",
      text: `Uploaded report: ${file.name}`,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await analyzeReport(file);
      const adviceLines = (data.general_advice || []).map(
        (line) => `- ${line}`
      );
      const text = `Here is a non-medical summary of your report "${data.file_name}":\n\n${data.summary}\n\nGeneral guidance:\n${adviceLines.join(
        "\n"
      )}`;

      const botMsg = { sender: "AI (Report Analysis)", text };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "AI (Report Analysis)",
          text: "Sorry, I could not analyze this report due to a server error.",
        },
      ]);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <main
      style={{
        maxWidth: "750px",
        margin: "1.5rem auto",
        padding: "0 1rem 2rem",
      }}
    >
      <h2 style={{ marginTop: 0 }}>AI Chatbox</h2>
      <p style={{ color: "#4b5563", fontSize: "0.95rem" }}>
        Ask anything! This uses a wellness-focused AI assistant. Responses are
        general-purpose and non-medical. You can also upload a health report to
        get a non-diagnostic summary and general guidance.
      </p>

      <div
        style={{
          height: "360px",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          padding: "1rem",
          overflowY: "auto",
          marginBottom: "1rem",
          boxShadow: "0 6px 15px rgba(0,0,0,0.06)",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
            Start the conversation by asking a question or upload a health
            report below.
          </p>
        )}
        {messages.map((m, i) => (
          <p key={i} style={{ marginBottom: "0.5rem", whiteSpace: "pre-wrap" }}>
            <strong>{m.sender}:</strong> {m.text}
          </p>
        ))}
      </div>

      {/* Text chat controls */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          style={{
            width: "70%",
            padding: "0.6rem 0.8rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            marginRight: "0.5rem",
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>

      {/* File upload for health report */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ maxWidth: "260px" }}
        />
        <button
          onClick={handleAnalyzeReport}
          disabled={loading || !file}
          style={{
            padding: "0.5rem 1rem",
            background: file ? "#16a34a" : "#9ca3af",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: file ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Analyzing..." : "Analyze Report"}
        </button>
        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
          This analysis is not a medical diagnosis. Always follow your doctor’s
          advice.
        </span>
      </div>
    </main>
  );
}
