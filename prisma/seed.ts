import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create sample cities
  const hanoi = await prisma.city.upsert({
    where: { name: "Hanoi" },
    update: {},
    create: {
      name: "Hanoi",
      nameVi: "Hà Nội",
      country: "Vietnam",
    },
  });

  const hcmc = await prisma.city.upsert({
    where: { name: "Ho Chi Minh City" },
    update: {},
    create: {
      name: "Ho Chi Minh City",
      nameVi: "TP. Hồ Chí Minh",
      country: "Vietnam",
    },
  });

  // Create sample hobbies
  const hobbies = [
    { name: "Football", nameVi: "Bóng đá", icon: "⚽", category: "SPORTS" },
    { name: "Basketball", nameVi: "Bóng rổ", icon: "🏀", category: "SPORTS" },
    { name: "Reading", nameVi: "Đọc sách", icon: "📚", category: "EDUCATION" },
    { name: "Cooking", nameVi: "Nấu ăn", icon: "🍳", category: "LIFESTYLE" },
    { name: "Photography", nameVi: "Chụp ảnh", icon: "📷", category: "ART" },
    { name: "Hiking", nameVi: "Leo núi", icon: "🥾", category: "OUTDOOR" },
    {
      name: "Gaming",
      nameVi: "Chơi game",
      icon: "🎮",
      category: "ENTERTAINMENT",
    },
    { name: "Music", nameVi: "Âm nhạc", icon: "🎵", category: "ART" },
  ];

  for (const hobby of hobbies) {
    await prisma.hobby.upsert({
      where: { name: hobby.name },
      update: {},
      create: hobby,
    });
  }

  // Create sample locations
  const locations = [
    {
      name: "Hoan Kiem Lake",
      nameVi: "Hồ Hoàn Kiếm",
      address: "Hoan Kiem District, Hanoi",
      latitude: 21.0285,
      longitude: 105.8542,
      cityId: hanoi.id,
    },
    {
      name: "Nguyen Hue Walking Street",
      nameVi: "Phố đi bộ Nguyễn Huệ",
      address: "District 1, Ho Chi Minh City",
      latitude: 10.7764,
      longitude: 106.7009,
      cityId: hcmc.id,
    },
  ];

  for (const location of locations) {
    const existing = await prisma.location.findFirst({
      where: { name: location.name },
    });

    if (!existing) {
      await prisma.location.create({
        data: location,
      });
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
