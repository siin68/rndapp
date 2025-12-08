import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFetchRequests() {
  const eventId = 12;
  const hostUserId = 6;

  console.log(`\n🧪 Testing API logic for event ${eventId}...\n`);

  // Simulate API logic
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { hostId: true, title: true },
  });

  console.log(`📅 Event: "${event?.title}"`);
  console.log(`   Host ID: ${event?.hostId}`);
  console.log(`   User ID: ${hostUserId}`);
  console.log(`   Is Host: ${event?.hostId === hostUserId ? 'YES ✅' : 'NO ❌'}`);

  if (event?.hostId !== hostUserId) {
    console.log('\n❌ User is not the host - API would return 403');
    return;
  }

  // Get pending requests
  const requests = await prisma.eventJoinRequest.findMany({
    where: {
      eventId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`\n✅ API would return ${requests.length} pending requests:\n`);

  requests.forEach((req, idx) => {
    console.log(`   ${idx + 1}. Request ID: ${req.id}`);
    console.log(`      User: ${req.user.name} (ID: ${req.user.id})`);
    console.log(`      Message: ${req.message || 'N/A'}`);
    console.log(`      Created: ${req.createdAt}`);
    console.log('');
  });

  if (requests.length === 0) {
    console.log('   ⚠️  No PENDING requests found!');
    
    // Check if there are any requests at all
    const allRequests = await prisma.eventJoinRequest.findMany({
      where: { eventId },
    });
    
    if (allRequests.length > 0) {
      console.log(`\n   ℹ️  Found ${allRequests.length} total requests (not PENDING):`);
      allRequests.forEach(r => {
        console.log(`      - ID ${r.id}: Status = ${r.status}`);
      });
    }
  }
}

testFetchRequests()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
