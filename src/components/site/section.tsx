import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Wraps content in a scroll-reveal animation (IntersectionObserver based). */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.transitionDelay = `${delay}ms`;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    // @ts-expect-error dynamic tag ref typing
    <Tag ref={ref} className={cn("reveal", className)}>
      {children}
    </Tag>
  );
}

export function SectionHeading({
  kicker,
  title,
  className,
}: {
  kicker: string;
  title: string;
  className?: string;
}) {
  return (
    <Reveal className={cn("mb-12 max-w-2xl", className)}>
      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />
        {kicker}
      </p>
      <h2 className="text-3xl leading-tight font-semibold sm:text-[2.75rem]">{title}</h2>
      <span className="mt-5 block h-1 w-16 rounded-full" style={{ background: "var(--gradient-accent)" }} aria-hidden="true" />
    </Reveal>
  );

}
