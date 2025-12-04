import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding test events...');

    // Get existing users, hobbies and locations for reference
    const users = await prisma.user.findMany();
    const hobbies = await prisma.hobby.findMany();
    const locations = await prisma.location.findMany();

    if (users.length === 0 || hobbies.length === 0 || locations.length === 0) {
      console.log('⚠️  Need users, hobbies, and locations to seed events');
      return;
    }

    // Create test events
    const testEvents = [
      {
        title: "Coffee & Code Session",
        description: "Join us for a relaxed morning of coding and coffee! Perfect for all skill levels. Bring your laptop and let's work on some fun projects together.",
        image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=600&fit=crop&crop=center",
        hostId: users[0]?.id,
        hobbyId: hobbies.find(h => h.name.includes('Programming') || h.name.includes('Technology'))?.id || hobbies[0]?.id,
        locationId: locations[0]?.id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 180, // 3 hours
        maxParticipants: 8,
        minParticipants: 3,
        status: "OPEN",
        isPrivate: false,
        requiresApproval: false,
      },
      {
        title: "Weekend Football Match",
        description: "Friendly football match in the park! All skill levels welcome. We'll split into teams and play a few rounds. Don't forget to bring water!",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop&crop=center",
        hostId: users[1]?.id || users[0]?.id,
        hobbyId: hobbies.find(h => h.name.includes('Football') || h.name.includes('Sport'))?.id || hobbies[1]?.id || hobbies[0]?.id,
        locationId: locations[1]?.id || locations[0]?.id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
        duration: 120, // 2 hours
        maxParticipants: 12,
        minParticipants: 6,
        status: "OPEN",
        isPrivate: false,
        requiresApproval: false,
      },
      {
        title: "Photography Walk Downtown",
        description: "Let's explore the city through our lenses! We'll walk through the historic downtown area and capture some amazing shots. Perfect for beginners and pros alike.",
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop&crop=center",
        hostId: users[2]?.id || users[0]?.id,
        hobbyId: hobbies.find(h => h.name.includes('Photography') || h.name.includes('Art'))?.id || hobbies[2]?.id || hobbies[0]?.id,
        locationId: locations[2]?.id || locations[0]?.id,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
        duration: 240, // 4 hours
        maxParticipants: 6,
        minParticipants: 2,
        status: "OPEN",
        isPrivate: false,
        requiresApproval: false,
      },
      {
        title: "Board Game Night",
        description: "Join us for an evening of fun board games! We have a great selection including strategy games, party games, and classics. Snacks and drinks provided!",
        image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop&crop=center",
        hostId: users[3]?.id || users[0]?.id,
        hobbyId: hobbies.find(h => h.name.includes('Gaming') || h.name.includes('Game'))?.id || hobbies[3]?.id || hobbies[0]?.id,
        locationId: locations[3]?.id || locations[0]?.id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 1 week
        duration: 240, // 4 hours
        maxParticipants: 10,
        minParticipants: 4,
        status: "OPEN",
        isPrivate: false,
        requiresApproval: false,
      },
      {
        title: "Cooking Workshop: Vietnamese Pho",
        description: "Learn to make authentic Vietnamese Pho from scratch! We'll cover everything from preparing the broth to assembling the perfect bowl. All ingredients provided.",
        image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&h=600&fit=crop&crop=center",
        hostId: users[4]?.id || users[0]?.id,
        hobbyId: hobbies.find(h => h.name.includes('Cooking') || h.name.includes('Food'))?.id || hobbies[4]?.id || hobbies[0]?.id,
        locationId: locations[4]?.id || locations[0]?.id,
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // In 10 days
        duration: 180, // 3 hours
        maxParticipants: 8,
        minParticipants: 3,
        status: "OPEN",
        isPrivate: false,
        requiresApproval: false,
      },
      {
        title: "Morning Yoga in the Park",
        description: "Start your day with peaceful yoga in nature! Suitable for all levels. Bring your own mat and water bottle. We'll practice gentle flows and breathing exercises.",
        image: "https://images.unsplash.com/photo-1506629905607-41fe0702c602?w=800&h=600&fit=crop&crop=center",
        hostId: users[5]?.id || users[0]?.id,
        hobbyId: hobbies.find(h => h.name.includes('Yoga') || h.name.includes('Fitness'))?.id || hobbies[0]?.id,
        locationId: locations[0]?.id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        duration: 90, // 1.5 hours
        maxParticipants: 15,
        minParticipants: 3,
        status: "OPEN",
        isPrivate: false,
        requiresApproval: false,
      }
    ];

    // Insert events
    const createdEvents = [];
    for (const eventData of testEvents) {
      if (eventData.hostId && eventData.hobbyId && eventData.locationId) {
        const event = await prisma.event.create({
          data: eventData,
          include: {
            host: { select: { id: true, name: true, image: true } },
            hobbies: { include: { hobby: true } },
            location: { include: { city: true } },
            _count: { select: { participants: true } }
          }
        });
        createdEvents.push(event);
        console.log(`✅ Created event: ${event.title}`);
      }
    }

    // Add some participants to make events look active
    for (const event of createdEvents) {
      const availableUsers = users.filter(u => u.id !== event.hostId);
      const participantCount = Math.floor(Math.random() * 3) + 1; // 1-3 participants
      
      for (let i = 0; i < participantCount && i < availableUsers.length; i++) {
        try {
          await prisma.eventParticipant.create({
            data: {
              eventId: event.id,
              userId: availableUsers[i].id,
              status: "JOINED",
            }
          });
        } catch (error) {
          // Ignore duplicate participants
        }
      }
    }

    console.log(`🎉 Successfully seeded ${createdEvents.length} test events!`);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seed();
}

export default seed;