import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, "schema.prisma"), "utf8");

const sqliteSchema = source
  .replace(
    'provider = "postgresql"',
    'provider = "sqlite"'
  )
  .replace(
    'provider = "prisma-client-js"',
    'provider = "prisma-client-js"\n  output   = "./generated/prisma"'
  );

writeFileSync(join(__dirname, "schema.sqlite.prisma"), sqliteSchema);
console.log("Synced schema.sqlite.prisma from schema.prisma");
