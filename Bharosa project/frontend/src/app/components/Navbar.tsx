import { Link, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Also check localStorage directly as fallback
  // (handles cases where AuthContext hasn't hydrated yet)
  const token = localStorage.getItem("bharosa_token");
  const storedUser = JSON.parse(localStorage.getItem("bharosa_user") || "null");
  const isLoggedIn = isAuthenticated || !!token;
  const displayUser = user || storedUser;

  const handleLogout = () => {
    logout();
    localStorage.removeItem("bharosa_token");
    localStorage.removeItem("bharosa_user");
    localStorage.removeItem("bharosa_profile");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
              BHAROSA
            </span>
          </Link>

          {/* Nav Links — only show if logged in */}
          {isLoggedIn && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/applications" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                My Applications
              </Link>
              <Link to="/documents" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Documents
              </Link>
            </div>
          )}

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
              
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-destructive border border-border rounded-lg hover:border-destructive transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Login
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg text-sm hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}