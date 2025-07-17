import React from "react";

export const Input = ({ type = "text", className = "", ...props }) => {
  return (
    <input
      type={type}
      className={`border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${className}`}
      {...props}
    />
  );
};
