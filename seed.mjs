import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEMPLATES = [
  { slug: "aurora", name: "Aurora", category: "Engineering", description: "A modern engineering layout with a colored sidebar and crisp accent bars — built to make technical skills impossible to miss.", atsScore: 90 },
  { slug: "vector", name: "Vector", category: "ATS-Optimized", description: "Fully monochrome, single-column, machine-readable layout with the highest ATS compatibility.", atsScore: 99 },
  { slug: "nexus", name: "Nexus", category: "Modern", description: "A sleek dark header with gradient accents and badge-style sections — a modern look for technology roles.", atsScore: 88 },
  { slug: "titan", name: "Titan", category: "Corporate", description: "A commanding deep-blue banner with a centered header — built for leadership and senior roles.", atsScore: 92 },
  { slug: "pulse", name: "Pulse", category: "Modern Startup", description: "A bold, centered layout with strong section rules and energetic framing — made for startup and product-minded people.", atsScore: 87 },
  { slug: "circuit", name: "Circuit", category: "Developer", description: "A striking dark header with cyan glows — a modern look for developers and designers.", atsScore: 86 },
  { slug: "scholar", name: "Scholar", category: "Academic", description: "Serif typography and a conservative structure tailored for research, academia, and publications.", atsScore: 93 },
  { slug: "orbit", name: "Orbit", category: "Data Science", description: "Indigo accents with skill bars and a metrics-forward layout for AI, ML, and data roles.", atsScore: 91 },
  { slug: "launch", name: "Launch", category: "Entry Level", description: "A friendly, light layout with rounded badges — ideal for students and internship seekers.", atsScore: 94 },
  { slug: "apex", name: "Apex", category: "Leadership", description: "A polished split layout with navy paneling and refined typography for corporate executives.", atsScore: 89 },
];

async function main() {
  for (const t of TEMPLATES) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: { name: t.name, category: t.category, description: t.description, atsScore: t.atsScore, isActive: true },
      create: { slug: t.slug, name: t.name, category: t.category, description: t.description, atsScore: t.atsScore, isActive: true },
    });
    console.log(`Seeded template: ${t.name}`);
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
