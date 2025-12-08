import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      bio?: string | null;
      age?: number | null;
      gender?: string | null;
      phoneNumber?: string | null;
      isActive?: boolean;
      isVerified?: boolean;
      onboardingCompleted?: boolean;
    };
  }

  interface User {
    id?: number;
    bio?: string | null;
    age?: number | null;
    gender?: string | null;
    phoneNumber?: string | null;
    isActive?: boolean;
    isVerified?: boolean;
    onboardingCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
  }
}
