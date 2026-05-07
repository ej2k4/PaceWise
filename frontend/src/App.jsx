import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SocialScenarioExplorer from "./pages/SocialScenarioExplorer";
import SentencePrediction from "./pages/SentencePrediction";
import AdaptiveLearning from "./pages/AdaptiveLearning";
import DailyFeelings from "./pages/DailyFeelings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ParentDashboard from "./pages/ParentDashboard";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { useContext } from "react";

function Navigation() {
  const { user, logout } = useContext(AuthContext);
  
  return (
    <nav className="w-full max-w-5xl px-8 py-6 flex justify-between items-center mb-4">
      <Link to="/" className="text-2xl font-bold text-slate-700 hover:text-sky-600 transition-colors">
        🏠 Home
      </Link>
      <div className="flex gap-6 items-center">
        {user ? (
          <>
            <span className="font-bold text-slate-600">Hi, {user.name}!</span>
            <Link to="/parent-dashboard" className="font-bold text-slate-500 hover:text-slate-800">📊 Parent Dashboard</Link>
            <button onClick={logout} className="font-bold text-red-500 hover:text-red-700">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="font-bold text-sky-600 hover:text-sky-800">Log In</Link>
            <Link to="/register" className="bg-sky-100 text-sky-700 px-4 py-2 rounded-xl font-bold hover:bg-sky-200">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  const { emotion } = useContext(AuthContext);
  const bgColor = emotion ? emotion.appBg : "#f8fafc"; // #f8fafc is slate-50

  return (
    <div className="min-h-screen flex flex-col items-center transition-colors duration-700" style={{ backgroundColor: bgColor }}>
      <Navigation />
      <main className="w-full flex-1 flex flex-col items-center">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/parent-dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
          <Route path="/social-scenario-explorer" element={<ProtectedRoute><SocialScenarioExplorer /></ProtectedRoute>} />
          <Route path="/sentence-prediction" element={<ProtectedRoute><SentencePrediction /></ProtectedRoute>} />
          <Route path="/adaptive-learning" element={<ProtectedRoute><AdaptiveLearning /></ProtectedRoute>} />
          <Route path="/daily-feelings" element={<ProtectedRoute><DailyFeelings /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;