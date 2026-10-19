export function TLDR({ children }: { children: React.ReactNode }) {
  return (
    <section className="tldr" aria-label="TL;DR">
      <strong className="tldr-title">TL;DR</strong>
      <div>{children}</div>
    </section>
  );
}
