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
  async getHobbyWithStats(hobbyId: string) {
    return prisma.hobby.findUnique({
      where: { id: hobbyId },
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
  async getLocationsByCity(cityId: string) {
    return prisma.location.findMany({
      where: {
        cityId,
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
  async getCityWithLocations(cityId: string) {
    return prisma.city.findUnique({
      where: { id: cityId },
      include: {
        locations: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
      },
    });
  },
};
