import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import { Loader2 } from "lucide-react";

// Import all of your page components from their respective files
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import AuthCallbackPage from "./pages/AuthCallback";
import DashboardPage from "./pages/Dashboard";
import WorkoutsPage from "./pages/Workouts";
import MeasurementsPage from "./pages/Measurements";
import DietPage from "./pages/Diet";
import ProfilePage from "./pages/Profile";
import WorkoutTemplatesPage from "./pages/WorkoutTemplates";
import FriendsPage from "./pages/Friends";
import AdminDashboardPage from "./pages/AdminDashboard";

// --- Helper Component: Loading Spinner ---
// A consistent spinner to show while checking authentication status
const LoadingSpinner = () => (
    <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
);

// --- Helper Component: Protected Route for Regular Users ---
// This component wraps your regular pages. It checks if a user is logged in.
// If not, it redirects them to the login page.
function ProtectedRoute({ children }: { children: React.ReactElement }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    return user ? children : <Navigate to="/login" replace />;
}

// --- Helper Component: Protected Route for Admins ---
// This component is stricter. It checks if a user is logged in AND has the 'admin' role.
function AdminRoute({ children }: { children: React.ReactElement }) {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner />;

    // Redirect if not logged in at all
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    // Redirect to the user dashboard if they are a regular user trying to access an admin page
    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
    
    // If all checks pass, show the protected admin page
    return children;
}

// --- Main Routing Logic ---
// This component contains the core logic for handling navigation and redirection.
function AppRoutes() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // This effect is the key to solving the "not redirecting after login" problem.
    // It watches for a change in the `user` state from your AuthContext.
    useEffect(() => {
        // Only run this logic if the authentication check is complete AND a user is logged in.
        if (!loading && user) {
            // If the user is somehow on the login page (meaning they just logged in), redirect them.
            if (location.pathname === '/login' || location.pathname === '/') {
                if (user.role === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            }
        }
    }, [user, loading, navigate, location]);

    // Show a loading spinner on the very first load while the app checks for an active session.
    if (loading) {
        return <LoadingSpinner />;
    }

    // This is the main router that defines all possible pages in your application.
    return (
        <Routes>
            {/* Public Routes (accessible to everyone) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            
            {/* Protected User Routes (require a user to be logged in) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/workouts" element={<ProtectedRoute><WorkoutsPage /></ProtectedRoute>} />
            <Route path="/measurements" element={<ProtectedRoute><MeasurementsPage /></ProtectedRoute>} />
            <Route path="/diet" element={<ProtectedRoute><DietPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/workouts/templates" element={<ProtectedRoute><WorkoutTemplatesPage /></ProtectedRoute>} />
            <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
            
            {/* Protected Admin Route (requires a user with the 'admin' role) */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

            {/* Catch-all route to redirect any unknown paths back to the home page */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

// The main App component that wraps the entire application in the AuthProvider and Router
export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}// Build timestamp: Fri Oct 24 03:46:14 AM UTC 2025
