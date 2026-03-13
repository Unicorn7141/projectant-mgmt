"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Building2, Layers } from "lucide-react";
import { UsersTab } from "./_components/UsersTab";
import { CompaniesTab } from "./_components/CompaniesTab";
import { UnitsTab } from "./_components/UnitsTab";
import { DepsTab } from "./_components/DepsTab";
import { CreateUserModal } from "./_components/CreateUserModal";
import { EditUserModal } from "./_components/EditUserModal";
import { SimpleCreateModal } from "./_components/SimpleModal";

type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isActive: boolean;
  departmentId: number | null;
  roles: string[];
  department: string | null;
  unit: string | null;
  company: string | null;
  createdBy: string | null;
  college?: string | null;
  profileImage?: string | null;
};

type Company = { id: number; name: string };
type Unit = {
  id: number;
  name: string;
  companyId: number;
  company: { name: string };
};
type Department = {
  id: number;
  name: string;
  unitId: number;
  unit: { name: string; company: { name: string } };
};
type Tab = "users" | "companies" | "units" | "departments";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateUnit, setShowCreateUnit] = useState(false);
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("authToken"));
  }, []);

  const hdrs = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  async function fetchJson<T>(url: string): Promise<T[]> {
    const res = await fetch(url, { headers: hdrs() });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setUsers(await fetchJson<UserRow>("/api/auth/user/list"));
    setLoading(false);
  }, [token, hdrs]);

  const fetchCompanies = useCallback(async () => {
    if (!token) return;
    setCompanies(await fetchJson<Company>("/api/org/company"));
  }, [token, hdrs]);

  const fetchUnits = useCallback(async () => {
    if (!token) return;
    setUnits(await fetchJson<Unit>("/api/org/unit"));
  }, [token, hdrs]);

  const fetchDepts = useCallback(async () => {
    if (!token) return;
    setDepartments(await fetchJson<Department>("/api/org/department"));
  }, [token, hdrs]);

  useEffect(() => {
    if (!token) return;
    fetchCompanies();
    fetchUnits();
    fetchDepts();
  }, [token, fetchCompanies, fetchUnits, fetchDepts]);

  useEffect(() => {
    if (tab === "users") fetchUsers();
    if (tab === "companies") fetchCompanies();
    if (tab === "units") fetchUnits();
    if (tab === "departments") fetchDepts();
  }, [tab, fetchUsers, fetchCompanies, fetchUnits, fetchDepts]);

  const deleteUser = async (id: number) => {
    if (!confirm("להשבית משתמש זה?")) return;
    await fetch("/api/auth/user/delete", {
      method: "DELETE",
      headers: hdrs(),
      body: JSON.stringify({ id }),
    });
    fetchUsers();
  };

  const deleteCompany = async (id: number) => {
    if (!confirm("למחוק יחידה זו?")) return;
    await fetch("/api/org/company", {
      method: "DELETE",
      headers: hdrs(),
      body: JSON.stringify({ id }),
    });
    fetchCompanies();
  };

  const deleteUnit = async (id: number) => {
    if (!confirm("למחוק גף זה?")) return;
    await fetch("/api/org/unit", {
      method: "DELETE",
      headers: hdrs(),
      body: JSON.stringify({ id }),
    });
    fetchUnits();
  };

  const deleteDept = async (id: number) => {
    if (!confirm("למחוק מחלקה זו?")) return;
    await fetch("/api/org/department", {
      method: "DELETE",
      headers: hdrs(),
      body: JSON.stringify({ id }),
    });
    fetchDepts();
  };

  const tabsList: { id: Tab; label: string; icon: any }[] = [
    { id: "users", label: "משתמשים", icon: Users },
    { id: "companies", label: "יחידות", icon: Building2 },
    { id: "units", label: "גפים", icon: Layers },
    { id: "departments", label: "מחלקות", icon: Layers },
  ];

  return (
    <div
      className="max-w-6xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700"
      dir="rtl"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          ניהול מערכת
        </h1>
        <p className="text-slate-400">ניהול משתמשים, יחידות, גפים ומחלקות</p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-white/5 pb-4">
        {tabsList.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <UsersTab
          users={users}
          loading={loading}
          onEdit={setEditUser}
          onDelete={deleteUser}
          onNew={() => setShowCreateUser(true)}
        />
      )}

      {tab === "companies" && (
        <CompaniesTab
          companies={companies}
          onDelete={deleteCompany}
          onNew={() => setShowCreateCompany(true)}
        />
      )}

      {tab === "units" && (
        <UnitsTab
          units={units}
          onDelete={deleteUnit}
          onNew={() => setShowCreateUnit(true)}
        />
      )}

      {tab === "departments" && (
        <DepsTab
          departments={departments}
          onDelete={deleteDept}
          onNew={() => setShowCreateDept(true)}
        />
      )}

      {showCreateUser && (
        <CreateUserModal
          token={token!}
          departments={departments}
          onClose={() => setShowCreateUser(false)}
          onCreated={() => {
            setShowCreateUser(false);
            fetchUsers();
          }}
        />
      )}

      {editUser && (
        <EditUserModal
          token={token!}
          user={editUser}
          departments={departments}
          onClose={() => setEditUser(null)}
          onSaved={() => {
            setEditUser(null);
            fetchUsers();
          }}
        />
      )}

      {showCreateCompany && (
        <SimpleCreateModal
          title="יחידה חדשה"
          fields={[{ key: "name", label: "שם היחידה" }]}
          onClose={() => setShowCreateCompany(false)}
          onSubmit={async (data) => {
            await fetch("/api/org/company", {
              method: "POST",
              headers: hdrs(),
              body: JSON.stringify(data),
            });
            setShowCreateCompany(false);
            fetchCompanies();
          }}
        />
      )}

      {showCreateUnit && (
        <SimpleCreateModal
          title="גף חדש"
          fields={[
            { key: "name", label: "שם הגף" },
            {
              key: "companyId",
              label: "יחידה",
              type: "select",
              options: companies.map((c) => ({ value: c.id, label: c.name })),
            },
          ]}
          onClose={() => setShowCreateUnit(false)}
          onSubmit={async (data) => {
            await fetch("/api/org/unit", {
              method: "POST",
              headers: hdrs(),
              body: JSON.stringify(data),
            });
            setShowCreateUnit(false);
            fetchUnits();
          }}
        />
      )}

      {showCreateDept && (
        <SimpleCreateModal
          title="מחלקה חדשה"
          fields={[
            { key: "name", label: "שם המחלקה" },
            {
              key: "unitId",
              label: "גף",
              type: "select",
              options: units.map((u) => ({
                value: u.id,
                label: `${u.name} / ${u.company.name}`,
              })),
            },
          ]}
          onClose={() => setShowCreateDept(false)}
          onSubmit={async (data) => {
            await fetch("/api/org/department", {
              method: "POST",
              headers: hdrs(),
              body: JSON.stringify(data),
            });
            setShowCreateDept(false);
            fetchDepts();
          }}
        />
      )}
    </div>
  );
}
