import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

/**
 * External link with the standard affordance. Renders children unwrapped when
 * no valid http(s) URL is available — callers never have to branch, and a
 * record with no source link degrades to plain text instead of a dead anchor.
 */
export function ExtLink({
  href,
  children,
  className = "",
  iconSize = 11,
}: {
  href?: string;
  children: ReactNode;
  className?: string;
  iconSize?: number;
}) {
  if (!href || !/^https?:\/\//.test(href)) return <>{children}</>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`group/ext inline-flex items-baseline gap-1.5 hover:text-ax-accent transition-colors ${className}`}
    >
      {children}
      <ExternalLink
        size={iconSize}
        className="shrink-0 self-center opacity-40 group-hover/ext:opacity-100 transition-opacity"
        aria-hidden
      />
    </a>
  );
}
