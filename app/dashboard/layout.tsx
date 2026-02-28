"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Review", href: "/dashboard/review", icon: ReviewIcon },
  { label: "Library", href: "/dashboard/library", icon: LibraryIcon },
  { label: "Notebook", href: "/dashboard/notebook", icon: NotebookIcon },
  { label: "Assignments", href: "/dashboard/assignments", icon: AssignmentsIcon },
  { label: "Connect", href: "/dashboard/connect", icon: ConnectIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "linear-gradient(135deg, #4a0e2e 0%, #3b1248 20%, #2a1555 40%, #1e3a6f 60%, #0d5f5f 80%, #0a6e5a 100%)" }}>
      {/* Constellation/network pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="constellation" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="30" r="1.5" fill="white" />
            <circle cx="80" cy="10" r="1" fill="white" />
            <circle cx="150" cy="40" r="1.5" fill="white" />
            <circle cx="180" cy="90" r="1" fill="white" />
            <circle cx="40" cy="100" r="1.5" fill="white" />
            <circle cx="120" cy="80" r="1" fill="white" />
            <circle cx="60" cy="160" r="1.5" fill="white" />
            <circle cx="140" cy="150" r="1" fill="white" />
            <circle cx="100" cy="180" r="1.5" fill="white" />
            <circle cx="190" cy="170" r="1" fill="white" />
            <line x1="20" y1="30" x2="80" y2="10" stroke="white" strokeWidth="0.5" />
            <line x1="80" y1="10" x2="150" y2="40" stroke="white" strokeWidth="0.5" />
            <line x1="150" y1="40" x2="180" y2="90" stroke="white" strokeWidth="0.5" />
            <line x1="40" y1="100" x2="120" y2="80" stroke="white" strokeWidth="0.5" />
            <line x1="120" y1="80" x2="150" y2="40" stroke="white" strokeWidth="0.5" />
            <line x1="40" y1="100" x2="60" y2="160" stroke="white" strokeWidth="0.5" />
            <line x1="60" y1="160" x2="140" y2="150" stroke="white" strokeWidth="0.5" />
            <line x1="140" y1="150" x2="180" y2="90" stroke="white" strokeWidth="0.5" />
            <line x1="100" y1="180" x2="60" y2="160" stroke="white" strokeWidth="0.5" />
            <line x1="100" y1="180" x2="140" y2="150" stroke="white" strokeWidth="0.5" />
            <line x1="20" y1="30" x2="40" y2="100" stroke="white" strokeWidth="0.3" />
            <line x1="190" y1="170" x2="140" y2="150" stroke="white" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#constellation)" />
      </svg>

      {/* Main content */}
      <main className="flex-1 relative z-10 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom navigation — responsive sizing */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-black border-t border-gray-700 safe-area-bottom">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-1 sm:px-2">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-1 sm:px-2 py-1 rounded-lg transition-colors min-w-0 ${
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <tab.icon active={isActive} />
                <span className="text-[9px] sm:text-[10px] font-medium truncate">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ── Tab icons (inline SVG) ──

function ReviewIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "currentColor" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LibraryIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function NotebookIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function AssignmentsIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline
        points="9 11 12 14 22 4"
        strokeWidth={active ? "2.5" : "2"}
      />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function ConnectIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
