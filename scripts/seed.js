const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// Generates a random date
const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const updateSubmittedAt = async () => {
  try {
    const startOfYear = new Date('2024-01-01T00:00:00.000Z');
    const currentDate = new Date();
    const applications2024 = await db.application.findMany({
      select: { id: true },
    });
    const updatePromises = applications2024.map((app) =>
      db.application.update({
        where: { id: app.id },
        data: { submittedAt: randomDate(startOfYear, currentDate) },
      }),
    );
    await Promise.all(updatePromises);
  } catch (e) {
    console.error('Error updating application dates: ', e);
  } finally {
    await db.$disconnect();
  }
};

updateSubmittedAt();
