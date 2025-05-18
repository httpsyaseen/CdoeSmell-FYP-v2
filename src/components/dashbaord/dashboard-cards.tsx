"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Code, FileText, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import CodeSmellPieChart from "./custom-piechart";
import api from "@/lib/api";

interface DashboardData {
  totalSmells: number;
  totalProjects: number;
  codeQuality: string;
  chartData: {
    category: string;
    value: number;
    color: string;
  }[];
}

export function DashboardCards() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/project/dashboard-stats `);
        console.log(data.data);
        setData(data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        setData({
          totalSmells: 465,
          totalProjects: 3,
          codeQuality: "33.16",
          chartData: [{ category: "design", value: 465, color: "#598F43" }],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getQualityLabel = (quality: string) => {
    const value = Number.parseFloat(quality);
    if (value >= 70) return "Good";
    if (value >= 40) return "Fair";
    return "Needs Improvement";
  };

  const getQualityColor = (quality: string) => {
    const value = Number.parseFloat(quality);
    if (value >= 70) return "bg-[#2da44e]"; // GitHub green
    if (value >= 40) return "bg-[#bf8700]"; // GitHub yellow
    return "bg-[#cf222e]"; // GitHub red
  };

  const getSeverity = (value: number) => {
    if (value === 0) return "Low";
    if (value < 50) return "Medium";
    if (value > 50) return "high";
  };

  if (error && !data) {
    return (
      <Alert
        variant="destructive"
        className="mb-6 border border-[#cf222e] bg-[#FFEBE9] text-[#cf222e]"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Code Smells Card */}
        <Card className="border border-[#d0d7de] rounded-md overflow-hidden  bg-[#f6f8fa]">
          {loading ? (
            <CardContent className="">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-32 bg-[#eaeef2]" />
                <Skeleton className="h-8 w-8 rounded-full bg-[#eaeef2]" />
              </div>
              <Skeleton className="h-8 w-20 mb-2 bg-[#eaeef2]" />
              <Skeleton className="h-3 w-24 bg-[#eaeef2]" />
            </CardContent>
          ) : (
            <CardContent className="p-4 bg-[#f6f8fa]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#57606a]">
                  Code Smells
                </span>
                <AlertTriangle className="h-4 w-4 text-[#d29922]" />
              </div>
              <div className="text-2xl font-semibold text-[#24292f]">
                {data?.totalSmells.toLocaleString()}
              </div>
              <p className="text-xs text-[#57606a] mt-1">
                Issues detected across all projects
              </p>
              <div className="mt-3 pt-3 border-t border-[#d0d7de]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#57606a]">Severity</span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      data?.totalSmells === 0
                        ? "text-[#2da44e] bg-[#dafbe1]" // Green for Low
                        : data?.totalSmells || 5 < 50
                        ? "text-[#bf8700] bg-[#fff8c5]" // Yellow for Medium
                        : "text-[#cf222e] bg-[#FFEBE9]" // Red for High
                    )}
                  >
                    {getSeverity(data?.totalSmells || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Total Projects Card */}
        <Card className="border border-[#d0d7de] rounded-md overflow-hidden bg-[#f6f8fa] ">
          {loading ? (
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-32 bg-[#eaeef2]" />
                <Skeleton className="h-8 w-8 rounded-full bg-[#eaeef2]" />
              </div>
              <Skeleton className="h-8 w-20 mb-2 bg-[#eaeef2]" />
              <Skeleton className="h-3 w-24 bg-[#eaeef2]" />
            </CardContent>
          ) : (
            <CardContent className="p-4 bg-[#f6f8fa]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#57606a]">
                  Projects
                </span>
                <FileText className="h-4 w-4 text-[#57606a]" />
              </div>
              <div className="text-2xl font-semibold text-[#24292f]">
                {data?.totalProjects}
              </div>
              <p className="text-xs text-[#57606a] mt-1">
                Active projects being monitored
              </p>
              <div className="mt-3 pt-3 border-t border-[#d0d7de]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#57606a]">Status</span>
                  <span className="text-xs font-medium text-[#0969da] bg-[#ddf4ff] px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Code Quality Card */}
        <Card className="border border-[#d0d7de] rounded-md overflow-hidden bg-[#f6f8fa] ">
          {loading ? (
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-32 bg-[#eaeef2]" />
                <Skeleton className="h-8 w-8 rounded-full bg-[#eaeef2]" />
              </div>
              <Skeleton className="h-8 w-20 mb-2 bg-[#eaeef2]" />
              <Skeleton className="h-3 w-full bg-[#eaeef2]" />
              <Skeleton className="h-3 w-16 mt-2 bg-[#eaeef2]" />
            </CardContent>
          ) : (
            <CardContent className="p-4 bg-[#f6f8fa]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#57606a]">
                  Code Quality
                </span>
                <Code className="h-4 w-4 text-[#2da44e]" />
              </div>
              <div className="text-2xl font-semibold text-[#24292f]">
                {Number.parseFloat(data?.codeQuality || "0").toFixed(1)}%
              </div>
              <div className="mt-2 bg-[#d0d7de] rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 ease-out",
                    getQualityColor(data?.codeQuality || "0")
                  )}
                  style={{
                    width: `${data?.codeQuality}%`,
                    transition: "width 1s ease-in-out",
                  }}
                />
              </div>
              <div className="mt-3 pt-3 border-t border-[#d0d7de]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#57606a]">Status</span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      Number.parseFloat(data?.codeQuality || "0") >= 70
                        ? "text-[#2da44e] bg-[#dafbe1]"
                        : Number.parseFloat(data?.codeQuality || "0") >= 40
                        ? "text-[#bf8700] bg-[#fff8c5]"
                        : "text-[#cf222e] bg-[#FFEBE9]"
                    )}
                  >
                    {getQualityLabel(data?.codeQuality || "0")}
                  </span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <div>
        <CodeSmellPieChart chartData={data?.chartData ?? []} />
      </div>
    </div>
  );
}
