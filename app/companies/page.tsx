"use client";

import { ExtLink } from "@/components/ext-link";
import { useVenture } from "@/lib/hooks";

export default function CompaniesPage() {
  const { data: venture } = useVenture();
  return (
    <div className="max-w-3xl space-y-2">
      {(venture ?? []).map((v) => {
        const meta = [
          v.focus,
          v.securityType,
          v.location,
          v.investors ? `${v.investors} investor${v.investors === 1 ? "" : "s"}` : "",
          "SEC Form D",
        ].filter(Boolean).join(" · ");
        return (
          <div key={v.id} className="glass rounded-2xl px-4 py-3.5 flex justify-between gap-4 items-center">
            <div className="min-w-0">
              <ExtLink href={v.link} className="text-xs text-ax-text font-medium">
                {v.co}
              </ExtLink>
              <div className="prose-body text-[10px] text-ax-dim mt-0.5">{meta}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-mono text-ax-accent tabular">{v.round}</div>
              {v.offeringStatus && (
                <div className="text-[10px] font-mono text-ax-muted mt-0.5">{v.offeringStatus}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
