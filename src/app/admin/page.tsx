"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>⚙️</span> Admin Panelis
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/results" className="f1-card p-6 hover:border-primary/50 transition-colors">
          <span className="text-3xl mb-2 block">🏁</span>
          <h2 className="font-bold text-lg">Ievadīt Rezultātus</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ievadīt kvalifikācijas, sprinta un sacīkšu rezultātus
          </p>
        </Link>

        <Link href="/admin/users" className="f1-card p-6 hover:border-primary/50 transition-colors">
          <span className="text-3xl mb-2 block">👥</span>
          <h2 className="font-bold text-lg">Lietotāji</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pārvaldīt lietotāju kontus un tiesības
          </p>
        </Link>
      </div>
    </div>
  );
}
