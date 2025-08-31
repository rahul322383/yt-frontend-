import React from 'react';

// Command Root Component
const Command = ({ children, className = '' }) => {
  return (
    <div className={`relative rounded-lg border bg-white shadow-md overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

// Command Input Component - Fixed version (supports onChange + onValueChange)
const CommandInput = ({ 
  placeholder = 'Search...', 
  value = '',
  onChange,
  onValueChange, // ✅ allow Radix-style prop
  className = '', 
  ...props 
}) => {
  const handleChange = (e) => {
    onChange?.(e.target.value);
    onValueChange?.(e.target.value); // ✅ call if provided
  };

  return (
    <div className="px-3 pt-3 pb-2 border-b">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`w-full bg-transparent outline-none placeholder:text-gray-400 ${className}`}
        {...props}
      />
    </div>
  );
};

// Command List Component
const CommandList = ({ children, className = '' }) => {
  return (
    <div className={`overflow-y-auto max-h-[300px] ${className}`}>
      {children}
    </div>
  );
};

// Command Empty State Component
const CommandEmpty = ({ children, className = '' }) => {
  return (
    <div className={`py-6 text-center text-sm text-gray-500 ${className}`}>
      {children || 'No results found.'}
    </div>
  );
};

// Command Group Component
const CommandGroup = ({ heading, children, className = '' }) => {
  return (
    <div className={className}>
      {heading && (
        <div className="px-3 py-2 text-xs font-medium text-gray-500">
          {heading}
        </div>
      )}
      <div className="divide-y">
        {children}
      </div>
    </div>
  );
};

// Command Item Component
const CommandItem = ({ children, onSelect, className = '', ...props }) => {
  return (
    <button
      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors ${className}`}
      onClick={onSelect}
      {...props}
    >
      {children}
    </button>
  );
};

// Export all components
export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
};
