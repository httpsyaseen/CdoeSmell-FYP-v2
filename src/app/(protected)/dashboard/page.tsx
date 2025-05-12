"use client";

import { DashboardCards } from "@/components/dashbaord/dashboard-cards";
import React from "react";

export default function page() {
  return (
    <main className="p-4 w-full min-w-full">
      <h1 className="font-bold text-4xl">Dashboard</h1>
      <div className="w-full mt-4">
        <DashboardCards />
      </div>
    </main>
  );
}
