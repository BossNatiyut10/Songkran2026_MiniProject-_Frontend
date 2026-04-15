import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full h-14 bg-red-600 px-6 py-3 flex items-center justify-between lg:px-12 lg:py-8">
      {/* Logo / Home link */}
      <Link to="/" className="text-white text-2xl font-bold lg:text-3xl tracking-wide lg:tracking-widest">
        AVALON
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-5 lg:gap-10">
        <Link to="/" className="text-white text-lg font-medium hover:text-gray-700 transition lg:text-2xl">
          Home
        </Link>
        <Link to="/gift" className="text-white text-lg font-medium hover:text-gray-700 transition lg:text-2xl">
          Gift
        </Link>

        {user ? (
          // Logged in — show username and logout
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="text-white text-md lg:text-xl">Hi, {user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-red-600 text-md font-semibold px-3 py-1 rounded hover:bg-red-300 hover:text-gray-700 transition lg:text-lg tracking-wide lg:tracking-wider"
            >
              Log out
            </button>
          </div>
        ) : (
          // Not logged in — show login button
          <Link
            to="/login"
            className="bg-white text-red-600 text-md font-semibold px-3 py-1 rounded hover:bg-red-300 hover:text-gray-700 transition lg:text-lg tracking-wide lg:tracking-wider"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
