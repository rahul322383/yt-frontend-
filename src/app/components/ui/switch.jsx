import { forwardRef } from "react";

export const SwitchButton = forwardRef(
  (
    {
      name = "switch",
      checked = false,
      onChange = () => {}, // default to avoid errors
      disabled = false,
      label = "",
    },
    ref
  ) => {
    return (
      <div className="flex items-center justify-between w-full">
        {label && (
          <label htmlFor={name} className="mr-4 text-sm font-medium">
            {label}
          </label>
        )}

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          id={name}
          name={name}
          disabled={disabled}
          ref={ref}
          onClick={() => {
            if (typeof onChange === "function" && !disabled) {
              onChange(!checked);
            }
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
            checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    );
  }
);
