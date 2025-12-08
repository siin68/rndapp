import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkJoinRequests() {
  const eventId = 13; // Event ID to check

  console.log(`\n🔍 Checking join requests for event ${eventId}...\n`);

  // Get event details
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      host: { select: { id: true, name: true } },
    },
  });

  if (!event) {
    console.log('❌ Event not found');
    return;
  }

  console.log(`📅 Event: "${event.title}"`);
  console.log(`👤 Host: ${event.host.name} (ID: ${event.host.id})`);

  // Get all join requests
  const allRequests = await prisma.eventJoinRequest.findMany({
    where: { eventId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📊 Total join requests: ${allRequests.length}`);

  if (allRequests.length === 0) {
    console.log('   No join requests found for this event.');
  } else {
    console.log('\n📋 Join Requests:');
    allRequests.forEach((req, idx) => {
      console.log(`   ${idx + 1}. ${req.user.name} (ID: ${req.user.id})`);
      console.log(`      Status: ${req.status}`);
      console.log(`      Message: ${req.message || 'N/A'}`);
      console.log(`      Created: ${req.createdAt}`);
      console.log('');
    });

    // Count by status
    const pending = allRequests.filter(r => r.status === 'PENDING').length;
    const accepted = allRequests.filter(r => r.status === 'ACCEPTED').length;
    const rejected = allRequests.filter(r => r.status === 'REJECTED').length;

    console.log('\n📈 Status Summary:');
    console.log(`   ⏳ PENDING: ${pending}`);
    console.log(`   ✅ ACCEPTED: ${accepted}`);
    console.log(`   ❌ REJECTED: ${rejected}`);
  }

  // Get participants
  const participants = await prisma.eventParticipant.findMany({
    where: { eventId },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  console.log(`\n👥 Current Participants: ${participants.length}`);
  participants.forEach((p, idx) => {
    console.log(`   ${idx + 1}. ${p.user.name} (Status: ${p.status})`);
  });
}

checkJoinRequests()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
