import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Education } from "@/components/site/education";
import { Experience } from "@/components/site/experience";
import { Skills } from "@/components/site/skills";
import { Projects } from "@/components/site/projects";
import { Journey } from "@/components/site/journey";
import { Contact } from "@/components/site/contact";
import { FinalCta, Footer } from "@/components/site/footer";

const TITLE = "Mohamed Dah Agove | Banque & Assurance Student & Software Developer";
const DESCRIPTION =
  "Mohamed Dah Agove – Third-year Banque et Assurance student at ISCAE and Software Developer building digital solutions in finance, education and enterprise management.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Mohamed Dah Agove",
          jobTitle: "Banque & Assurance Student · Software Developer",
          description: DESCRIPTION,
          alumniOf:
            "Institut Supérieur de Comptabilité et d'Administration des Entreprises (ISCAE)",
          address: { "@type": "PostalAddress", addressCountry: "MR" },
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Education />
        <Experience />
        <Skills />
        <Projects />
        <Journey />
        <Contact />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
