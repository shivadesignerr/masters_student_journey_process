import React from "react";
import { CounselorSidebar } from "@/components/counselor/CounselorSidebar";
import { CounselorNavbar } from "@/components/counselor/CounselorNavbar";

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gvk-bg flex">
      {/* Persistent Desktop Sidebar */}
      <CounselorSidebar className="hidden lg:flex" />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <CounselorNavbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
