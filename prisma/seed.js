const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("🌱 Starting database seed...\n");

    // Read exported data
    const dataPath = path.join(process.cwd(), "database-export.json");
    if (!fs.existsSync(dataPath)) {
      throw new Error(
        "❌ database-export.json not found. Run export-data.js first!"
      );
    }

    const exportedData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    console.log("📊 Data to seed:");
    Object.entries(exportedData).forEach(([table, records]) => {
      console.log(`  ${table}: ${records.length} records`);
    });

    await prisma.blockedUser.deleteMany();
    await prisma.report.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.friendship.deleteMany();
    await prisma.friendRequest.deleteMany();
    await prisma.message.deleteMany();
    await prisma.chatParticipant.deleteMany();
    await prisma.chat.deleteMany();
    await prisma.eventInvitation.deleteMany();
    await prisma.eventParticipant.deleteMany();
    await prisma.event.deleteMany();
    await prisma.userLocation.deleteMany();
    await prisma.userHobby.deleteMany();
    await prisma.location.deleteMany();
    await prisma.city.deleteMany();
    await prisma.hobby.deleteMany();
    await prisma.user.deleteMany();
    console.log("✅ Cleared existing data\n");

    // Seed data in dependency order

    // 1. Independent tables first
    console.log("🏙️ Seeding cities...");
    for (const city of exportedData.cities) {
      await prisma.city.create({
        data: {
          id: city.id,
          name: city.name,
          nameVi: city.nameVi,
          country: city.country,
          timezone: city.timezone,
          isActive: city.isActive,
        },
      });
    }

    console.log("🎯 Seeding hobbies...");
    for (const hobby of exportedData.hobbies) {
      await prisma.hobby.create({
        data: {
          id: hobby.id,
          name: hobby.name,
          nameVi: hobby.nameVi,
          category: hobby.category,
          icon: hobby.icon,
          description: hobby.description,
          isActive: hobby.isActive,
          createdAt: new Date(hobby.createdAt),
        },
      });
    }

    console.log("📍 Seeding locations...");
    for (const location of exportedData.locations) {
      await prisma.location.create({
        data: {
          id: location.id,
          name: location.name,
          nameVi: location.nameVi,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          cityId: location.cityId,
          isActive: location.isActive,
          createdAt: new Date(location.createdAt),
        },
      });
    }

    console.log("👥 Seeding users...");
    for (const user of exportedData.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified
            ? new Date(user.emailVerified)
            : null,
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
    }

    console.log("🎉 Seeding events...");
    for (const event of exportedData.events) {
      await prisma.event.create({
        data: {
          id: event.id,
          title: event.title,
          description: event.description,
          image: event.image,
          hostId: event.hostId,
          hobbyId: event.hobbyId,
          locationId: event.locationId,
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
    }

    // 2. Relationship tables
    console.log("🔗 Seeding user hobbies...");
    for (const userHobby of exportedData.userHobbies) {
      await prisma.userHobby.create({
        data: {
          id: userHobby.id,
          userId: userHobby.userId,
          hobbyId: userHobby.hobbyId,
          skillLevel: userHobby.skillLevel,
          isPrimary: userHobby.isPrimary,
          createdAt: new Date(userHobby.createdAt),
        },
      });
    }

    console.log("🗺️ Seeding user locations...");
    for (const userLocation of exportedData.userLocations) {
      await prisma.userLocation.create({
        data: {
          id: userLocation.id,
          userId: userLocation.userId,
          locationId: userLocation.locationId,
          isPrimary: userLocation.isPrimary,
          createdAt: new Date(userLocation.createdAt),
        },
      });
    }

    console.log("🎪 Seeding event participants...");
    for (const participant of exportedData.eventParticipants) {
      await prisma.eventParticipant.create({
        data: {
          id: participant.id,
          eventId: participant.eventId,
          userId: participant.userId,
          status: participant.status,
          joinedAt: new Date(participant.joinedAt),
          leftAt: participant.leftAt ? new Date(participant.leftAt) : null,
        },
      });
    }

    console.log("💬 Seeding chats...");
    for (const chat of exportedData.chats) {
      await prisma.chat.create({
        data: {
          id: chat.id,
          name: chat.name,
          type: chat.type,
          eventId: chat.eventId,
          isActive: chat.isActive,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
        },
      });
    }

    console.log("👥 Seeding chat participants...");
    for (const participant of exportedData.chatParticipants) {
      await prisma.chatParticipant.create({
        data: {
          id: participant.id,
          chatId: participant.chatId,
          userId: participant.userId,
          role: participant.role,
          joinedAt: new Date(participant.joinedAt),
          leftAt: participant.leftAt ? new Date(participant.leftAt) : null,
        },
      });
    }

    console.log("📨 Seeding messages...");
    for (const message of exportedData.messages) {
      await prisma.message.create({
        data: {
          id: message.id,
          chatId: message.chatId,
          senderId: message.senderId,
          content: message.content,
          type: message.type,
          isEdited: message.isEdited,
          sentAt: new Date(message.sentAt),
          editedAt: message.editedAt ? new Date(message.editedAt) : null,
        },
      });
    }

    console.log("🔔 Seeding notifications...");
    for (const notification of exportedData.notifications) {
      await prisma.notification.create({
        data: {
          id: notification.id,
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          isRead: notification.isRead,
          createdAt: new Date(notification.createdAt),
        },
      });
    }

    console.log("\n✅ Database seeding completed successfully!");
    console.log("🎯 All your data has been restored!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
