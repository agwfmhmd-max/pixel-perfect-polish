import { useMemo, useState } from "react";
import { ArrowUpRight, Github, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "./section";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useLocalized, localizedValue } from "@/lib/localized";
import { useProjects } from "@/lib/portfolio";
import { externalUrl } from "@/lib/links";
import { PROJECT_CATEGORIES } from "@/data/fallback";
import type { Project } from "@/data/types";

export function Projects() {
  const { t } = useI18n();
  const { tr, lang } = useLocalized();
  const { data: projects } = useProjects();
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<Project | null>(null);

  const categories = useMemo(() => {
    const fromData = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
    const merged = Array.from(new Set([...PROJECT_CATEGORIES, ...fromData]));
    return merged.filter((c) => projects.some((p) => p.category === c));
  }, [projects]);

  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="section-pad bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker={t("projects.kicker")} title={t("projects.title")} />

        <Reveal className="mb-8 flex flex-wrap gap-2">
          {[
            { id: "all", label: t("projects.all") },
            ...categories.map((c) => ({
              id: c,
              label: localizedValue(
                projects.find((p) => p.category === c) as Record<string, unknown> | undefined,
                "category",
                lang,
              ) || c,
            })),
          ].map(
            (c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                aria-pressed={filter === c.id}
                className={cn(
                  "min-h-10 rounded-full border px-4 text-sm font-medium transition-all",
                  filter === c.id
                    ? "border-primary bg-primary text-primary-foreground shadow-soft"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {c.label}
              </button>
            ),
          )}
        </Reveal>

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            {t("projects.empty")}
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onOpen={() => setActive(project)}
              />
            ))}
          </ul>
        )}
      </div>

      <ProjectModal project={active} onOpenChange={(v) => !v && setActive(null)} />
    </section>
  );
}

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const { t } = useI18n();
  const { tr } = useLocalized();

  return (
    <Reveal
      as="li"
      delay={index * 70}
      className={cn(project.featured ? "sm:col-span-2 lg:col-span-2" : undefined)}
    >
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-mint/50 hover:shadow-lift">
        <div className="relative aspect-[16/9] overflow-hidden bg-navy">
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={tr(project, "title")}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
          ) : (
            <div className="grid-pattern flex h-full w-full items-center justify-center opacity-90">
              <span className="px-6 text-center font-display text-2xl font-semibold text-navy-foreground/80">
                {tr(project, "title")}
              </span>
            </div>
          )}
          {project.featured ? (
            <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-mint-foreground shadow-soft">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {t("projects.featured")}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {ltr(project, "category")}
          </p>
          <h3 className="mt-2 break-words font-display text-lg font-semibold sm:text-xl">
            {ltr(project, "title")}
          </h3>
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
            {ltr(project, "short_description")}
          </p>


          {project.technologies.length ? (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <li
                  key={tech}
                  className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                >
                  {tech}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {project.live_url ? (
              <Button asChild size="sm" className="min-h-9">
                <a href={externalUrl(project.live_url)!} target="_blank" rel="noreferrer noopener">
                  {t("projects.visit")}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            ) : null}
            <Button size="sm" variant="outline" className="min-h-9" onClick={onOpen}>
              {t("projects.details")}
            </Button>
            {project.github_url ? (
              <Button asChild size="sm" variant="ghost" className="min-h-9">
                <a href={externalUrl(project.github_url)!} target="_blank" rel="noreferrer noopener">
                  <Github className="h-4 w-4" aria-hidden="true" />
                  {t("projects.github")}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function ProjectModal({
  project,
  onOpenChange,
}: {
  project: Project | null;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useI18n();
  const { tr } = useLocalized();
  if (!project) return null;

  return (
    <Dialog open={!!project} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[calc(100vw-1.5rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="break-words text-xl sm:text-2xl">{tr(project, "title")}</DialogTitle>
          <DialogDescription>{tr(project, "category")}</DialogDescription>
        </DialogHeader>

        {project.image_url ? (
          <img
            src={project.image_url}
            alt={tr(project, "title")}
            loading="lazy"
            className="w-full rounded-xl border border-border object-cover"
          />
        ) : null}

        <div className="space-y-5 text-sm leading-relaxed">
          <Block title={t("projects.overview")}>
            {tr(project, "full_description") || tr(project, "short_description") || t("projects.tbd")}
          </Block>
          <Block title={t("projects.problem")}>{tr(project, "problem") || t("projects.tbd")}</Block>
          <Block title={t("projects.solution")}>{tr(project, "solution") || t("projects.tbd")}</Block>
          <Block title={t("projects.features")}>{tr(project, "features") || t("projects.tbd")}</Block>


          {project.technologies.length ? (
            <div>
              <h4 className="mb-2 font-display text-sm font-semibold">{t("projects.tech")}</h4>
              <ul className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-2">
            {project.live_url ? (
              <Button asChild>
                <a href={externalUrl(project.live_url)!} target="_blank" rel="noreferrer noopener">
                  {t("projects.visit")}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            ) : null}
            {project.github_url ? (
              <Button asChild variant="outline">
                <a href={externalUrl(project.github_url)!} target="_blank" rel="noreferrer noopener">
                  <Github className="h-4 w-4" aria-hidden="true" />
                  {t("projects.github")}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1 font-display text-sm font-semibold">{title}</h4>
      <p className="whitespace-pre-line break-words text-muted-foreground">{children}</p>
    </div>
  );
}
