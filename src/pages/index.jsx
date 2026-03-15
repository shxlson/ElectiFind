import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("electifind_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function normalizeCourseForUi(course, extras = {}) {
  if (!course) return null;
  const totalSeats = Number(course.totalSeats ?? course.seats_total ?? 0);
  const seatsLeft = Number(
    extras.seats ??
    course.seats ??
    (totalSeats > 0 ? Math.max(totalSeats - Number(course.seats_filled || 0), 0) : 0)
  );

  return {
    id: String(course.id ?? course.code ?? Math.random()),
    name: course.name,
    code: course.code,
    credits: Number(course.credits ?? 0),
    difficulty: course.difficulty || "Intermediate",
    seats: seatsLeft,
    totalSeats,
    match: Number(extras.match ?? course.match ?? 80),
    rating: Number(course.rating ?? 4.2),
    instructor: course.instructor || course.professor || "Faculty Assigned",
    prereq: course.prereq || ["Core Prerequisite"]
  };
}
// ─── Global Styles ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #111009;
    --navy-80: #181510;
    --navy-60: #1f1a12;
    --indigo: #2a2318;
    --royal: #7c4a1e;
    --teal: #e8913a;
    --teal-dim: #e8913a20;
    --teal-glow: #e8913a38;
    --cyan: #f5b97a;
    --off-white: #faf7f2;
    --surface: rgba(255,255,255,0.04);
    --surface-2: rgba(255,255,255,0.06);
    --border: rgba(255,255,255,0.07);
    --border-teal: rgba(232,145,58,0.28);
    --text-primary: #f5efe6;
    --text-secondary: #9e9080;
    --text-muted: #554e42;
    --font-display: 'Cormorant Garamond', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
    --font-mono: 'DM Mono', monospace;
    --r-sm: 8px;
    --r-md: 14px;
    --r-lg: 20px;
    --r-xl: 28px;
    --shadow-card: 0 4px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset;
    --shadow-teal: 0 0 40px rgba(232,145,58,0.12);
    --transition: 0.3s cubic-bezier(0.4,0,0.2,1);
  }

  html { scroll-behavior: smooth; }
  body { background: var(--navy); color: var(--text-primary); font-family: var(--font-body); font-size: 15px; line-height: 1.65; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

  ::selection { background: var(--teal-glow); color: var(--teal); }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--navy-80); }
  ::-webkit-scrollbar-thumb { background: var(--indigo); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--teal-dim); }

  @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse-teal { 0%,100% { box-shadow: 0 0 0 0 var(--teal-glow); } 50% { box-shadow: 0 0 0 10px transparent; } }
  @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-12px); } }
  @keyframes spin-slow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes grid-flow { 0% { transform:translateY(0); } 100% { transform:translateY(60px); } }
  @keyframes scan { 0%,100% { top:0%; } 50% { top:95%; } }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
  @keyframes progress-fill { from { width:0%; } to { width:var(--target-width); } }
  @keyframes ripple { 0% { transform:scale(0); opacity:0.4; } 100% { transform:scale(4); opacity:0; } }
  @keyframes slide-in { from { transform:translateX(-100%); } to { transform:translateX(0); } }

  .fade-up { animation: fadeUp 0.6s var(--transition) both; }
  .fade-up-1 { animation: fadeUp 0.6s 0.1s var(--transition) both; }
  .fade-up-2 { animation: fadeUp 0.6s 0.2s var(--transition) both; }
  .fade-up-3 { animation: fadeUp 0.6s 0.3s var(--transition) both; }
  .fade-up-4 { animation: fadeUp 0.6s 0.4s var(--transition) both; }
  .fade-up-5 { animation: fadeUp 0.6s 0.5s var(--transition) both; }

  button { font-family: var(--font-body); cursor: pointer; border: none; outline: none; }
  input, textarea, select { font-family: var(--font-body); }

  .btn-primary {
    background: linear-gradient(135deg, var(--teal) 0%, var(--cyan) 100%);
    color: var(--navy);
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.02em;
    padding: 12px 28px;
    border-radius: var(--r-md);
    transition: var(--transition);
    position: relative;
    overflow: hidden;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,200,200,0.35); }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 14px;
    padding: 11px 24px;
    border-radius: var(--r-md);
    transition: var(--transition);
    backdrop-filter: blur(8px);
  }
  .btn-ghost:hover { border-color: var(--border-teal); color: var(--teal); background: var(--teal-dim); }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    backdrop-filter: blur(12px);
    transition: var(--transition);
  }
  .card:hover { border-color: var(--border-teal); box-shadow: var(--shadow-teal); transform: translateY(-3px); }

  .tag {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--surface-2); border: 1px solid var(--border);
    padding: 3px 10px; border-radius: 100px;
    font-size: 11px; font-weight: 500; color: var(--text-secondary);
    font-family: var(--font-mono);
  }
  .tag.teal { background: var(--teal-dim); border-color: var(--border-teal); color: var(--teal); }
  .tag.warn { background: rgba(255,165,0,0.1); border-color: rgba(255,165,0,0.3); color: #ffa040; }
  .tag.success { background: rgba(180,210,120,0.12); border-color: rgba(180,210,120,0.32); color: #a8c060; }
  .tag.danger { background: rgba(255,60,60,0.1); border-color: rgba(255,60,60,0.3); color: #ff4444; }

  .section-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--teal);
    margin-bottom: 10px;
  }

  .divider { height: 1px; background: var(--border); margin: 0; }

  .star { color: #ffc850; font-size: 13px; }
  .star.empty { color: var(--text-muted); }
`;

// ─── Utility Components ────────────────────────────────────────────────────────

const Stars = ({ rating = 4, max = 5 }) => (
  <span style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} className={i < rating ? "star" : "star empty"}>★</span>
    ))}
  </span>
);

const SeatBar = ({ pct }) => {
  const color = pct > 60 ? "#8fb84a" : pct > 30 ? "#e8913a" : "#d94a2a";
  return (
    <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 1s ease" }} />
    </div>
  );
};

const MatchBadge = ({ pct }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 54, height: 54, borderRadius: "50%",
    background: `conic-gradient(#e8913a ${pct * 3.6}deg, rgba(255,255,255,0.07) 0)`,
    position: "relative"
  }}>
    <div style={{
      position: "absolute", inset: 4, borderRadius: "50%",
      background: "var(--navy-60)", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700, color: "var(--teal)", fontFamily: "var(--font-mono)"
    }}>{pct}%</div>
  </div>
);

const BackgroundGrid = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: `
        linear-gradient(rgba(200,130,50,0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(200,130,50,0.035) 1px, transparent 1px)
      `,
      backgroundSize: "60px 60px",
      maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)"
    }} />
    {[...Array(6)].map((_, i) => (
      <div key={i} style={{
        position: "absolute",
        width: Math.random() * 300 + 100 + "px",
        height: Math.random() * 300 + 100 + "px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${i % 2 === 0 ? "rgba(232,145,58,0.06)" : "rgba(124,74,30,0.10)"} 0%, transparent 70%)`,
        top: Math.random() * 100 + "%",
        left: Math.random() * 100 + "%",
        transform: "translate(-50%,-50%)",
        animation: `float ${4 + i * 1.5}s ease-in-out infinite`,
        animationDelay: `${i * 0.8}s`
      }} />
    ))}
  </div>
);

const FloatingOrb = ({ size, x, y, color, delay }) => (
  <div style={{
    position: "absolute", width: size, height: size,
    borderRadius: "50%", left: x, top: y,
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    animation: `float 6s ease-in-out infinite`,
    animationDelay: delay, pointerEvents: "none"
  }} />
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "questionnaire", label: "Questionnaire", icon: "✦" },
  { id: "recommendations", label: "Recommendations", icon: "◈" },
  { id: "compare", label: "Compare", icon: "⇄" },
  { id: "community", label: "Community", icon: "◎" },
  { id: "my-electives", label: "My Electives", icon: "⊞" },
  { id: "profile", label: "Profile", icon: "◉" },
];

const Sidebar = ({ activePage, setPage, isMobile = false, isOpen = true, onClose }) => (
  <aside style={{
    width: 220, minHeight: "100vh", background: "var(--navy-80)",
    borderRight: "1px solid var(--border)", padding: "28px 0",
    display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 100,
    transform: isMobile ? (isOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
    transition: "transform 0.25s ease"
  }}>
    <div style={{ padding: "0 24px 28px", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "linear-gradient(135deg, #e8913a, #f5b97a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: "var(--navy)"
        }}>E</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>ElectiFind</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>v2.1.0</div>
        </div>
      </div>
    </div>

    <nav style={{ flex: 1, padding: "20px 12px" }}>
      {NAV_ITEMS.map(item => (
        <button key={item.id} onClick={() => { setPage(item.id); if (isMobile && onClose) onClose(); }} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "10px 14px", borderRadius: 14,
          background: activePage === item.id ? "var(--teal-dim)" : "transparent",
          border: activePage === item.id ? "1px solid var(--border-teal)" : "1px solid transparent",
          color: activePage === item.id ? "var(--teal)" : "var(--text-secondary)",
          fontSize: 13, fontWeight: 500, marginBottom: 2,
          transition: "var(--transition)", cursor: "pointer", textAlign: "left"
        }}>
          <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
          {item.label}
          {activePage === item.id && (
            <div style={{ marginLeft: "auto", width: 5, height: 5, borderRadius: "50%", background: "var(--teal)" }} />
          )}
        </button>
      ))}
    </nav>

    <div style={{ padding: "20px 24px", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #7c4a1e, #e8913a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600
        }}>SN</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>Sarvagna</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>CSE • Sem 6</div>
        </div>
      </div>
    </div>
  </aside>
);

const TopBar = ({
  title,
  setPage,
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  searchResults = [],
  searchLoading = false,
  onSearchSelect,
  showMenuButton = false,
  onToggleMenu
}) => (
  <div style={{
    height: 64, background: "rgba(17,16,9,0.88)", backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center",
    justifyContent: "space-between", padding: "0 32px",
    position: "sticky", top: 0, zIndex: 50
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {showMenuButton && (
        <button
          onClick={onToggleMenu}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >☰</button>
      )}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "var(--text-primary)" }}>{title}</h2>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "8px 16px", position: "relative"
      }}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>⌕</span>
        <input
          placeholder="Search courses..."
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSearchSubmit) {
              onSearchSubmit(searchValue);
            }
          }}
          style={{
          background: "none", border: "none", outline: "none",
          color: "var(--text-secondary)", fontSize: 13, width: 180
        }} />
        {(searchLoading || searchResults.length > 0) && (
          <div style={{
            position: "absolute",
            top: 42,
            left: 0,
            right: 0,
            background: "#201a12",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "8px",
            zIndex: 120
          }}>
            {searchLoading && <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "6px 8px" }}>Searching...</div>}
            {!searchLoading && searchResults.slice(0, 6).map((item) => (
              <button
                key={item.id}
                onClick={() => onSearchSelect && onSearchSelect(item)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  border: "1px solid transparent",
                  borderRadius: 8,
                  padding: "8px"
                }}
              >
                <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{item.code}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      <button style={{
        width: 38, height: 38, borderRadius: 10,
        background: "var(--surface)", border: "1px solid var(--border)",
        color: "var(--text-secondary)", fontSize: 16, display: "flex",
        alignItems: "center", justifyContent: "center"
      }}>🔔</button>
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        background: "linear-gradient(135deg, #7c4a1e, #e8913a)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 600, cursor: "pointer"
      }}>SN</div>
    </div>
  </div>
);

// ─── Landing Page ─────────────────────────────────────────────────────────────

const LandingPage = ({ setPage }) => {
  const features = [
    { icon: "✦", title: "Smart Questionnaire", desc: "Multi-step adaptive questionnaire tailored to your academic journey and interests." },
    { icon: "◈", title: "Seat-Aware Matching", desc: "Real-time availability data integrated into every recommendation." },
    { icon: "⬡", title: "Explainable AI", desc: "Understand exactly why each elective was recommended for you." },
    { icon: "★", title: "Student Reviews", desc: "Authentic peer insights and difficulty ratings for every course." },
    { icon: "⇄", title: "Course Comparison", desc: "Side-by-side comparison of up to 3 electives across 8 key metrics." },
    { icon: "◎", title: "Community Hub", desc: "Course-specific threads, discussions, and Q&As from past students." },
  ];

  const steps = [
    { num: "01", title: "Take the Questionnaire", desc: "Share your interests, skills, workload preference, and career goals in 8 minutes." },
    { num: "02", title: "Get Smart Matches", desc: "Our AI analyzes 14 data points to surface your top 3 personalized electives." },
    { num: "03", title: "Compare & Decide", desc: "Review AI insights, peer reviews, and seat availability — then choose with confidence." },
  ];

  const testimonials = [
    { name: "Shrizz.", dept: "ECE • Sem 6", review: "I was stuck between 4 electives. ElectiFind showed me exactly why ML for Engineers was the right fit — the explainability feature is incredible.", rating: 5 },
    { name: "Sarv", dept: "CSE • Sem 7", review: "The seat availability integration saved me from choosing a course that would've been full by the time I registered.", rating: 5 },
    { name: "Shel.", dept: "Mech • Sem 5", review: "Honestly felt like talking to a senior who'd taken all the courses. The community discussions were super helpful.", rating: 4 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)" }}>
      {/* NAV */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 64px", position: "sticky", top: 0, zIndex: 100,
        background: "rgba(17,16,9,0.88)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #e8913a, #f5b97a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "var(--navy)"
          }}>E</div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>ElectiFind</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Features", "How It Works", "Reviews"].map(l => (
            <a key={l} href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none", transition: "var(--transition)" }}
              onMouseEnter={e => e.target.style.color = "var(--teal)"}
              onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-ghost" onClick={() => setPage("login")}>Sign In</button>
          <button className="btn-primary" onClick={() => setPage("login")}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", padding: "80px 64px", overflow: "hidden" }}>
        <BackgroundGrid />
        <FloatingOrb size="600px" x="-10%" y="-20%" color="rgba(232,145,58,0.06)" delay="0s" />
        <FloatingOrb size="400px" x="70%" y="30%" color="rgba(124,74,30,0.12)" delay="2s" />
        <FloatingOrb size="300px" x="20%" y="60%" color="rgba(232,145,58,0.04)" delay="4s" />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 860 }}>
          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--teal-dim)", border: "1px solid var(--border-teal)", borderRadius: 100, padding: "6px 16px", marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", animation: "pulse-teal 2s infinite" }} />
            <span style={{ fontSize: 12, color: "var(--teal)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>AI-POWERED ELECTIVE ADVISOR</span>
          </div>

          <h1 className="fade-up-1" style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(42px, 6vw, 82px)",
            fontWeight: 700, lineHeight: 1.1,
            background: "linear-gradient(160deg, #f5efe6 0%, #e8c9a0 50%, #d97c3a 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 28
          }}>
            Find the Right Elective.<br />Intelligently.
          </h1>

          <p className="fade-up-2" style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 48px" }}>
            ElectiFind uses adaptive AI to match you with electives that align with your skills, career goals, and schedule — then explains every recommendation in plain language.
          </p>

          <div className="fade-up-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => setPage("questionnaire")} style={{ fontSize: 15, padding: "14px 36px" }}>
              Start Questionnaire →
            </button>
            <button className="btn-ghost" onClick={() => setPage("recommendations")} style={{ fontSize: 15, padding: "14px 36px" }}>
              Explore Courses
            </button>
          </div>

          <div className="fade-up-4" style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 64 }}>
            {[["3,200+", "Students Matched"], ["94%", "Satisfaction Rate"], ["120+", "Electives Indexed"]].map(([n, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--teal)", lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, background: "linear-gradient(transparent, var(--navy))" }} />
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 64px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="section-label" style={{ textAlign: "center" }}>CAPABILITIES</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 600, textAlign: "center", marginBottom: 12, background: "linear-gradient(135deg, #f5efe6, #9e9080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Everything You Need to Choose
        </h2>
        <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: 15, marginBottom: 56 }}>One platform. Six intelligent tools. Zero decision anxiety.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {features.map((f, i) => (
            <div key={f.title} className="card" style={{ padding: "28px 24px", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "var(--border-teal)"; e.currentTarget.style.boxShadow = "var(--shadow-teal)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "var(--teal-dim)", border: "1px solid var(--border-teal)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: "var(--teal)", marginBottom: 16
              }}>{f.icon}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 64px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="section-label" style={{ textAlign: "center" }}>PROCESS</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 600, textAlign: "center", marginBottom: 64 }}>
          How ElectiFind Works
        </h2>
        <div style={{ display: "flex", gap: 0, alignItems: "flex-start", position: "relative" }}>
          {/* Connector line */}
          <div style={{ position: "absolute", top: 30, left: "17%", width: "66%", height: 1, background: "linear-gradient(90deg, var(--teal), var(--royal), var(--teal))", opacity: 0.3 }} />

          {steps.map((s, i) => (
            <div key={s.num} style={{ flex: 1, textAlign: "center", padding: "0 24px" }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--teal-dim), var(--surface))",
                border: "1px solid var(--border-teal)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
                fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--teal)"
              }}>{s.num}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 64px", background: "var(--navy-80)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="section-label" style={{ textAlign: "center" }}>STUDENT VOICES</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 600, textAlign: "center", marginBottom: 56 }}>What Students Say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {testimonials.map(t => (
              <div key={t.name} className="card" style={{ padding: "28px 24px" }}>
                <Stars rating={t.rating} />
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, margin: "16px 0 20px", fontStyle: "italic" }}>"{t.review}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #7c4a1e, #e8913a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.dept}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <FloatingOrb size="500px" x="30%" y="-20%" color="rgba(232,145,58,0.06)" delay="0s" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 52, fontWeight: 700, marginBottom: 20, background: "linear-gradient(135deg, #f5efe6, #e8913a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Ready to Find Your Elective?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, marginBottom: 40 }}>Join 3,200+ students who chose smarter with ElectiFind.</p>
          <button className="btn-primary" onClick={() => setPage("login")} style={{ fontSize: 16, padding: "16px 48px" }}>Start for Free →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "48px 64px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #e8913a, #f5b97a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>E</div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>ElectiFind</span>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {["About", "Contact", "Privacy", "Terms"].map(l => (
            <a key={l} href="#" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}>© 2025 ElectiFind</div>
      </footer>
    </div>
  );
};

// ─── Auth Pages ───────────────────────────────────────────────────────────────

const AuthPage = ({ setPage, onAuthSuccess }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !pass || (mode === "signup" && !name)) { setErr("Please fill in all fields."); return; }
    if (pass.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setLoading(true);
    setErr("");
    try {
      const payload = mode === "signup"
        ? { name, email, password: pass }
        : { email, password: pass };
      const endpoint = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localStorage.setItem("electifind_token", data.token);
      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }
      setPage("dashboard");
    } catch (e) {
      setErr(e.message || "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* LEFT PANEL */}
      <div style={{
        flex: 1, background: "var(--navy-80)", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: 64,
        position: "relative", overflow: "hidden", borderRight: "1px solid var(--border)"
      }}>
        <BackgroundGrid />
        <FloatingOrb size="400px" x="20%" y="10%" color="rgba(232,145,58,0.07)" delay="0s" />
        <FloatingOrb size="300px" x="60%" y="50%" color="rgba(124,74,30,0.12)" delay="2s" />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 420 }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: "linear-gradient(135deg, var(--teal-dim), var(--surface-2))",
              border: "1px solid var(--border-teal)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, margin: "0 auto 24px",
              animation: "float 4s ease-in-out infinite"
            }}>◈</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, marginBottom: 16, background: "linear-gradient(135deg, #f5efe6, #e8913a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Smarter choices start here.
            </div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 15 }}>
              Join thousands of students who use AI-powered insights to pick electives they'll actually love.
            </p>
          </div>

          {/* Abstract stat cards */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {[["94%", "Match Accuracy"], ["8 min", "Avg. Time"], ["3", "Top Matches"]].map(([n, l]) => (
              <div key={l} className="card" style={{ padding: "16px 20px", textAlign: "center", flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--teal)" }}>{n}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        width: 480, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "64px 56px"
      }}>
        <div style={{ width: "100%" }}>
          <div style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => setPage("landing")}>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>← Back to home</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #e8913a, #f5b97a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>E</div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17 }}>ElectiFind</span>
          </div>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 4, marginBottom: 36 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "9px 0", borderRadius: 10,
                background: mode === m ? "var(--teal-dim)" : "transparent",
                border: mode === m ? "1px solid var(--border-teal)" : "1px solid transparent",
                color: mode === m ? "var(--teal)" : "var(--text-muted)",
                fontSize: 13, fontWeight: 500, transition: "var(--transition)"
              }}>{m === "login" ? "Sign In" : "Create Account"}</button>
            ))}
          </div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            {mode === "login" ? "Welcome back" : "Join ElectiFind"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
            {mode === "login" ? "Sign in to your account to continue." : "Create your account in seconds."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "signup" && (
              <FloatingInput label="Full Name" placeholder="Sarvagna" type="text" value={name} onChange={setName} />
            )}
            <FloatingInput label="Email Address" placeholder="you@university.edu" type="email" value={email} onChange={setEmail} />
            <FloatingInput label="Password" placeholder="••••••••" type="password" value={pass} onChange={setPass} />
            {mode === "login" && (
              <div style={{ textAlign: "right" }}>
                <a href="#" style={{ color: "var(--teal)", fontSize: 12 }}>Forgot password?</a>
              </div>
            )}
          </div>

          {err && (
            <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)", borderRadius: 8, color: "#ff6464", fontSize: 13 }}>
              ⚠ {err}
            </div>
          )}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%", marginTop: 24, padding: "14px", fontSize: 15, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          <div style={{ textAlign: "center", marginTop: 24, color: "var(--text-muted)", fontSize: 13 }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color: "var(--teal)", cursor: "pointer" }} onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FloatingInput = ({ label, placeholder, type = "text", value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <label style={{
        position: "absolute", left: 14, top: focused || value ? 6 : 14,
        fontSize: focused || value ? 10 : 13,
        color: focused ? "var(--teal)" : "var(--text-muted)",
        transition: "var(--transition)", pointerEvents: "none",
        fontFamily: focused || value ? "var(--font-mono)" : "var(--font-body)",
        letterSpacing: focused || value ? "0.08em" : 0,
        textTransform: focused || value ? "uppercase" : "none"
      }}>{label}</label>
      <input
        type={type}
        placeholder={focused ? placeholder : ""}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "22px 14px 10px",
          background: "var(--surface)", border: `1px solid ${focused ? "var(--border-teal)" : "var(--border)"}`,
          borderRadius: 14, color: "var(--text-primary)", fontSize: 14,
          outline: "none", transition: "var(--transition)",
          boxShadow: focused ? "0 0 0 3px var(--teal-dim)" : "none"
        }}
      />
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const courses = [
  { id: 1, name: "Natural Language Processing", code: "21CSE356T", credits: 4, difficulty: "Intermediate", seats: 14, totalSeats: 40, match: 96, rating: 4.8, instructor: "Dr. Meena Iyer", prereq: ["Data Structures", "Probability & Statistics"] },
  { id: 2, name: "Cloud Computing", code: "21CSE362T", credits: 3, difficulty: "Beginner", seats: 20, totalSeats: 35, match: 88, rating: 4.5, instructor: "Prof. Suresh R.", prereq: ["Computer Networks", "Operating Systems"] },
  { id: 3, name: "Network Security and Cryptography", code: "21CSE358T", credits: 4, difficulty: "Advanced", seats: 8, totalSeats: 30, match: 81, rating: 4.2, instructor: "Dr. Vikram N.", prereq: ["Computer Networks", "Discrete Mathematics"] },
];

const DashboardPage = ({ setPage, setActiveCourse, coursesData = courses, statsData = null, loading = false, topBarProps = {}, onAddCompare }) => {
  const stats = [
    { label: "Recommended", value: String(statsData?.recommended ?? coursesData.length), sub: "Electives", icon: "◈" },
    { label: "Seats Remaining", value: `Avg ${statsData?.avgSeats ?? "13.7"}`, sub: "Across matches", icon: "⊡" },
    { label: "Interest Match", value: String(statsData?.interestMatch ?? "88%"), sub: "Avg score", icon: "✦" },
    { label: "Credits Taken", value: String(statsData?.creditsTaken ?? "18"), sub: "This semester", icon: "⊞" },
  ];

  return (
    <div>
      <TopBar title="Dashboard" setPage={setPage} {...topBarProps} />
      <div style={{ padding: "36px 40px" }}>
        {/* Welcome */}
        <div className="card fade-up" style={{ padding: "28px 32px", marginBottom: 28, background: "linear-gradient(135deg, #2a2318, #1f1a12)", position: "relative", overflow: "hidden" }}>
          <FloatingOrb size="300px" x="80%" y="-30%" color="rgba(232,145,58,0.08)" delay="0s" />
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-mono)", marginBottom: 6 }}>MONDAY, MARCH 2025</p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Good Morning, Sarvagna ✦</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Your questionnaire is 60% complete. Finish it to unlock full recommendations.</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>QUESTIONNAIRE PROGRESS</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ width: 28, height: 6, borderRadius: 3, background: i <= 3 ? "var(--teal)" : "var(--surface-2)" }} />
                ))}
              </div>
              <button className="btn-primary" onClick={() => setPage("questionnaire")} style={{ fontSize: 13, padding: "9px 20px" }}>Continue →</button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="fade-up-1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="card" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 8, textTransform: "uppercase" }}>{s.label}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--teal)", lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.sub}</p>
                </div>
                <div style={{ fontSize: 22, color: "var(--teal)", opacity: 0.5 }}>{s.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations Preview */}
        <div className="fade-up-2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div className="section-label">AI MATCHES</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}>Your Top Recommendations</h3>
            </div>
            <button className="btn-ghost" onClick={() => setPage("recommendations")} style={{ fontSize: 13 }}>View All →</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {loading && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading recommendations...</div>}
            {!loading && coursesData.map((c, idx) => (
              <CourseCard key={c.id} course={c} idx={idx} onView={() => { setActiveCourse(c); setPage("course-detail"); }} onCompare={() => { onAddCompare && onAddCompare(c); setPage("compare"); }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ course, idx, onView, onCompare }) => {
  const seatPct = Math.round((course.seats / course.totalSeats) * 100);
  return (
    <div className="card" style={{ padding: "22px 24px", display: "flex", gap: 20, alignItems: "center", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-teal)"; e.currentTarget.style.boxShadow = "var(--shadow-teal)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}>
      <div style={{ fontSize: 22, fontFamily: "var(--font-mono)", color: "var(--text-muted)", minWidth: 32, fontWeight: 700 }}>0{idx + 1}</div>
      <MatchBadge pct={course.match} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600 }}>{course.name}</span>
          <span className="tag" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{course.code}</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className={`tag ${course.difficulty === "Beginner" ? "success" : course.difficulty === "Advanced" ? "danger" : "teal"}`}>{course.difficulty}</span>
          <span className="tag">{course.credits} Credits</span>
          <Stars rating={Math.floor(course.rating)} />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{course.rating}</span>
        </div>
      </div>
      <div style={{ minWidth: 120 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-mono)" }}>SEATS: {course.seats}/{course.totalSeats}</div>
        <SeatBar pct={seatPct} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-ghost" onClick={onCompare} style={{ fontSize: 12, padding: "8px 14px" }}>Compare</button>
        <button className="btn-primary" onClick={onView} style={{ fontSize: 12, padding: "8px 16px" }}>View Details</button>
      </div>
    </div>
  );
};

// ─── Questionnaire ────────────────────────────────────────────────────────────

const questions = [
  { id: 1, type: "choice", q: "What best describes your academic focus?", opts: ["Algorithms & Theory", "Systems & Infrastructure", "Data & AI/ML", "Design & HCI", "Security & Networks"] },
  { id: 2, type: "slider", q: "How comfortable are you with mathematics-heavy content?", min: 1, max: 5, labels: ["Avoid it", "Love it"] },
  { id: 3, type: "choice", q: "What type of career are you targeting?", opts: ["Software Engineer", "Data Scientist", "Product Manager", "Research Scientist", "Startup Founder", "Undecided"] },
  { id: 4, type: "skill", q: "Rate your current skill level:", skills: ["Python / Coding", "Statistics / Math", "System Design", "Communication"] },
  { id: 5, type: "scenario", q: "You have 8 credits left this semester. What's your priority?", opts: ["Learn something deep and challenging", "Maintain GPA with manageable workload", "Explore an entirely new domain", "Build a portfolio-worthy project"] },
];

const QuestionnairePage = ({ setPage, topBarProps = {} }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sliderVal, setSliderVal] = useState(3);
  const [skills, setSkills] = useState({ "Python / Coding": 3, "Statistics / Math": 2, "System Design": 3, "Communication": 4 });
  const [done, setDone] = useState(false);

  const q = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleNext = () => {
    if (step < questions.length - 1) setStep(s => s + 1);
    else setDone(true);
  };

  if (done) return (
    <div>
      <TopBar title="Questionnaire" setPage={setPage} {...topBarProps} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center", padding: 40 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--teal-dim)", border: "1px solid var(--border-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 24, animation: "float 3s ease-in-out infinite" }}>✦</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Analysis Complete!</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 400, marginBottom: 32, lineHeight: 1.7 }}>Your responses have been analyzed. Your top 3 elective matches are ready.</p>
        <button className="btn-primary" onClick={() => setPage("recommendations")} style={{ fontSize: 15, padding: "14px 36px" }}>View My Recommendations →</button>
      </div>
    </div>
  );

  return (
    <div>
      <TopBar title="Questionnaire" setPage={setPage} {...topBarProps} />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "48px 40px" }}>
        {/* Progress */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>STEP {step + 1} OF {questions.length}</span>
            <span style={{ fontSize: 13, color: "var(--teal)", fontFamily: "var(--font-mono)" }}>{Math.round(progress)}% COMPLETE</span>
          </div>
          <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #e8913a, #f5b97a)", borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
            {questions.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= step ? "var(--teal)" : "var(--surface-2)", transition: "background 0.3s ease" }} />
            ))}
          </div>
        </div>

        {/* Question */}
        <div className="card" style={{ padding: "40px", animation: "fadeUp 0.4s ease both" }} key={step}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--teal)", letterSpacing: "0.1em", marginBottom: 16, textTransform: "uppercase" }}>
            {q.type === "choice" ? "MULTIPLE CHOICE" : q.type === "slider" ? "INTEREST SCALE" : q.type === "skill" ? "SKILL RATING" : "SCENARIO"}
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, marginBottom: 36, lineHeight: 1.3 }}>{q.q}</h2>

          {q.type === "choice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.opts.map(opt => (
                <button key={opt} onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  style={{
                    padding: "14px 20px", borderRadius: 14, textAlign: "left",
                    background: answers[q.id] === opt ? "var(--teal-dim)" : "var(--surface)",
                    border: `1px solid ${answers[q.id] === opt ? "var(--border-teal)" : "var(--border)"}`,
                    color: answers[q.id] === opt ? "var(--teal)" : "var(--text-secondary)",
                    fontSize: 14, fontWeight: 500, transition: "var(--transition)", cursor: "pointer"
                  }}>{opt}</button>
              ))}
            </div>
          )}

          {q.type === "slider" && (
            <div style={{ padding: "20px 0" }}>
              <div style={{ fontSize: 48, fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--teal)", textAlign: "center", marginBottom: 24 }}>
                {["😐","🙂","😊","🤓","🔥"][sliderVal - 1]}
              </div>
              <input type="range" min={1} max={5} value={sliderVal} onChange={e => setSliderVal(+e.target.value)} style={{ width: "100%", accentColor: "var(--teal)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{q.labels[0]}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{q.labels[1]}</span>
              </div>
            </div>
          )}

          {q.type === "skill" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {q.skills.map(skill => (
                <div key={skill}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{skill}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--teal)" }}>{skills[skill]}/5</span>
                  </div>
                  <input type="range" min={1} max={5} value={skills[skill]}
                    onChange={e => setSkills({ ...skills, [skill]: +e.target.value })}
                    style={{ width: "100%", accentColor: "var(--teal)" }} />
                </div>
              ))}
            </div>
          )}

          {q.type === "scenario" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {q.opts.map(opt => (
                <button key={opt} onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  style={{
                    padding: "18px 16px", borderRadius: 14, textAlign: "left",
                    background: answers[q.id] === opt ? "var(--teal-dim)" : "var(--surface)",
                    border: `1px solid ${answers[q.id] === opt ? "var(--border-teal)" : "var(--border)"}`,
                    color: answers[q.id] === opt ? "var(--teal)" : "var(--text-secondary)",
                    fontSize: 13, fontWeight: 500, transition: "var(--transition)", cursor: "pointer", lineHeight: 1.5
                  }}>{opt}</button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
            <button className="btn-ghost" onClick={() => step > 0 && setStep(s => s - 1)} style={{ opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
            <button className="btn-primary" onClick={handleNext}>{step === questions.length - 1 ? "Get Recommendations →" : "Next →"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Recommendations ──────────────────────────────────────────────────────────

const RecommendationsPage = ({ setPage, setActiveCourse, recommendationsData = courses, loading = false, topBarProps = {}, onAddCompare }) => {
  const courseList = recommendationsData.length ? recommendationsData : courses;
  return (
    <div>
    <TopBar title="Your Recommendations" setPage={setPage} {...topBarProps} />
    <div style={{ padding: "36px 40px" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 28, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div className="section-label">AI-CURATED FOR YOU</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600 }}>Your Top 3 Elective Matches</h2>
        </div>
        <div className="card" style={{ padding: "12px 20px", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Sort by:</span>
          {["Match %", "Seats", "Rating"].map(s => (
            <button key={s} className="tag teal" style={{ cursor: "pointer", fontSize: 11 }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {loading && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading AI recommendations...</div>}
        {!loading && courseList.map((c, i) => (
          <div key={c.id} className="card" style={{ padding: "28px 28px", position: "relative", overflow: "hidden" }}>
            {i === 0 && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #e8913a, #f5b97a)" }} />
            )}
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <MatchBadge pct={c.match} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600 }}>{c.name}</h3>
                  {i === 0 && <span className="tag teal" style={{ fontSize: 10 }}>⭑ TOP PICK</span>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <span className="tag">{c.code}</span>
                  <span className="tag">{c.credits} Credits</span>
                  <span className={`tag ${c.difficulty === "Beginner" ? "success" : c.difficulty === "Advanced" ? "danger" : "teal"}`}>{c.difficulty}</span>
                  <span className="tag">👤 {c.instructor}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                  <Stars rating={Math.floor(c.rating)} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.rating}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>• 87 reviews</span>
                </div>
                <div style={{ width: 200 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>SEAT AVAILABILITY</span>
                    <span style={{ fontSize: 11, color: c.seats < 10 ? "#ff4444" : "#ffa040", fontFamily: "var(--font-mono)" }}>{c.seats} left</span>
                  </div>
                  <SeatBar pct={Math.round((c.seats / c.totalSeats) * 100)} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 160 }}>
                <button className="btn-primary" onClick={() => { setActiveCourse(c); setPage("course-detail"); }} style={{ fontSize: 13 }}>View Details</button>
                <button className="btn-ghost" onClick={() => { onAddCompare && onAddCompare(c); setPage("compare"); }} style={{ fontSize: 13 }}>+ Compare</button>
                <button className="btn-ghost" onClick={() => setPage("ai-insight")} style={{ fontSize: 13, color: "var(--teal)", borderColor: "var(--border-teal)" }}>Why Recommended?</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

// ─── Course Detail ────────────────────────────────────────────────────────────

const CourseDetailPage = ({ course, setPage, topBarProps = {}, onAddCompare }) => {
  const [tab, setTab] = useState("overview");
  const c = course || courses[0];
  const seatPct = Math.round((c.seats / c.totalSeats) * 100);

  const tabs = ["overview", "structure", "reviews", "community", "why-recommended"];

  return (
    <div>
      <TopBar title="Course Detail" setPage={setPage} {...topBarProps} />
      {/* Header */}
      <div style={{ background: "var(--navy-80)", borderBottom: "1px solid var(--border)", padding: "36px 40px", position: "relative", overflow: "hidden" }}>
        <FloatingOrb size="400px" x="80%" y="-50%" color="rgba(232,145,58,0.06)" delay="0s" />
        <button onClick={() => setPage("recommendations")} style={{ background: "none", color: "var(--text-muted)", fontSize: 13, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>← Back to Recommendations</button>
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <MatchBadge pct={c.match} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700 }}>{c.name}</h1>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <span className="tag">{c.code}</span>
              <span className="tag">{c.credits} Credits</span>
              <span className={`tag ${c.difficulty === "Beginner" ? "success" : c.difficulty === "Advanced" ? "danger" : "teal"}`}>{c.difficulty}</span>
              <span className="tag">👤 {c.instructor}</span>
            </div>
            <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Stars rating={Math.floor(c.rating)} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{c.rating}</span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>/ 87 reviews</span>
              </div>
              <div style={{ minWidth: 180 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>SEATS: {c.seats} / {c.totalSeats}</span>
                  <span style={{ fontSize: 11, color: seatPct < 30 ? "#ff4444" : "#ffa040", fontFamily: "var(--font-mono)" }}>{seatPct}% remaining</span>
                </div>
                <SeatBar pct={seatPct} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={() => { onAddCompare && onAddCompare(c); setPage("compare"); }} style={{ fontSize: 14 }}>Compare</button>
            <button className="btn-primary" style={{ fontSize: 14, padding: "12px 28px" }}>Enroll Now</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "0 40px", display: "flex", gap: 4 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "16px 18px", background: "none", fontSize: 13,
            fontWeight: tab === t ? 600 : 400,
            color: tab === t ? "var(--teal)" : "var(--text-muted)",
            borderBottom: tab === t ? "2px solid var(--teal)" : "2px solid transparent",
            marginBottom: -1, transition: "var(--transition)", cursor: "pointer",
            textTransform: "capitalize", letterSpacing: "0.02em"
          }}>{t.replace("-", " ")}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: "36px 40px" }}>
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }}>
            <div>
              <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Course Overview</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: 14 }}>
                  This elective introduces students to core concepts in machine learning from an engineering perspective. Topics include supervised and unsupervised learning, model evaluation, neural networks, and practical deployment. The course emphasizes hands-on implementation using Python and scikit-learn.
                </p>
              </div>
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Prerequisites</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {c.prereq.map(p => <span key={p} className="tag">{p}</span>)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[["📅", "Assessment", "3 Assignments + Final Exam"], ["⏱", "Weekly Load", "~8-10 hrs/week"], ["📊", "Grading", "40% Assignments, 60% Exam"], ["🎯", "Career Relevance", "Data Science, ML Engineering"]].map(([ic, l, v]) => (
                <div key={l} className="card" style={{ padding: "16px 20px", display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{ic}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 2 }}>{l.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "why-recommended" && <AIInsightPanel course={c} />}
        {tab === "reviews" && <ReviewsPanel />}
        {tab === "community" && <CommunityPanel />}
        {tab === "structure" && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Course Structure</h3>
            {["Week 1-2: Introduction to ML & Python Setup", "Week 3-4: Supervised Learning (Regression, Classification)", "Week 5-6: Model Evaluation & Overfitting", "Week 7-8: Unsupervised Learning & Clustering", "Week 9-10: Neural Networks Fundamentals", "Week 11-12: Practical Projects & Deployment", "Week 13-14: Review & Final Presentations"].map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: i < 6 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--teal-dim)", border: "1px solid var(--border-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--teal)", flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>{w}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── AI Insight Panel ─────────────────────────────────────────────────────────

const AIInsightPanel = ({ course }) => {
  const bars = [
    { label: "Interest Alignment", pct: 94, color: "#e8913a" },
    { label: "Skill Compatibility", pct: 88, color: "#f5b97a" },
    { label: "Career Relevance", pct: 91, color: "#c8a96e" },
    { label: "Workload Fit", pct: 76, color: "#d97c3a" },
    { label: "Past Preference Match", pct: 82, color: "#e8c49a" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div>
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>AI EXPLANATION</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 14, color: "var(--teal)" }}>Why this course was recommended for you</div>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: 14 }}>
            <strong style={{ color: "var(--text-primary)" }}>{course?.name || "Machine Learning for Engineers"}</strong> was recommended based on your strong interest in data-driven systems, your above-average Python proficiency, and your stated career goal in software engineering with AI exposure. Your questionnaire responses indicate a comfort with mathematical concepts (rated 4/5), which aligns well with this course's linear algebra prerequisites. Additionally, past students with similar profiles rated this course 4.8/5 for satisfaction.
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>SEAT IMPACT</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(255,165,0,0.1)", border: "1px solid rgba(255,165,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⚡</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#ffa040", marginBottom: 6 }}>Only {course?.seats || 12} seats remaining</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>This course fills up 2 weeks before registration closes on average. Act sooner rather than later.</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="card" style={{ padding: 28 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>ALIGNMENT BREAKDOWN</div>
          {bars.map((b, i) => (
            <div key={b.label} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{b.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: b.color, fontWeight: 600 }}>{b.pct}%</span>
              </div>
              <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${b.pct}%`,
                  background: `linear-gradient(90deg, ${b.color}, ${b.color}88)`,
                  borderRadius: 4, transition: "width 1s ease",
                  animation: "progress-fill 1.2s ease both",
                  "--target-width": `${b.pct}%`,
                  animationDelay: `${i * 0.15}s`
                }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 28 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>CAREER ALIGNMENT</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["ML Engineer", "Data Scientist", "AI Researcher", "Backend Engineer"].map(r => (
              <span key={r} className="tag teal" style={{ fontSize: 12 }}>✦ {r}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Compare Page ─────────────────────────────────────────────────────────────

const ComparePage = ({ setPage, coursesData = courses, loading = false, topBarProps = {}, onRemoveCompare, onClearCompare }) => {
  const compareList = coursesData.length ? coursesData.slice(0, 3) : courses;
  const metrics = [
    { label: "Credits", key: "credits", format: v => v },
    { label: "Difficulty", key: "difficulty", format: v => v },
    { label: "Seats Left", key: "seats", format: v => `${v} seats` },
    { label: "Match Score", key: "match", format: v => `${v}%`, best: "max" },
    { label: "Student Rating", key: "rating", format: v => `${v}/5`, best: "max" },
    { label: "Credits", key: "credits", format: v => `${v} credits` },
    { label: "Weekly Load", key: null, format: () => "~8-10 hrs", custom: ["~8-10 hrs", "~6-8 hrs", "~10-12 hrs"] },
    { label: "Assessment", key: null, format: () => "", custom: ["3 Assign + Exam", "Project-based", "2 Assign + Exam"] },
  ];

  const bestIdx = (metric, i) => {
    if (!metric.best) return false;
    const vals = compareList.map((c, ci) => metric.custom ? parseFloat(metric.custom[ci]) : c[metric.key]);
    const best = metric.best === "max" ? Math.max(...vals) : Math.min(...vals);
    return vals[i] === best;
  };

  return (
    <div>
      <TopBar title="Compare Courses" setPage={setPage} {...topBarProps} />
      <div style={{ padding: "36px 40px", overflowX: "auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div className="section-label">SIDE BY SIDE</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600 }}>Compare Your Top Matches</h2>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {compareList.map((c) => (
              <button key={c.id} className="tag teal" onClick={() => onRemoveCompare && onRemoveCompare(c)} style={{ cursor: "pointer" }}>
                {c.code} ✕
              </button>
            ))}
            {compareList.length > 0 && (
              <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => onClearCompare && onClearCompare()}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "180px repeat(3, 1fr)", gap: 0, minWidth: 800 }}>
          {/* Header row */}
          <div style={{ padding: "16px 20px" }} />
          {loading && <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "8px 0" }}>Loading comparison data...</div>}
          {!loading && compareList.map(c => (
            <div key={c.id} className="card" style={{ padding: "22px", margin: "0 6px 6px", textAlign: "center", borderTop: "3px solid var(--teal)" }}>
              <MatchBadge pct={c.match} />
              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, marginTop: 10, lineHeight: 1.3 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{c.code}</div>
            </div>
          ))}

          {/* Metrics */}
          {metrics.map((m, mi) => (
            [
              <div key={`label-${mi}`} style={{
                padding: "14px 20px", background: mi % 2 === 0 ? "var(--surface)" : "transparent",
                borderRadius: "8px 0 0 8px", fontSize: 13, color: "var(--text-muted)",
                display: "flex", alignItems: "center", fontFamily: "var(--font-mono)"
              }}>{m.label.toUpperCase()}</div>,
              ...compareList.map((c, ci) => (
                <div key={`val-${mi}-${ci}`} style={{
                  padding: "14px 20px", margin: "0 6px",
                  background: mi % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  textAlign: "center", fontSize: 13, fontWeight: 500,
                  color: bestIdx(m, ci) ? "var(--teal)" : "var(--text-secondary)",
                  position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                }}>
                  {bestIdx(m, ci) && <span style={{ fontSize: 10, color: "var(--teal)" }}>▲</span>}
                  {m.custom ? m.custom[ci] : m.format(c[m.key])}
                </div>
              ))
            ]
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Community ────────────────────────────────────────────────────────────────

const threads = [
  { id: 1, author: "Rohan M.", course: "21CSE356T", time: "2h ago", title: "How heavy is the NLP course math requirement?", body: "I'm from ECE and worried about probability and optimization basics. Anyone from non-CS background who found it manageable?", upvotes: 34, replies: 12, tags: ["workload", "math"] },
  { id: 2, author: "Divya S.", course: "21CSE362T", time: "5h ago", title: "Cloud Computing labs — individual or team?", body: "The lab brief says team is preferred but not mandatory. Has anyone done it solo and how was the load?", upvotes: 21, replies: 8, tags: ["project", "cloud"] },
  { id: 3, author: "Kiran T.", course: "21CSE358T", time: "1d ago", title: "Security prereqs — how much cryptography depth is expected?", body: "The syllabus lists core cryptography topics. Is prior security coursework enough to handle it comfortably?", upvotes: 15, replies: 5, tags: ["prereq", "security"] },
];

const CommunityPage = ({ setPage, topBarProps = {} }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <TopBar title="Community" setPage={setPage} {...topBarProps} />
      <div style={{ padding: "36px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <div className="section-label">STUDENT DISCUSSIONS</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600 }}>Community Hub</h2>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Post</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {["All Courses", "21CSE356T – NLP", "21CSE362T – Cloud", "21CSE358T – Security"].map(f => (
            <button key={f} className="tag teal" style={{ cursor: "pointer", fontSize: 12, padding: "6px 14px" }}>{f}</button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {["Latest", "Top", "Unanswered"].map(s => (
              <button key={s} className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {threads.map(t => (
            <div key={t.id} className="card" style={{ padding: "22px 24px", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-teal)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ""; }}>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 44 }}>
                  <button style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", color: "var(--text-muted)", fontSize: 14 }}>▲</button>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--teal)" }}>{t.upvotes}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                    <span className="tag teal" style={{ fontSize: 10 }}>{t.course}</span>
                    {t.tags.map(tag => <span key={tag} className="tag" style={{ fontSize: 10 }}>#{tag}</span>)}
                    <span style={{ color: "var(--text-muted)", fontSize: 12, marginLeft: "auto" }}>{t.time}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{t.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{t.body}</p>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #7c4a1e, #e8913a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{t.author[0]}</div>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.author}</span>
                    </div>
                    <button className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }}>💬 {t.replies} Replies</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Post Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
          <div className="card" style={{ width: 560, padding: 36, animation: "fadeUp 0.3s ease" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Create New Post</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <select style={{ padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--text-secondary)", fontSize: 14 }}>
                <option>Select Course</option>
                {courses.map(c => <option key={c.id}>{c.code} – {c.name}</option>)}
              </select>
              <input placeholder="Post title..." style={{ padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
              <textarea placeholder="Share your question or insight..." rows={5} style={{ padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--text-secondary)", fontSize: 14, outline: "none", resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => setShowModal(false)}>Post →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Reviews Panel ────────────────────────────────────────────────────────────

const CommunityPanel = () => <CommunityPage setPage={() => {}} />;

const ReviewsPanel = () => {
  const reviews = [
    { author: "Aditya V.", rating: 5, diff: 4, load: 4, text: "Best elective I've taken. NLP fundamentals are taught very clearly and the assignments are genuinely portfolio-worthy.", helpful: 24, course: "21CSE356T" },
    { author: "Sneha P.", rating: 4, diff: 3, load: 3, text: "Really enjoyed the course. The final weeks on deployment and model evaluation were eye-opening.", helpful: 18, course: "21CSE356T" },
    { author: "Dev K.", rating: 5, diff: 5, load: 5, text: "Challenging but rewarding. If you're serious about language AI, this course is excellent. Be ready to put in extra hours.", helpful: 31, course: "21CSE356T" },
  ];

  const dist = [5, 4, 3, 2, 1];
  const counts = [52, 21, 10, 3, 1];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 28 }}>
      {/* Summary */}
      <div>
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 700, color: "var(--teal)", lineHeight: 1 }}>4.8</div>
            <Stars rating={5} />
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>87 reviews</div>
          </div>
          {dist.map((stars, i) => (
            <div key={stars} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)", minWidth: 12 }}>{stars}</span>
              <div style={{ flex: 1, height: 5, background: "var(--surface-2)", borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${(counts[i] / 87) * 100}%`, background: "#ffc850", borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 20 }}>{counts[i]}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Leave a Review</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 22, cursor: "pointer" }}>★</span>)}
          </div>
          <textarea placeholder="Share your experience..." rows={3} style={{ width: "100%", padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", fontSize: 13, outline: "none", resize: "none" }} />
          <button className="btn-primary" style={{ width: "100%", marginTop: 12, padding: "10px", fontSize: 13 }}>Submit Review</button>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {reviews.map((r, i) => (
          <div key={i} className="card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #7c4a1e, #e8913a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{r.author[0]}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.author}</div>
                  <Stars rating={r.rating} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="tag">Difficulty: {r.diff}/5</span>
                <span className="tag">Load: {r.load}/5</span>
              </div>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>{r.text}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }}>👍 Helpful ({r.helpful})</button>
              <button className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }}>Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── My Electives Page ────────────────────────────────────────────────────────

const MyElectivesPage = ({ setPage, topBarProps = {}, recommendationHistory = [] }) => {
  const electives = [
    { name: "Data Mining and Analytics", code: "21CSE355T", credits: 4, status: "Completed", grade: "A", rating: 4, semester: "Sem 5" },
    { name: "Computer Vision", code: "21CSE454T", credits: 3, status: "Ongoing", grade: "—", rating: null, semester: "Sem 6" },
    { name: "Cloud Computing", code: "21CSE362T", credits: 3, status: "Completed", grade: "B+", rating: 3, semester: "Sem 5" },
  ];

  return (
    <div>
      <TopBar title="My Electives" setPage={setPage} {...topBarProps} />
      <div style={{ padding: "36px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[["10", "Credits Earned"], ["2", "Completed"], ["1", "Ongoing"]].map(([v, l]) => (
            <div key={l} className="card" style={{ padding: "20px 24px" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--teal)" }}>{v}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        <div className="section-label" style={{ marginBottom: 16 }}>ELECTIVE HISTORY</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {electives.map(e => (
            <div key={e.code} className="card" style={{ padding: "22px 24px", display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: e.status === "Completed" ? "rgba(0,200,100,0.1)" : "var(--teal-dim)",
                border: `1px solid ${e.status === "Completed" ? "rgba(0,200,100,0.3)" : "var(--border-teal)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18
              }}>{e.status === "Completed" ? "✓" : "⏳"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{e.name}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="tag">{e.code}</span>
                  <span className="tag">{e.credits} Credits</span>
                  <span className="tag">{e.semester}</span>
                  <span className={`tag ${e.status === "Completed" ? "success" : "teal"}`}>{e.status}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--teal)" }}>{e.grade}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>GRADE</div>
              </div>
              {e.rating && <Stars rating={e.rating} />}
            </div>
          ))}
        </div>

        {/* Recommendation History */}
        <div style={{ marginTop: 40 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>RECOMMENDATION HISTORY</div>
          <div className="card" style={{ padding: "0" }}>
            {(recommendationHistory.length ? recommendationHistory.slice(0, 3).map((h) => {
              const dateText = new Date(h.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" });
              const codes = (h.recommendations || []).map((r) => r.course?.code || r.course_id).filter(Boolean).slice(0, 3).join(", ");
              return [dateText, `AI matched you with ${codes || "top recommendations"} based on questionnaire ${h.questionnaire_id || "latest"}`];
            }) : [["No data", "Complete and submit a questionnaire to generate recommendation history."]]).map(([d, t], i, arr) => (
              <div key={`${d}-${i}`} style={{ display: "flex", gap: 20, padding: "18px 24px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--teal)", minWidth: 90 }}>{d}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Profile Page ─────────────────────────────────────────────────────────────

const ProfilePage = ({ setPage, userData, onUserUpdate, topBarProps = {} }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    roll_no: "",
    department: "",
    batch: "",
    semester: "",
    advisor: "",
    interests: ""
  });

  useEffect(() => {
    const fallbackInterests = ["Machine Learning", "System Design", "HCI", "Python", "Cloud", "Research", "Open Source"];
    const interests = Array.isArray(userData?.interests) && userData.interests.length
      ? userData.interests
      : fallbackInterests;
    setForm({
      name: userData?.name || "",
      email: userData?.email || "",
      roll_no: userData?.roll_no || "",
      department: userData?.department || "Computer Science & Engineering",
      batch: userData?.batch || "2021-2025",
      semester: userData?.semester || "Sem 6",
      advisor: userData?.advisor || "",
      interests: interests.join(", ")
    });
  }, [userData]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        roll_no: form.roll_no,
        department: form.department,
        batch: form.batch,
        semester: form.semester,
        advisor: form.advisor,
        interests: form.interests
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      };
      const updated = await apiRequest("/api/profile", {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      onUserUpdate && onUserUpdate(updated);
      setEditing(false);
    } catch (e) {
      setError(e.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = String(form.name || "SN")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0].toUpperCase())
    .join("");

  return (
    <div>
      <TopBar title="Profile" setPage={setPage} {...topBarProps} />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "36px 40px" }}>
        <div className="card" style={{ padding: "32px", marginBottom: 24, display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c4a1e, #e8913a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700
          }}>{initials || "SN"}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>{form.name || "Student"}</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <span className="tag">{form.department || "Department"}</span>
              <span className="tag">{form.semester || "Semester"}</span>
              <span className="tag teal">{form.batch || "Batch"}</span>
            </div>
          </div>
          {!editing ? (
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setEditing(true)}>Edit Profile</button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={saveProfile} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: "10px 16px", background: "rgba(255,60,60,0.1)", border: "1px solid rgba(255,60,60,0.3)", borderRadius: 8, color: "#ff6464", fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            ["Full Name", "name", false],
            ["Email", "email", true],
            ["Roll No.", "roll_no", false],
            ["Department", "department", false],
            ["Batch", "batch", false],
            ["Advisor", "advisor", false]
          ].map(([label, key, readOnly]) => (
            <div key={label} className="card" style={{ padding: "18px 22px" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
              {!editing || readOnly ? (
                <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{form[key] || "—"}</div>
              ) : (
                <input
                  value={form[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 14, outline: "none" }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Interests & Preferences</h3>
          {!editing ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(form.interests.split(",").map((x) => x.trim()).filter(Boolean)).map((t) => (
                <span key={t} className="tag teal" style={{ fontSize: 13, padding: "6px 14px" }}>✦ {t}</span>
              ))}
            </div>
          ) : (
            <textarea
              value={form.interests}
              onChange={(e) => updateField("interests", e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)", fontSize: 14, outline: "none", resize: "vertical" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ─── App Shell ────────────────────────────────────────────────────────────────

const DASHBOARD_PAGES = ["dashboard", "questionnaire", "recommendations", "compare", "community", "my-electives", "profile", "course-detail", "ai-insight"];

const PAGE_TO_PATH = {
  landing: "/",
  login: "/login",
  dashboard: "/dashboard",
  questionnaire: "/questionnaire",
  recommendations: "/recommendations",
  compare: "/compare",
  community: "/community",
  "my-electives": "/my-electives",
  profile: "/profile",
  "course-detail": "/course-detail",
  "ai-insight": "/ai-insight"
};

function pageFromPath(pathname) {
  const entry = Object.entries(PAGE_TO_PATH).find(([, path]) => path === pathname);
  return entry ? entry[0] : "landing";
}


export {
  apiRequest,
  normalizeCourseForUi,
  GLOBAL_CSS,
  Sidebar,
  TopBar,
  LandingPage,
  AuthPage,
  DashboardPage,
  QuestionnairePage,
  RecommendationsPage,
  CourseDetailPage,
  AIInsightPanel,
  ComparePage,
  CommunityPage,
  MyElectivesPage,
  ProfilePage,
  courses
};
