import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                name: user.name || "",
                email: user.email,
                image: user.image,
                emailVerified: new Date(),
                isActive: true,
                isVerified: true,
                profileVisibility: "PUBLIC",
                distanceRadius: 10,
                ageRangeMin: 18,
                ageRangeMax: 50,
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error handling user sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && session.user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
              age: true,
              gender: true,
              phoneNumber: true,
              isActive: true,
              isVerified: true,
            },
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.bio = dbUser.bio;
            session.user.age = dbUser.age;
            session.user.gender = dbUser.gender;
            session.user.phoneNumber = dbUser.phoneNumber;
            session.user.isActive = dbUser.isActive;
            session.user.isVerified = dbUser.isVerified;
            // Get onboarding status using raw query
            try {
              const onboardingStatus = await prisma.$queryRaw<
                { onboardingCompleted: boolean }[]
              >`
                SELECT "onboardingCompleted" FROM "User" WHERE "id" = ${dbUser.id}
              `;
              (session.user as any).onboardingCompleted =
                onboardingStatus[0]?.onboardingCompleted || false;
            } catch (error) {
              console.error("Error fetching onboarding status:", error);
              (session.user as any).onboardingCompleted = false;
            }
          }
        } catch (error) {
          console.error("Error fetching user session:", error);
          session.user.id = token.sub;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // For sign-in redirects, check if user needs onboarding
      if (url === `${baseUrl}/dashboard` || url.includes("callbackUrl")) {
        return `${baseUrl}/dashboard`; // Let middleware handle onboarding check
      }
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: "jwt",
  },
};
