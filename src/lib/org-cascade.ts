import { Prisma } from "@prisma/client";

export async function deleteUsersAndDependencies(
  tx: Prisma.TransactionClient,
  userIds: number[],
) {
  if (userIds.length === 0) return;

  const ownedProjects = await tx.project.findMany({
    where: { ownerId: { in: userIds } },
    select: { id: true },
  });
  const ownedProjectIds = ownedProjects.map((project) => project.id);

  if (ownedProjectIds.length > 0) {
    await tx.projectMentor.deleteMany({
      where: { projectId: { in: ownedProjectIds } },
    });
    await tx.projectStudent.deleteMany({
      where: { projectId: { in: ownedProjectIds } },
    });
    await tx.project.deleteMany({
      where: { id: { in: ownedProjectIds } },
    });
  }

  await tx.projectMentor.deleteMany({
    where: { mentorId: { in: userIds } },
  });
  await tx.projectStudent.deleteMany({
    where: { studentId: { in: userIds } },
  });
  await tx.userRole.deleteMany({
    where: { userId: { in: userIds } },
  });
  await tx.user.updateMany({
    where: { createdById: { in: userIds } },
    data: { createdById: null },
  });
  await tx.user.deleteMany({
    where: { id: { in: userIds } },
  });
}
