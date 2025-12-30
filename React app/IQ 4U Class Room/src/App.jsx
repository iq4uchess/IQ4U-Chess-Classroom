import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Level from "./pages/level";
import Classroom from "./pages/classroom";
import { AuthProvider } from "./auth/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/level/:levelId" element={<Level />} />
        <Route
          path="/classroom/:levelId/:lessonId"
          element={<Classroom />}
        />
      </Routes>
    </AuthProvider>
  );
}
