import React from "react";
import { cn } from "../../../utils/cn.jsx";

const Textarea = React.forwardRef(
  (
    {
      className,
      wrapperClass,
      label,
      labelClass,
      error,
      errorClass,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

    return (
      <div className={cn("space-y-2 w-full", wrapperClass)}>
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "block text-sm font-medium text-gray-700 dark:text-gray-300",
              labelClass
            )}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "resize-none transition-colors duration-200 ease-in-out",
            error && "border-red-500 focus-visible:ring-red-200",
            className
          )}
          {...props}
        />
        {error && (
          <p className={cn("text-sm text-red-600 dark:text-red-400", errorClass)}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;