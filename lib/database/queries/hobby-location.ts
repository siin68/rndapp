import prisma from "../../prisma";

/**
 * Hobby and Location queries
 */
export const hobbyQueries = {
  // Get all active hobbies
  async getAllHobbies() {
    return prisma.hobby.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  },

  // Get hobbies by category
  async getHobbiesByCategory(category: string) {
    return prisma.hobby.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });
  },

  // Get hobby with stats
  async getHobbyWithStats(hobbyId: string | number) {
    const numericHobbyId = typeof hobbyId === 'string' ? parseInt(hobbyId) : hobbyId;
    return prisma.hobby.findUnique({
      where: { id: numericHobbyId },
      include: {
        _count: {
          select: { users: true, events: true },
        },
      },
    });
  },
};

export const locationQueries = {
  // Get all active locations
  async getAllLocations() {
    return prisma.location.findMany({
      where: { isActive: true },
      include: { city: true },
      orderBy: [{ city: { name: "asc" } }, { name: "asc" }],
    });
  },

  // Get locations by city
  async getLocationsByCity(cityId: string | number) {
    const numericCityId = typeof cityId === 'string' ? parseInt(cityId) : cityId;
    return prisma.location.findMany({
      where: {
        cityId: numericCityId,
        isActive: true,
      },
      include: { city: true },
      orderBy: { name: "asc" },
    });
  },

  // Get all cities
  async getAllCities() {
    return prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  },

  // Get city with locations
  async getCityWithLocations(cityId: string | number) {
    const numericCityId = typeof cityId === 'string' ? parseInt(cityId) : cityId;
    return prisma.city.findUnique({
      where: { id: numericCityId },
      include: {
        locations: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
      },
    });
  },
};
