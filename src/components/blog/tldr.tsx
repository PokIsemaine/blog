import { Callout } from "fumadocs-ui/components/callout";
export function TLDR({ children }: { children: React.ReactNode }) {
  return (
    <Callout title="TL;DR" type="info" className="tldr">
      {children}
    </Callout>
  );
}
