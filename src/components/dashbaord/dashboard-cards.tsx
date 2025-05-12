"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Code, FileText, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import CodeSmellPieChart from "./custom-piechart";

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
        const { data } = await api.get(`/project/dashboard-stats`);
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
    if (value >= 70) return "bg-teal-500";
    if (value >= 40) return "bg-purple-500";
    return "bg-pink-500";
  };

  if (error && !data) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Code Smells Card */}
        <Card className="border-0 overflow-hidden bg-slate-900 text-white shadow-lg">
          {loading ? (
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-32 bg-slate-700" />
                <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
              </div>
              <Skeleton className="h-8 w-20 mb-2 bg-slate-700" />
              <Skeleton className="h-3 w-24 bg-slate-700" />
            </CardContent>
          ) : (
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-bl-full"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-500/20 p-2 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-pink-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-300">
                  Code Smells
                </h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  {data?.totalSmells.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Issues detected across all projects
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Severity</span>
                  <span className="text-xs font-medium text-pink-400">
                    High
                  </span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Total Projects Card */}
        <Card className="border-0 overflow-hidden bg-slate-900 text-white shadow-lg">
          {loading ? (
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-32 bg-slate-700" />
                <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
              </div>
              <Skeleton className="h-8 w-20 mb-2 bg-slate-700" />
              <Skeleton className="h-3 w-24 bg-slate-700" />
            </CardContent>
          ) : (
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-300">Projects</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">
                  {data?.totalProjects}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Active projects being monitored
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Status</span>
                  <span className="text-xs font-medium text-purple-400">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Code Quality Card */}
        <Card className="border-0 overflow-hidden bg-slate-900 text-white shadow-lg">
          {loading ? (
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-32 bg-slate-700" />
                <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
              </div>
              <Skeleton className="h-8 w-20 mb-2 bg-slate-700" />
              <Skeleton className="h-3 w-full bg-slate-700" />
              <Skeleton className="h-3 w-16 mt-2 bg-slate-700" />
            </CardContent>
          ) : (
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-bl-full"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-teal-500/20 p-2 rounded-lg">
                  <Code className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-300">
                  Code Quality
                </h3>
              </div>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold">
                  {Number.parseFloat(data?.codeQuality || "0").toFixed(1)}
                </span>
                <span className="text-slate-400 text-sm">%</span>
              </div>

              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    getQualityColor(data?.codeQuality || "0")
                  )}
                  style={{
                    width: `${data?.codeQuality}%`,
                    transition: "width 1s ease-in-out",
                  }}
                />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Status</span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      Number.parseFloat(data?.codeQuality || "0") >= 70
                        ? "text-teal-400"
                        : Number.parseFloat(data?.codeQuality || "0") >= 40
                        ? "text-purple-400"
                        : "text-pink-400"
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
        <CodeSmellPieChart chartData={data?.chartData} />
      </div>
    </div>
  );
}
