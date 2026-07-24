/**
 * The colour field the glass refracts. Without something behind them, frosted
 * panels have nothing to blur and read as flat grey boxes — so this layer is
 * structural, not decorative. Fixed and non-interactive; sits under everything.
 */
export function Ambient() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-ax-bg">
      <div
        className="absolute rounded-full"
        style={{
          width: "46vw", height: "46vw", left: "-12vw", top: "-14vw",
          background: "var(--ax-blob-1)", opacity: "var(--ax-blob-o1)", filter: "blur(90px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "38vw", height: "38vw", right: "-8vw", top: "18vh",
          background: "var(--ax-blob-2)", opacity: "var(--ax-blob-o2)", filter: "blur(90px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "34vw", height: "34vw", left: "34vw", bottom: "-16vw",
          background: "var(--ax-blob-3)", opacity: "var(--ax-blob-o3)", filter: "blur(90px)",
        }}
      />
    </div>
  );
}
