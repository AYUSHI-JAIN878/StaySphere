import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Authentication check complete hone tak loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#ff385c] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading StaySphere...</p>
        </div>
      </div>
    );
  }

  // User login nahi hai
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Host-only route
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}