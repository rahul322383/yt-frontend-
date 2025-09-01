/* eslint-disable no-unused-vars */
import React from "react";
import { cn } from "../../../utils/cn.jsx";
export const Card = ({ 
  children, 
  className,
  rounded = "lg",
  shadow = "md",
  bordered = true,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 transition-colors",
        `rounded-${rounded}`,
        `shadow-${shadow}`,
        bordered && "border border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card header component
 */
export const CardHeader = ({ 
  children, 
  className,
  withBorder = false,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "p-4",
        withBorder && "border-b border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card title component
 */
export const CardTitle = ({ 
  children, 
  className,
  as: Component = "h3",
  ...props 
}) => {
  return (
    <Component
      className={cn(
        "text-lg font-semibold text-gray-900 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Card description/subtitle component
 */
export const CardDescription = ({ 
  children, 
  className,
  ...props 
}) => {
  return (
    <p
      className={cn(
        "text-sm text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

/**
 * Card content area
 */
export const CardContent = ({ 
  children, 
  className,
  padded = true,
  ...props 
}) => {
  return (
    <div
      className={cn(
        padded && "p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card footer component
 */
export const CardFooter = ({ 
  children, 
  className,
  withBorder = false,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "p-4",
        withBorder && "border-t border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Compound component pattern
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;