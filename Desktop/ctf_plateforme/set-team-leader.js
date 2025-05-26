const { prisma } = require('./src/lib/prisma');

async function main() {
  const user = await prisma.user.findFirst({ where: { name: 'kileni' } });
  if (!user) {
    console.error('User "kileni" not found.');
    process.exit(1);
  }

  const team = await prisma.team.findFirst({ where: { name: 'SHINIGAMIS' } });
  if (!team) {
    console.error('Team "SHINIGAMIS" not found.');
    process.exit(1);
  }

  await prisma.team.update({
    where: { id: team.id },
    data: { leaderId: user.id },
  });

  console.log(`Set leader of team '${team.name}' to user '${user.name}' (id: ${user.id})`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); }); 