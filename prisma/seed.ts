import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ImportData {
  users: any[];
  hobbies: any[];
  cities: any[];
  locations: any[];
  events: any[];
  userHobbies: any[];
  userLocations: any[];
  eventHobbies: any[];
  friendships: any[];
  chats: any[];
  chatParticipants: any[];
  messages: any[];
}

// Map old string IDs to new int IDs
const idMaps = {
  users: new Map<string, number>(),
  hobbies: new Map<string, number>(),
  cities: new Map<string, number>(),
  locations: new Map<string, number>(),
  events: new Map<string, number>(),
  chats: new Map<string, number>(),
};

async function main() {
  console.log('🌱 Starting database seed...');

  // Read the export file
  const exportPath = path.join(__dirname, '..', 'database-export.json');
  const rawData = fs.readFileSync(exportPath, 'utf-8');
  const data: ImportData = JSON.parse(rawData);

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.message.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.eventHobby.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.eventJoinRequest.deleteMany();
  await prisma.eventInvitation.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userLocation.deleteMany();
  await prisma.userHobby.deleteMany();
  await prisma.location.deleteMany();
  await prisma.city.deleteMany();
  await prisma.hobby.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.friendRequest.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // Import Users
  console.log('👥 Importing users...');
  for (const user of data.users) {
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        image: user.image,
        bio: user.bio,
        age: user.age,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted,
        lastActive: new Date(user.lastActive),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        profileVisibility: user.profileVisibility,
        distanceRadius: user.distanceRadius,
        ageRangeMin: user.ageRangeMin,
        ageRangeMax: user.ageRangeMax,
      },
    });
    idMaps.users.set(user.id, created.id);
  }
  console.log(`✅ Imported ${data.users.length} users`);

  // Import Hobbies
  console.log('🎯 Importing hobbies...');
  for (const hobby of data.hobbies) {
    const created = await prisma.hobby.create({
      data: {
        name: hobby.name,
        nameVi: hobby.nameVi,
        category: hobby.category,
        icon: hobby.icon,
        description: hobby.description,
        isActive: hobby.isActive,
        createdAt: new Date(hobby.createdAt),
      },
    });
    idMaps.hobbies.set(hobby.id, created.id);
  }
  console.log(`✅ Imported ${data.hobbies.length} hobbies`);

  // Import Cities
  console.log('🏙️  Importing cities...');
  for (const city of data.cities) {
    const created = await prisma.city.create({
      data: {
        name: city.name,
        nameVi: city.nameVi,
        country: city.country,
        timezone: city.timezone,
        isActive: city.isActive,
      },
    });
    idMaps.cities.set(city.id, created.id);
  }
  console.log(`✅ Imported ${data.cities.length} cities`);

  // Import Locations
  console.log('📍 Importing locations...');
  for (const location of data.locations) {
    const cityId = idMaps.cities.get(location.cityId);
    if (!cityId) {
      console.warn(`⚠️  Skipping location ${location.name} - city not found`);
      continue;
    }
    
    const created = await prisma.location.create({
      data: {
        name: location.name,
        nameVi: location.nameVi,
        cityId: cityId,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        isActive: location.isActive,
      },
    });
    idMaps.locations.set(location.id, created.id);
  }
  console.log(`✅ Imported ${data.locations.length} locations`);

  // Import Events
  console.log('📅 Importing events...');
  for (const event of data.events) {
    const hostId = idMaps.users.get(event.hostId);
    const locationId = idMaps.locations.get(event.locationId);
    
    if (!hostId || !locationId) {
      console.warn(`⚠️  Skipping event ${event.title} - host or location not found`);
      continue;
    }

    const created = await prisma.event.create({
      data: {
        title: event.title,
        description: event.description,
        image: event.image,
        hostId: hostId,
        locationId: locationId,
        date: new Date(event.date),
        duration: event.duration,
        maxParticipants: event.maxParticipants,
        minParticipants: event.minParticipants,
        price: event.price,
        currency: event.currency,
        status: event.status,
        isPrivate: event.isPrivate,
        requiresApproval: event.requiresApproval,
        ageRestrictionMin: event.ageRestrictionMin,
        ageRestrictionMax: event.ageRestrictionMax,
        genderRestriction: event.genderRestriction,
        tags: event.tags,
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      },
    });
    idMaps.events.set(event.id, created.id);
  }
  console.log(`✅ Imported ${data.events.length} events`);

  // Import EventHobbies (if exists in export)
  if (data.eventHobbies && data.eventHobbies.length > 0) {
    console.log('🔗 Importing event hobbies...');
    for (const eventHobby of data.eventHobbies) {
      const eventId = idMaps.events.get(eventHobby.eventId);
      const hobbyId = idMaps.hobbies.get(eventHobby.hobbyId);
      
      if (!eventId || !hobbyId) continue;

      await prisma.eventHobby.create({
        data: {
          eventId: eventId,
          hobbyId: hobbyId,
          isPrimary: eventHobby.isPrimary,
          createdAt: new Date(eventHobby.createdAt),
        },
      });
    }
    console.log(`✅ Imported ${data.eventHobbies.length} event hobbies`);
  } else {
    // Create event hobbies from old hobbyId field
    console.log('🔗 Creating event hobbies from events...');
    let count = 0;
    for (const event of data.events) {
      const eventId = idMaps.events.get(event.id);
      const hobbyId = idMaps.hobbies.get(event.hobbyId);
      
      if (!eventId || !hobbyId) continue;

      await prisma.eventHobby.create({
        data: {
          eventId: eventId,
          hobbyId: hobbyId,
          isPrimary: true,
        },
      });
      count++;
    }
    console.log(`✅ Created ${count} event hobbies`);
  }

  // Import UserHobbies
  if (data.userHobbies && data.userHobbies.length > 0) {
    console.log('🎨 Importing user hobbies...');
    for (const userHobby of data.userHobbies) {
      const userId = idMaps.users.get(userHobby.userId);
      const hobbyId = idMaps.hobbies.get(userHobby.hobbyId);
      
      if (!userId || !hobbyId) continue;

      await prisma.userHobby.create({
        data: {
          userId: userId,
          hobbyId: hobbyId,
          skillLevel: userHobby.skillLevel,
          isPrimary: userHobby.isPrimary,
          createdAt: new Date(userHobby.createdAt),
        },
      });
    }
    console.log(`✅ Imported ${data.userHobbies.length} user hobbies`);
  }

  // Import UserLocations
  if (data.userLocations && data.userLocations.length > 0) {
    console.log('🗺️  Importing user locations...');
    for (const userLocation of data.userLocations) {
      const userId = idMaps.users.get(userLocation.userId);
      const locationId = idMaps.locations.get(userLocation.locationId);
      
      if (!userId || !locationId) continue;

      await prisma.userLocation.create({
        data: {
          userId: userId,
          locationId: locationId,
          isPrimary: userLocation.isPrimary,
          createdAt: new Date(userLocation.createdAt),
        },
      });
    }
    console.log(`✅ Imported ${data.userLocations.length} user locations`);
  }

  // Import Friendships
  if (data.friendships && data.friendships.length > 0) {
    console.log('👫 Importing friendships...');
    for (const friendship of data.friendships) {
      const user1Id = idMaps.users.get(friendship.user1Id);
      const user2Id = idMaps.users.get(friendship.user2Id);
      
      if (!user1Id || !user2Id) continue;

      await prisma.friendship.create({
        data: {
          user1Id: user1Id,
          user2Id: user2Id,
          createdAt: new Date(friendship.createdAt),
        },
      });
    }
    console.log(`✅ Imported ${data.friendships.length} friendships`);
  }

  // Import Chats
  if (data.chats && data.chats.length > 0) {
    console.log('💬 Importing chats...');
    for (const chat of data.chats) {
      const eventId = chat.eventId ? idMaps.events.get(chat.eventId) : null;

      const created = await prisma.chat.create({
        data: {
          eventId: eventId || undefined,
          type: chat.type,
          name: chat.name,
          isActive: chat.isActive,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
        },
      });
      idMaps.chats.set(chat.id, created.id);
    }
    console.log(`✅ Imported ${data.chats.length} chats`);
  }

  // Import Chat Participants
  if (data.chatParticipants && data.chatParticipants.length > 0) {
    console.log('👥 Importing chat participants...');
    for (const participant of data.chatParticipants) {
      const chatId = idMaps.chats.get(participant.chatId);
      const userId = idMaps.users.get(participant.userId);
      
      if (!chatId || !userId) continue;

      await prisma.chatParticipant.create({
        data: {
          chatId: chatId,
          userId: userId,
          role: participant.role,
          joinedAt: new Date(participant.joinedAt),
          leftAt: participant.leftAt ? new Date(participant.leftAt) : null,
          lastReadAt: new Date(participant.lastReadAt),
        },
      });
    }
    console.log(`✅ Imported ${data.chatParticipants.length} chat participants`);
  }

  // Import Messages
  if (data.messages && data.messages.length > 0) {
    console.log('✉️  Importing messages...');
    for (const message of data.messages) {
      const chatId = idMaps.chats.get(message.chatId);
      const senderId = idMaps.users.get(message.senderId);
      
      if (!chatId || !senderId) continue;

      await prisma.message.create({
        data: {
          chatId: chatId,
          senderId: senderId,
          content: message.content,
          type: message.type,
          attachments: message.attachments,
          replyToId: message.replyToId ? idMaps.chats.get(message.replyToId) : null,
          isEdited: message.isEdited,
          timestamp: new Date(message.timestamp),
          editedAt: message.editedAt ? new Date(message.editedAt) : null,
        },
      });
    }
    console.log(`✅ Imported ${data.messages.length} messages`);
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${idMaps.users.size}`);
  console.log(`   Hobbies: ${idMaps.hobbies.size}`);
  console.log(`   Cities: ${idMaps.cities.size}`);
  console.log(`   Locations: ${idMaps.locations.size}`);
  console.log(`   Events: ${idMaps.events.size}`);
  console.log(`   Chats: ${idMaps.chats.size}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
