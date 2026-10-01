import { ReactNode } from "react";

export const Prose = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div
    className={`max-w-3xl text-[16.5px] leading-[1.8] text-foreground/85 space-y-5
    [&_h2]:font-display [&_h2]:text-3xl md:[&_h2]:text-4xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-foreground
    [&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-foreground
    [&_h4]:font-display [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:mt-8 [&_h4]:mb-2 [&_h4]:text-foreground
    [&_p]:text-foreground/80
    [&_strong]:text-foreground [&_strong]:font-semibold
    [&_a]:text-accent-blue [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary
    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
    [&_li]:text-foreground/80
    [&_blockquote]:border-l-2 [&_blockquote]:border-accent-blue [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-foreground/70 ${className}`}
  >
    {children}
  </div>
);