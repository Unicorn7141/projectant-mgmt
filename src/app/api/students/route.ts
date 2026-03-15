import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVisibleUserIds, hasRole, requireAuth } from "@/lib/auth-helpers";

type StudentRow = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  college: string | null;
  profileImage: string | null;
  isActive: boolean;
  department: {
    id: number;
    name: string;
    unit: {
      id: number;
      name: string;
      company: {
        id: number;
        name: string;
      };
    };
  } | null;
  studyingOn: {
    project: {
      id: number;
      name: string;
    };
  }[];
};

export async function GET(req: NextRequest) {
  try {
    const caller = await requireAuth(req.headers.get("authorization"));

    if (!hasRole(caller, "ADMIN", "MENTOR")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const visibleUserIds = await getVisibleUserIds(caller.id);

    const students = (await prisma.user.findMany({
      where: {
        id: { in: visibleUserIds },
        roles: {
          some: {
            role: {
              name: "STUDENT",
            },
          },
        },
      },
      include: {
        department: {
          include: {
            unit: {
              include: {
                company: true,
              },
            },
          },
        },
        studyingOn: {
          include: {
            project: true,
          },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })) as StudentRow[];

    return NextResponse.json(students);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
