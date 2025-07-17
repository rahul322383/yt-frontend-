// src/components/layout/Navbar.jsx
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const Navbar = ({ user, handleLogout }) => {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") || "light"
  );
  const { toggleTheme } = useTheme();

   useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white">
      <Link to="/" className="text-2xl font-bold">VidWave</Link>
      <div className="flex items-center gap-4">
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout} className="hover:underline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
         <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-md"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
      </div>
    </nav>
  );
};

export default Navbar;
