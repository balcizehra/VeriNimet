import { PrismaClient } from "@prisma/client";

// Next.js dev modunda hot-reload sırasında çoklu bağlantı açılmasını önler.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
