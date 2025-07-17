import React from "react";

export const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all dark:bg-blue-500 dark:hover:bg-blue-600 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
