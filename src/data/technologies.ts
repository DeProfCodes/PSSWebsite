import { legacyImage } from "@/lib/assets";
import type { Technology, TechnologyCategory } from "@/types/content";

/**
 * Technology list from the legacy Services page ("Our Technologies", audit §3.4),
 * in the legacy display order. Names use each product's official capitalisation
 * (legacy labels: "JAVA", "Jquery", "Restful API", "Github").
 *
 * Logos: legacy files are listed for traceability, but third-party logos should
 * be re-sourced from each vendor's official brand kit (audit §6.7).
 */
function tech(
  id: string,
  name: string,
  category: TechnologyCategory,
  legacyLogoFile: string,
): Technology {
  return {
    id,
    name,
    category,
    logo: legacyImage(
      `/images/technologies/${id}.${legacyLogoFile.split(".").pop()}`,
      `images/tech/${legacyLogoFile}`,
      `${name} logo`,
    ),
  };
}

export const technologies: Technology[] = [
  tech("csharp", "C#", "language", "c.svg"),
  tech("aspnet", "ASP.NET", "framework", "dotnet.png"),
  tech("xamarin", "Xamarin", "mobile", "xamarin.svg"),
  tech("android", "Android", "mobile", "android-studio.svg"),
  tech("php", "PHP", "language", "php.png"),
  tech("java", "Java", "language", "java.svg"),
  tech("python", "Python", "language", "python.png"),
  tech("html", "HTML", "language", "html5.svg"),
  tech("javascript", "JavaScript", "language", "js.png"),
  tech("css", "CSS", "language", "css.png"),
  tech("bootstrap", "Bootstrap", "framework", "bootstrap.svg"),
  tech("jquery", "jQuery", "framework", "jquery.svg"),
  tech("angular", "Angular", "framework", "angular.svg"),
  tech("react", "React", "framework", "react.png"),
  tech("rest-api", "RESTful API", "api", "rest-api.svg"),
  tech("ms-sql", "MS SQL", "database", "ms-sql.svg"),
  tech("docker", "Docker", "cloud-devops", "docker.svg"),
  tech("google-cloud", "Google Cloud", "cloud-devops", "gcp.png"),
  tech("azure-devops", "Azure DevOps", "cloud-devops", "azureDevOps.png"),
  tech("git", "Git", "tooling", "git.svg"),
  tech("github", "GitHub", "tooling", "github.svg"),
  tech("figma", "Figma", "design", "figma.png"),
  tech("adobe-xd", "Adobe XD", "design", "adobeXD.png"),
  tech("canva", "Canva", "design", "canva.svg"),
  tech("tableau", "Tableau", "data", "tableau.png"),
  tech("power-bi", "Power BI", "data", "power BI.png"),
  tech("looker", "Looker", "data", "looker.png"),
  tech("trello", "Trello", "tooling", "trello.png"),
];

/**
 * Public third-party APIs the legacy Projects page listed as integrated
 * ("APIs" section, audit §2.5 / §3.6). Only the Twilio logo rendered on the
 * legacy site; the other three referenced missing .png files (.webp exist).
 */
export const apiIntegrations: Technology[] = [
  {
    id: "monday",
    name: "Monday.com",
    category: "api",
    logo: legacyImage("/images/technologies/monday.webp", "images/monday-api.webp", "Monday.com logo"),
  },
  {
    id: "api-football",
    name: "API-Football",
    category: "api",
    logo: legacyImage(
      "/images/technologies/api-football.webp",
      "images/api-football.webp",
      "API-Football logo",
    ),
  },
  {
    id: "twilio",
    name: "Twilio",
    category: "api",
    logo: legacyImage("/images/technologies/twilio.svg", "images/twilio.svg", "Twilio logo"),
  },
  {
    id: "deriv",
    name: "Deriv",
    category: "api",
    logo: legacyImage("/images/technologies/deriv.webp", "images/derivAPI.webp", "Deriv logo"),
  },
];

/** Legacy intro copy for the API integrations list (verbatim, audit §3.6). */
export const legacyApiIntegrationsIntro =
  "We excel in developing custom APIs using REST APIs tailored to meet specific project requirements. Below are some public APIs we have integrated into our systems:";
