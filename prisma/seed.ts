import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "alice@ajaia.internal" },
    update: {},
    create: { id: "alice-id", email: "alice@ajaia.internal", name: "Alice (Owner)" },
  });

  await prisma.user.upsert({
    where: { email: "bob@ajaia.internal" },
    update: {},
    create: { id: "bob-id", email: "bob@ajaia.internal", name: "Bob (Collaborator)" },
  });
  console.log("Database seeded with Alice and Bob!");
}

main().catch(console.error).finally(() => prisma.$disconnect());