import { useState } from "react";
import Navbar from "./components/Navbar";
import MoodChat from "./components/MoodChat";
import FitnessPlanner from "./components/FitnessPlanner";
import About from "./components/About";
import Footer from "./components/Footer";
import Chatbox from "./components/Chatbox";

function HomePage() {
  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "1.5rem auto",
        padding: "0 1rem",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <MoodChat />
        <FitnessPlanner />
      </div>
    </main>
  );
}

function App() {
  const [activePage, setActivePage] = useState("home");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      {activePage === "home" && <HomePage />}
      {activePage === "about" && <About />}
      {activePage === "chat" && <Chatbox />}

      <Footer />
    </div>
  );
}

export default App;
