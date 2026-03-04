import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import LobbyPage from "./pages/Lobby";
import RoomPage from "./pages/Room";
import GamePage from "./pages/Game";
import { loadSession } from "./lib/session";
import { useAuth } from "./lib/useAuth";

const RequireName = ({ children }: { children: JSX.Element }) => {
  const session = loadSession();
  const { user, loading, enabled } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-12 text-white">
        <p>Memuat autentikasi...</p>
      </div>
    );
  }

  if (enabled && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!session?.playerName) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/lobby" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/lobby"
      element={
        <RequireName>
          <LobbyPage />
        </RequireName>
      }
    />
    <Route
      path="/room/:code"
      element={
        <RequireName>
          <RoomPage />
        </RequireName>
      }
    />
    <Route
      path="/game/:code"
      element={
        <RequireName>
          <GamePage />
        </RequireName>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
