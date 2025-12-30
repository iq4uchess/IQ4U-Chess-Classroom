import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import lesson1_thechessboard from "../lessons/lesson1_thechessboard";

export default function Level() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const lessons = [
    {
      id: lesson1_thechessboard.meta.id,
      title: lesson1_thechessboard.meta.title,
      passcode: lesson1_thechessboard.meta.passcode
    }
  ];

  const handleLessonClick = (lesson) => {
    if (lesson.passcode) {
      const input = window.prompt("Enter passcode for this lesson:");

      if (input === null) return;

      if (input !== lesson.passcode) {
        alert("Incorrect passcode");
        return;
      }
    }

    navigate(`/classroom/${levelId}/${lesson.id}`);
  };

  /* ================= RENDER ================= */
  return (
    <div className="page">
      <div
        style={{
          height: "80px",
          background: "linear-gradient(90deg, #4facfe, #00f2fe)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "24px",
          fontWeight: "600"
        }}
      >
        Beginner Level 1
      </div>

      {/* ===== AUTH GUARD ===== */}
      {!loading && !user && (
        <div
          className="card"
          style={{
            marginTop: "24px",
            textAlign: "center"
          }}
        >
          <p>Please login to continue.</p>
        </div>
      )}

      {/* ===== LESSONS ===== */}
      {user && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginTop: "24px"
          }}
        >
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="card"
              style={{
                cursor: "pointer",
                background: "linear-gradient(90deg, #84fab0, #8fd3f4)",
                color: "#fff"
              }}
              onClick={() => handleLessonClick(lesson)}
            >
              {index + 1}. {lesson.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
