// // src/context/ThemeContext.jsx
// import React, { createContext, useEffect, useState } from 'react';

// export const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState("light");

//   useEffect(() => {
//     const localTheme = localStorage.getItem("theme");
//     if (localTheme) {
//       setTheme(localTheme);
//       document.documentElement.classList.add(localTheme);
//     }
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = theme === "dark" ? "light" : "dark";
//     setTheme(newTheme);
//     document.documentElement.classList.remove(theme);
//     document.documentElement.classList.add(newTheme);
//     localStorage.setItem("theme", newTheme);
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// src/context/ThemeContext.jsx
import React, { createContext, useEffect, useState, useCallback } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // Function to get system preference
  const getSystemTheme = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
  }, []);

  // Function to apply theme
  const applyTheme = useCallback((themeToApply) => {
    // Remove all theme classes first
    document.documentElement.classList.remove("light", "dark");
    
    if (themeToApply === "system") {
      const systemTheme = getSystemTheme();
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.add(themeToApply);
    }
  }, [getSystemTheme]);

  useEffect(() => {
    const localTheme = localStorage.getItem("theme");
    const initialTheme = localTheme || "system";
    
    setTheme(initialTheme);
    applyTheme(initialTheme);

    // Listen for system theme changes if using system preference
    if (initialTheme === "system") {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme("system");
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [applyTheme, getSystemTheme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const setThemePreference = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};