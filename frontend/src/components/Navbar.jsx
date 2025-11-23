export default function Navbar({ activePage, onNavigate }) {
  return (
    <nav
      style={{
        background: "#2563eb",
        color: "white",
        padding: "0.75rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 600 }}>
          AI Well-Being Companion
        </h1>

        <button
          onClick={() => onNavigate("home")}
          style={{
            background:
              activePage === "home" ? "rgba(15,23,42,0.25)" : "transparent",
            border: "none",
            color: "white",
            padding: "0.35rem 0.75rem",
            borderRadius: "999px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Home
        </button>

        <button
          onClick={() => onNavigate("about")}
          style={{
            background:
              activePage === "about" ? "rgba(15,23,42,0.25)" : "transparent",
            border: "none",
            color: "white",
            padding: "0.35rem 0.75rem",
            borderRadius: "999px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          About Team
        </button>

        <button
          onClick={() => onNavigate("chat")}
          style={{
            background:
              activePage === "chat" ? "rgba(15,23,42,0.25)" : "transparent",
            border: "none",
            color: "white",
            padding: "0.35rem 0.75rem",
            borderRadius: "999px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Chatbox
        </button>
      </div>

      <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>
        Mental Wellness &amp; Fitness Coach
      </span>
    </nav>
  );
}
