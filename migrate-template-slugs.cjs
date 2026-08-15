const path = require("path");
const { PrismaClient } = require("./generated/prisma/index.js");

const dbFile = path.resolve(__dirname, "./dev.db").replace(/\\/g, "/");
process.env.DATABASE_URL = `file:${dbFile}`;

const prisma = new PrismaClient();

const MAP = [
  { old: "executive-blue", slug: "titan", name: "Titan", category: "Corporate" },
  { old: "minimal-ats", slug: "vector", name: "Vector", category: "ATS-Optimized" },
  { old: "engineering-pro", slug: "aurora", name: "Aurora", category: "Engineering" },
  { old: "tech-modern", slug: "nexus", name: "Nexus", category: "Modern" },
  { old: "corporate-elite", slug: "apex", name: "Apex", category: "Leadership" },
  { old: "developer-dark", slug: "circuit", name: "Circuit", category: "Developer" },
  { old: "academic-research", slug: "scholar", name: "Scholar", category: "Academic" },
  { old: "ai-data", slug: "orbit", name: "Orbit", category: "Data Science" },
  { old: "fresh-graduate", slug: "launch", name: "Launch", category: "Entry Level" },
  { old: "leadership", slug: "pulse", name: "Pulse", category: "Modern Startup" },
];

async function main() {
  for (const m of MAP) {
    const oldRow = await prisma.template.findUnique({ where: { slug: m.old } });
    const newRow = await prisma.template.findUnique({ where: { slug: m.slug } });

    if (!oldRow) {
      console.log(`skip ${m.old} -> ${m.slug} (old row not found)`);
      continue;
    }
    if (newRow) {
      const repointed = await prisma.resume.updateMany({
        where: { templateId: oldRow.id },
        data: { templateId: newRow.id },
      });
      await prisma.template.update({
        where: { id: newRow.id },
        data: { name: m.name, category: m.category },
      });
      await prisma.template.delete({ where: { id: oldRow.id } });
      console.log(`merged ${m.old} -> ${m.slug} (repointed ${repointed.count} resumes)`);
    } else {
      await prisma.template.update({
        where: { id: oldRow.id },
        data: { slug: m.slug, name: m.name, category: m.category },
      });
      console.log(`renamed ${m.old} -> ${m.slug} (id preserved)`);
    }
  }

  const rows = await prisma.template.findMany({
    select: { id: true, slug: true, name: true, category: true },
    orderBy: { slug: "asc" },
  });
  console.log("Templates now:");
  console.log(JSON.stringify(rows, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
