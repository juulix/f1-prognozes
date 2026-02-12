"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface User {
  id: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" className="mt-20" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>👥</span> Lietotāji
      </h1>

      <div className="f1-card overflow-hidden">
        <div className="divide-y divide-border">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-sm">{user.name}</span>
                  {user.isAdmin && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
