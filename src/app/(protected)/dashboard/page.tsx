"use client";

import { DashboardCards } from "@/components/dashbaord/dashboard-cards";
import React from "react";

export default function page() {
  return (
    <main className="p-4 w-full min-w-full">
      <h1 className="font-semibold text-2xl text-[#24292f]">Dashboard</h1>
      <div className="w-full mt-4">
        <DashboardCards />
      </div>
    </main>
  );
}
