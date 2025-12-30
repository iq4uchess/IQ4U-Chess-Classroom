import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { login, logout } from "../auth/authService";
import { getUserProgress } from "../services/firebase";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  /* ================= UI STATE ================= */
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  /* ================= PROGRESS ================= */
  const [progress, setProgress] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setProgress({});
      setLoadingProgress(false);
      return;
    }

    getUserProgress(user.uid).then((data) => {
      setProgress(data || {});
      setLoadingProgress(false);
    });
  }, [user, loading]);

  /* ================= ACTIONS ================= */
  const handleLogin = async () => {
    setAuthError("");
    try {
      await login(email, password);
      setEmail("");
      setPassword("");
      setShowLogin(false);
    } catch (err) {
      setAuthError("Invalid email or password");
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowLogin(false);
  };

  const handleProtectedClick = (cb) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    cb();
  };

  /* ================= RENDER ================= */
  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        {!user && showLogin && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn" onClick={handleLogin}>
              Login
            </button>
            {authError && <span>{authError}</span>}
          </>
        )}

        {!user && !showLogin && (
          <button className="btn" onClick={() => setShowLogin(true)}>
            Login
          </button>
        )}

        {user && (
          <button className="btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>

      {/* Main */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginTop: "24px",
        }}
      >
        {/* Branding */}
        <div className="card" style={{ textAlign: "center" }}>
          <img
            src="/src/assets/android-chrome-512x512.png"
            alt="Logo"
            style={{ width: "140px", marginBottom: "16px" }}
          />
          <h2>IQ 4U Academy – Class Room</h2>
          <p>
            Learn chess step by step with guided lessons and interactive
            practice.
          </p>
        </div>

        {/* Levels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <div
              key={lvl}
              className="card"
              style={{
                height: "65px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background:
                  "linear-gradient(90deg, #84fab0, #8fd3f4)",
                color: "#fff",
                fontWeight: "600",
              }}
              onClick={() =>
                handleProtectedClick(() =>
                  navigate("/level/beginner-1")
                )
              }
            >
              Beginner Level {lvl}
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div
        className="card"
        style={{ marginTop: "32px", borderTop: "4px solid #e0e0e0" }}
      >
        <h3>Student Progress</h3>

        {loadingProgress && <p>Loading...</p>}

        {!loadingProgress &&
          Object.keys(progress).length === 0 && (
            <p>No completed lessons yet.</p>
          )}

        {!loadingProgress &&
          Object.keys(progress).length > 0 &&
          Object.entries(progress).map(([levelId, lessons]) => (
            <div key={levelId}>
              <strong>{levelId}</strong>
              <ul>
                {Object.entries(lessons).map(
                  ([lessonId, lesson]) => (
                    <li key={lessonId}>
                      {lessonId} — Score: {lesson.score}%
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
