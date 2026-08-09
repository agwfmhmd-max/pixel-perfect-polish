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
    <Reveal className={cn("mb-10 max-w-2xl", className)}>
      <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">
        <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
        {kicker}
      </p>
      <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
    </Reveal>
  );
}
