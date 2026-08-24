import { useId, useMemo } from "react";
import owlySvg from "../../assets/owly-vector.svg?raw";

type OwlyLogoProps = {
  size?: "sm" | "md";
  alt?: string;
  className?: string;
};

const SIZE_CLASS = {
  sm: "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1",
  md: "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-2",
} as const;

export function OwlyLogo({ size = "md", alt = "", className }: OwlyLogoProps) {
  const uid = useId().replace(/:/g, "");
  const markup = useMemo(
    () =>
      owlySvg
        .replace(/<\?xml[^>]*>\s*/u, "")
        .replaceAll("owly-clip-left", `owly-clip-left-${uid}`)
        .replaceAll("owly-clip-right", `owly-clip-right-${uid}`),
    [uid],
  );

  return (
    <span
      className={`${SIZE_CLASS[size]}${className ? ` ${className}` : ""}`}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <span
        className="pointer-events-none block size-full [&_svg]:block [&_svg]:size-full"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </span>
  );
}
