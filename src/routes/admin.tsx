import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import {
  Briefcase,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  Menu,
  Moon,
  Settings,
  Sun,
  Images,
  Languages,
  Type,
  User,
  Wrench,
  BarChart3,
  DownloadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme";
import { CrudManager } from "@/components/admin/crud-manager";
import { ProfileEditor } from "@/components/admin/profile-editor";
import { MessagesManager } from "@/components/admin/messages-manager";
import { MediaManager } from "@/components/admin/media-picker";
import { TranslationsManager } from "@/components/admin/translations-manager";
import { DeveloperLogin } from "@/components/site/developer-login";
import { useI18n, type Lang } from "@/lib/i18n";
import { importDefaultContent } from "@/lib/seed-content";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CONTENT_LANGS, localizedValue } from "@/lib/localized";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard | Mohamed Dah Agove" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Private dashboard." },
    ],
  }),
  component: AdminPage,
});

type SectionId =
  | "dashboard"
  | "profile"
  | "education"
  | "experience"
  | "skills"
  | "projects"
  | "social"
  | "stats"
  | "messages"
  | "media"
  | "texts"
  | "settings";

const NAV: { id: SectionId; labelKey: string; Icon: typeof User }[] = [
  { id: "dashboard", labelKey: "admin.dashboard", Icon: LayoutDashboard },
  { id: "profile", labelKey: "admin.profile", Icon: User },
  { id: "education", labelKey: "admin.education", Icon: GraduationCap },
  { id: "experience", labelKey: "admin.experience", Icon: Briefcase },
  { id: "skills", labelKey: "admin.skills", Icon: Wrench },
  { id: "projects", labelKey: "admin.projects", Icon: FolderKanban },
  { id: "social", labelKey: "admin.social", Icon: Link2 },
  { id: "stats", labelKey: "admin.stats", Icon: BarChart3 },
  { id: "media", labelKey: "admin.media", Icon: Images },
  { id: "texts", labelKey: "admin.texts", Icon: Type },
  { id: "messages", labelKey: "admin.messages", Icon: Mail },
  { id: "settings", labelKey: "admin.settings", Icon: Settings },
];

function AdminPage() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { t, lang, setLang } = useI18n();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);
  const [section, setSection] = useState<SectionId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecked(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!checked) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 p-8">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!session) {
    return <LockedScreen />;
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label={t("admin.cancel")}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 w-[82vw] max-w-72 shrink-0 overflow-y-auto border-e border-sidebar-border bg-sidebar p-4 text-sidebar-foreground transition-transform duration-200 lg:static lg:w-64 lg:translate-x-0",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full lg:translate-x-0 rtl:lg:translate-x-0",
        )}
      >
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
            MDA
          </span>
          <span className="truncate font-display text-sm font-semibold">{t("admin.title")}</span>
        </div>
        <nav aria-label="Dashboard">
          <ul className="space-y-1">
            {NAV.map(({ id, labelKey, Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => {
                    setSection(id);
                    setSidebarOpen(false);
                  }}
                  aria-current={section === id ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors",
                    section === id
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{t(labelKey)}</span>
                </button>
              </li>
            ))}
            <li className="pt-2">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm text-sidebar-foreground/70 transition-colors hover:bg-destructive/20 hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{t("admin.logout")}</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border-b border-border bg-background/90 px-3 py-2 backdrop-blur sm:px-4 lg:flex lg:h-14 lg:justify-between lg:py-0">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {session.user.email}
            </p>
          </div>
          <div className="col-span-2 flex flex-wrap items-center justify-end gap-2 lg:col-span-1">
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div
              className="flex shrink-0 items-center gap-1 rounded-lg border border-border p-0.5"
              role="group"
              aria-label={t("admin.language")}
            >
              <Languages
                className="mx-1 hidden h-4 w-4 text-muted-foreground sm:block"
                aria-hidden="true"
              />
              {CONTENT_LANGS.map((l: Lang) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium uppercase transition-colors",
                    lang === l
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/" })}>
              {t("admin.viewSite")}
            </Button>
          </div>
        </header>

        <main className="p-3 sm:p-6 lg:p-8">
          <AdminSection section={section} onNavigate={setSection} />
        </main>
      </div>
    </div>
  );
}

function LockedScreen() {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-semibold">{t("admin.restricted")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("admin.restrictedSub")}</p>
        <Button className="mt-6" onClick={() => setOpen(true)}>
          {t("admin.signin")}
        </Button>
      </div>
      <DeveloperLogin open={open} onOpenChange={setOpen} />
    </div>
  );
}

function AdminSection({
  section,
  onNavigate,
}: {
  section: SectionId;
  onNavigate: (s: SectionId) => void;
}) {
  switch (section) {
    case "profile":
      return <ProfileEditor />;
    case "education":
      return (
        <CrudManager
          table="education"
          title="Education"
          primaryField="institution"
          secondaryField="degree"
          fields={[
            { name: "institution", label: "Institution", required: true , i18n: true },
            { name: "degree", label: "Degree", required: true , i18n: true },
            { name: "field", label: "Field" , i18n: true },
            { name: "level", label: "Academic Level", i18n: true, placeholder: "Third Year / 3ème année / السنة الثالثة" },
            { name: "description", label: "Description", type: "textarea" , i18n: true },
            { name: "start_year", label: "Start Year", type: "number" },
            { name: "end_year", label: "End Year", type: "number" },
            { name: "start_date", label: "Start Date (optional, overrides year)", type: "date" },
            { name: "end_date", label: "End Date (optional, overrides year)", type: "date" },
            { name: "current", label: "Current", type: "bool" },
            { name: "location", label: "Location" , i18n: true },
            { name: "sort_order", label: "Sort Order", type: "number" },
          ]}
        />
      );
    case "experience":
      return (
        <CrudManager
          table="experience"
          title="Experience"
          primaryField="organization"
          secondaryField="position"
          fields={[
            { name: "organization", label: "Organization", required: true , i18n: true },
            { name: "position", label: "Position", required: true , i18n: true },
            { name: "department", label: "Department" , i18n: true },
            { name: "description", label: "Description", type: "textarea" , i18n: true },
            { name: "start_date", label: "Start Date", type: "date" },
            { name: "end_date", label: "End Date", type: "date" },
            { name: "current", label: "Current", type: "bool" },
            { name: "location", label: "Location" , i18n: true },
            { name: "sort_order", label: "Sort Order", type: "number" },
          ]}
        />
      );
    case "skills":
      return (
        <CrudManager
          table="skills"
          title="Skills"
          primaryField="name"
          secondaryField="category"
          fields={[
            { name: "name", label: "Name", required: true , i18n: true },
            {
              name: "category",
              label: "Category",
              i18n: true,
              required: true,
              placeholder: "Banking & Finance | Development | Database & Backend | Tools",
            },
            { name: "level", label: "Level (0-100)", type: "number" },
            { name: "icon", label: "Icon" },
            { name: "sort_order", label: "Sort Order", type: "number" },
          ]}
        />
      );
    case "projects":
      return (
        <CrudManager
          table="projects"
          title="Projects"
          primaryField="title"
          secondaryField="category"
          fields={[
            { name: "title", label: "Project Name", required: true , i18n: true },
            { name: "slug", label: "Slug", required: true },
            { name: "short_description", label: "Short Description" , i18n: true },
            { name: "full_description", label: "Overview (full description)", type: "textarea" , i18n: true },
            { name: "problem", label: "Problem", type: "textarea", i18n: true },
            { name: "solution", label: "Solution", type: "textarea", i18n: true },
            { name: "features", label: "Features", type: "textarea", i18n: true },
            {
              name: "category",
              label: "Category",
              i18n: true,
              placeholder: "Web Development | Education | Management | Finance | Student Projects",
            },
            { name: "technologies", label: "Technologies (comma separated)", type: "tags" },
            { name: "live_url", label: "Live Demo URL" },
            { name: "github_url", label: "GitHub URL" },
            { name: "image_url", label: "Project Image", type: "image" },
            { name: "featured", label: "Featured", type: "bool" },
            { name: "sort_order", label: "Sort Order", type: "number" },
          ]}
        />
      );
    case "social":
      return (
        <CrudManager
          table="social_links"
          title="Social Links"
          primaryField="platform"
          secondaryField="url"
          fields={[
            { name: "platform", label: "Platform", required: true , i18n: true },
            { name: "url", label: "URL", required: true },
            { name: "icon", label: "Icon" },
            { name: "enabled", label: "Enabled", type: "bool" },
            { name: "sort_order", label: "Sort Order", type: "number" },
          ]}
        />
      );
    case "stats":
      return (
        <CrudManager
          table="stats"
          title="Statistics"
          primaryField="value"
          secondaryField="label"
          fields={[
            { name: "value", label: "Value", required: true, placeholder: "5+" },
            { name: "label", label: "Label", required: true, i18n: true },
            { name: "sort_order", label: "Sort Order", type: "number" },
          ]}
        />
      );
    case "media":
      return <MediaManager />;
    case "texts":
      return <TranslationsManager />;
    case "messages":
      return <MessagesManager />;
    case "settings":
      return (
        <CrudManager
          table="site_settings"
          title="Site Settings"
          primaryField="site_title"
          secondaryField="site_description"
          orderBy="id"
          fields={[
            { name: "site_title", label: "Site Title", required: true , i18n: true },
            { name: "site_description", label: "Site Description", type: "textarea" , i18n: true },
            { name: "primary_color", label: "Primary Color" },
            { name: "accent_color", label: "Accent Color" },
            { name: "favicon_url", label: "Favicon", type: "image" },
          ]}
        />
      );
    default:
      return <Overview onNavigate={onNavigate} />;
  }
}

function useCount(table: string) {
  return useQuery({
    queryKey: ["admin", "count", table],
    queryFn: async () => {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function Overview({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  const { t, lang } = useI18n();
  const projects = useCount("projects");
  const skills = useCount("skills");
  const experience = useCount("experience");
  const messages = useCount("messages");

  const latest = useQuery({
    queryKey: ["admin", "latest-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as Record<string, unknown>[];
    },
  });

  const cards = [
    { label: t("admin.projects"), q: projects },
    { label: t("admin.skills"), q: skills },
    { label: t("admin.experience"), q: experience },
    { label: t("admin.messages"), q: messages },
  ];

  return (
    <section>
      <h1 className="break-words text-xl font-semibold sm:text-2xl">{t("admin.welcome")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("admin.welcomeSub")}</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, q }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-2 font-display text-3xl font-semibold">
              {q.isLoading ? <Skeleton className="h-8 w-12" /> : q.isError ? "—" : q.data}
            </dd>
          </div>
        ))}
      </dl>

      <ImportDefaults />

      <div className="mt-8 rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="min-w-0 break-words text-lg font-semibold">{t("admin.latestProjects")}</h2>
          <Button variant="outline" size="sm" onClick={() => onNavigate("projects")}>
            {t("admin.manage")}
          </Button>
        </div>
        {latest.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : !latest.data || latest.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("admin.noProjects")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {latest.data.map((p) => (
              <li
                key={String(p["id"])}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5 text-sm"
              >
                <span className="truncate">{localizedValue(p, "title", lang)}</span>
                <span className="truncate text-muted-foreground">
                  {localizedValue(p, "category", lang)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/**
 * Turns the site's built-in default content (shown while a table is still
 * empty) into real database rows so it becomes fully editable here.
 */
function ImportDefaults() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const run = useMutation({
    mutationFn: importDefaultContent,
    onSuccess: (report) => {
      const added = Object.entries(report).filter(([, n]) => n > 0);
      toast.success(
        added.length === 0
          ? t("admin.import.upToDate")
          : `${t("admin.import.done")}: ${added.map(([k, n]) => `${k} (${n})`).join(", ")}`,
      );
      void queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-8 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-semibold">{t("admin.import.title")}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("admin.import.desc")}</p>
        </div>
        <Button onClick={() => run.mutate()} disabled={run.isPending} className="shrink-0">
          <DownloadCloud className="h-4 w-4" />
          {run.isPending ? t("admin.import.running") : t("admin.import.button")}
        </Button>
      </div>
    </div>
  );
}
