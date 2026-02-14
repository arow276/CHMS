import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Prisma + bcrypt work in serverless functions
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
};

export default nextConfig;
