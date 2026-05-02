/**
 * Change l'email du compte admin sur la base de production.
 * Usage: node scripts/update-admin-email.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OLD_EMAIL = "admin@eleo.local";
const NEW_EMAIL = "eleo.informatique@gmail.com";

try {
  const existing = await prisma.user.findUnique({ where: { email: OLD_EMAIL } });
  if (!existing) {
    console.log(`Aucun user trouve avec email ${OLD_EMAIL}. Peut-etre deja migre.`);
    const already = await prisma.user.findUnique({ where: { email: NEW_EMAIL } });
    if (already) console.log(`  ${NEW_EMAIL} existe deja (id: ${already.id}, role: ${already.role})`);
    process.exit(0);
  }

  // Verifier qu'aucun autre user n'a deja cet email
  const conflict = await prisma.user.findUnique({ where: { email: NEW_EMAIL } });
  if (conflict && conflict.id !== existing.id) {
    console.log(`CONFLIT : ${NEW_EMAIL} est deja pris par un autre user (id: ${conflict.id}, role: ${conflict.role})`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email: OLD_EMAIL },
    data: { email: NEW_EMAIL },
  });

  console.log(`Email admin mis a jour :`);
  console.log(`  id         : ${updated.id}`);
  console.log(`  ancien     : ${OLD_EMAIL}`);
  console.log(`  nouveau    : ${updated.email}`);
  console.log(`  role       : ${updated.role}`);
  console.log(``);
  console.log(`Mot de passe inchange : ChangeMe123! (a changer apres connexion)`);
} catch (e) {
  console.error("Erreur:", e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
