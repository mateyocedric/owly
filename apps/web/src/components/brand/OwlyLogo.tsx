import React from "react";

type OwlyLogoProps = {
  size?: "sm" | "md";
  alt?: string;
  className?: string;
};

export function OwlyLogo({ size = "md", alt = "", className }: OwlyLogoProps) {
  const wrapperClass =
    size === "sm"
      ? "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1"
      : "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-2";

  return (
    <span className={`${wrapperClass}${className ? ` ${className}` : ""}`}>
      <img
        src="/owly-vector.svg"
        alt={alt}
        draggable={false}
        decoding="async"
        className="block size-full object-contain"
      />
    </span>
  );
}

