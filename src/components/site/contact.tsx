import { useState } from "react";
import { Github, Linkedin, Loader2, Mail, MessageCircle, Send } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal, SectionHeading } from "./section";
import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/portfolio";
import { supabase } from "@/lib/supabase";
import { emailHref, emailLabel, githubUrl, linkedinUrl, whatsappUrl } from "@/lib/links";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(1).max(2000),
});

export function Contact() {
  const { t } = useI18n();
  const { data: profile } = useProfile();
  const [loading, setLoading] = useState(false);

  const channels = [
    { href: emailHref(profile.email), label: emailLabel(profile.email) ?? "Email", Icon: Mail },
    { href: linkedinUrl(profile.linkedin_url), label: "LinkedIn", Icon: Linkedin },
    { href: githubUrl(profile.github_url), label: "GitHub", Icon: Github },
    { href: whatsappUrl(profile.whatsapp_url), label: "WhatsApp", Icon: MessageCircle },
  ].filter((c) => c.href);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("contact.error"));
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("messages").insert(parsed.data as never);
    setLoading(false);
    if (error) {
      toast.error(t("contact.error"));
      return;
    }
    toast.success(t("contact.success"));
    form.reset();
  }

  return (
    <section id="contact" className="section-pad bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker={t("contact.kicker")} title={t("contact.title")} />

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="space-y-4">
            <p className="text-lg text-muted-foreground">{t("contact.intro")}</p>
            <ul className="space-y-2">
              {channels.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href!}
                    target={href!.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="break-all">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contact.name")}</Label>
                  <Input id="name" name="name" required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("contact.email")}</Label>
                  <Input id="email" name="email" type="email" required maxLength={255} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">{t("contact.subject")}</Label>
                <Input id="subject" name="subject" maxLength={150} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t("contact.message")}</Label>
                <Textarea id="message" name="message" required rows={5} maxLength={2000} />
              </div>
              <Button type="submit" size="lg" className="min-h-11 w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {t("contact.send")}
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
