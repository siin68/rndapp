const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log("🔍 Exporting all database data...\n");

    const data = {
      users: await prisma.user.findMany(),
      hobbies: await prisma.hobby.findMany(),
      cities: await prisma.city.findMany(),
      locations: await prisma.location.findMany(),
      events: await prisma.event.findMany(),
      userHobbies: await prisma.userHobby.findMany(),
      userLocations: await prisma.userLocation.findMany(),
      eventParticipants: await prisma.eventParticipant.findMany(),
      eventInvitations: await prisma.eventInvitation.findMany(),
      chats: await prisma.chat.findMany(),
      chatParticipants: await prisma.chatParticipant.findMany(),
      messages: await prisma.message.findMany(),
      friendRequests: await prisma.friendRequest.findMany(),
      friendships: await prisma.friendship.findMany(),
      reviews: await prisma.review.findMany(),
      notifications: await prisma.notification.findMany(),
      reports: await prisma.report.findMany(),
      blockedUsers: await prisma.blockedUser.findMany(),
    };

    console.log("📊 Data counts:");
    Object.entries(data).forEach(([table, records]) => {
      console.log(`  ${table}: ${records.length} records`);
    });

    // Write to file
    const exportPath = path.join(process.cwd(), "database-export.json");
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));

    console.log(`\n✅ Data exported to: ${exportPath}`);
    console.log(
      `📁 File size: ${(fs.statSync(exportPath).size / 1024).toFixed(2)} KB`
    );
  } catch (error) {
    console.error("❌ Export failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
