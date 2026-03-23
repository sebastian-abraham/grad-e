import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";

function App() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Grad-E Dashboard</h1>
      <p>Welcome, {currentUser.displayName || currentUser.email}</p>
      <p>Role: {currentUser.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default App;
