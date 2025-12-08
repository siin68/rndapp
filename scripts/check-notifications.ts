import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNotifications() {
  const userId = 6; // Host user ID

  console.log(`\n🔔 Checking recent notifications for user ${userId}...\n`);

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`📊 Recent ${notifications.length} notifications:\n`);

  notifications.forEach((notif, idx) => {
    console.log(`${idx + 1}. ${notif.type}`);
    console.log(`   Title: ${notif.title}`);
    console.log(`   Message: ${notif.message}`);
    console.log(`   Data: ${notif.data}`);
    console.log(`   Created: ${notif.createdAt}`);
    console.log('');
  });

  // Check for EVENT_JOIN_REQUEST type
  const joinRequestNotifs = notifications.filter(n => n.type === 'EVENT_JOIN_REQUEST');
  console.log(`\n🙋 Join Request Notifications: ${joinRequestNotifs.length}`);
}

checkNotifications()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
