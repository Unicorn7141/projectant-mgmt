"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

function fullPath(student: StudentRow): string {
  const company = student.department?.unit.company.name;
  const unit = student.department?.unit.name;
  const department = student.department?.name;

  return [company, unit, department].filter(Boolean).join(" / ") || "—";
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("currentUser");

    if (!token || !savedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(savedUser) as { roles?: string[] };

    if (
      !parsedUser.roles?.includes("ADMIN") &&
      !parsedUser.roles?.includes("MENTOR")
    ) {
      router.push("/dashboard");
      return;
    }

    async function loadStudents() {
      try {
        const res = await fetch("/api/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load students");
        }

        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [router]);

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const aPath = fullPath(a);
      const bPath = fullPath(b);

      if (aPath !== bPath) return aPath.localeCompare(bPath);
      if (a.lastName !== b.lastName)
        return a.lastName.localeCompare(b.lastName);
      return a.firstName.localeCompare(b.firstName);
    });
  }, [students]);

  if (loading) {
    return <div className="text-white">Loading students...</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Students</h1>
        <p className="text-sm text-slate-400">
          All visible students, organized by Company / Unit / Department
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-black">
            <thead className="bg-gray-50 text-left">
              <tr className="border-b">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">College</th>
                <th className="px-4 py-3 font-medium">Path</th>
                <th className="px-4 py-3 font-medium">Projects</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student) => (
                  <tr key={student.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {student.profileImage ? (
                          <img
                            src={student.profileImage}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                            {student.firstName?.[0]}
                            {student.lastName?.[0]}
                          </div>
                        )}

                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {student.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">{student.username}</td>
                    <td className="px-4 py-3">{student.email}</td>
                    <td className="px-4 py-3">{student.college || "—"}</td>
                    <td className="px-4 py-3">{fullPath(student)}</td>
                    <td className="px-4 py-3">
                      {student.studyingOn.length > 0
                        ? student.studyingOn
                            .map((entry) => entry.project.name)
                            .join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          student.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
