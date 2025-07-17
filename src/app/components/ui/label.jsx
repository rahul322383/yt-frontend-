import React from "react";

export default function Label({
  label,
  value,
  description,
  icon: Icon,
  align = "left",
}) {
  const alignment = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div className="bg-white shadow-md rounded-xl">
      <div
        className={`flex flex-col gap-1 p-4 ${alignment[align]} justify-center`}
      >
        {Icon && <Icon className="w-5 h-5 text-muted-foreground mb-1" />}
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="text-xl font-semibold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
