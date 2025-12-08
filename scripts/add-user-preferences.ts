import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addUserPreferences() {
  const userId = 6; // Dat Dang Van

  console.log(`🎯 Adding hobbies and locations for user ${userId}...`);

  // Add hobbies for user 6
  // Hobbies: Reading Books (3), Photography (6), Cooking (7)
  const hobbies = [
    { hobbyId: 3, skillLevel: 'INTERMEDIATE', isPrimary: true },
    { hobbyId: 6, skillLevel: 'BEGINNER', isPrimary: false },
    { hobbyId: 7, skillLevel: 'BEGINNER', isPrimary: false },
  ];

  for (const hobby of hobbies) {
    const existing = await prisma.userHobby.findUnique({
      where: {
        userId_hobbyId: {
          userId,
          hobbyId: hobby.hobbyId,
        },
      },
    });

    if (!existing) {
      await prisma.userHobby.create({
        data: {
          userId,
          hobbyId: hobby.hobbyId,
          skillLevel: hobby.skillLevel,
          isPrimary: hobby.isPrimary,
        },
      });
      console.log(`✅ Added hobby ${hobby.hobbyId} for user ${userId}`);
    } else {
      console.log(`⏭️  User ${userId} already has hobby ${hobby.hobbyId}`);
    }
  }

  // Add locations for user 6
  // Locations: District 1 (4), District 2 (5)
  const locations = [
    { locationId: 4, isPrimary: true },
    { locationId: 5, isPrimary: false },
  ];

  for (const location of locations) {
    const existing = await prisma.userLocation.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId: location.locationId,
        },
      },
    });

    if (!existing) {
      await prisma.userLocation.create({
        data: {
          userId,
          locationId: location.locationId,
          isPrimary: location.isPrimary,
        },
      });
      console.log(`✅ Added location ${location.locationId} for user ${userId}`);
    } else {
      console.log(`⏭️  User ${userId} already has location ${location.locationId}`);
    }
  }

  console.log('\n✅ User preferences added successfully!');
  
  // Verify
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      hobbies: {
        include: { hobby: true },
      },
      locations: {
        include: { location: { include: { city: true } } },
      },
    },
  });

  console.log('\n📊 User profile:');
  console.log(`   Name: ${user?.name}`);
  console.log(`   Hobbies: ${user?.hobbies.map(h => h.hobby.name).join(', ')}`);
  console.log(`   Locations: ${user?.locations.map(l => `${l.location.name}, ${l.location.city.name}`).join('; ')}`);
}

addUserPreferences()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
