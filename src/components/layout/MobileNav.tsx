"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  items: { href: string; label: string; emoji: string }[];
}

export function MobileNav({ open, onClose, items }: MobileNavProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-background border-l border-border p-4">
        <div className="flex items-center justify-between mb-6">
          <span className="font-bold text-lg">🏎️ Izvēlne</span>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span className="text-xl">{item.emoji}</span>
              {item.label}
            </Link>
          ))}

          <div className="border-t border-border my-3" />

          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <span className="text-xl">⚙️</span>
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
