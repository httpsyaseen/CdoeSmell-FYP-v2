"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TooltipProps } from "recharts";

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-blue-200 shadow-lg p-3 rounded-lg">
        <p className="font-medium text-blue-900">{data.name}</p>
        <p className="text-blue-700">Value: {data.value}</p>
        <p className="text-blue-700">
          Percentage: {(data.percent * 100).toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

interface chartDatatype {
  category: string;
  value: number;
  color: string;
}

const NoCodeSmell = {
  category: "No Code Smell",
  value: 1,
  color: "#d1d5db",
};

export default function CodeSmellPieChart({
  chartData = [NoCodeSmell], // Default dummy value
}: {
  chartData: chartDatatype[];
}) {
  const [isMobile, setIsMobile] = useState(false);

  const codeSmellTypes = chartData.length > 0 ? chartData : [NoCodeSmell];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Define mobile breakpoint
    };

    handleResize(); // Initialize on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <Card className="dark:bg-[#0f162b] shadow-md w-[400px] md:w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Code Smell Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-[400px]  md:flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={codeSmellTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 100 : 130}
                  innerRadius={isMobile ? 60 : 70}
                  dataKey="value"
                  cornerRadius={15}
                  nameKey="category"
                  label={({ category, value, percent }) =>
                    isMobile
                      ? `${(percent * 100).toFixed(0)}%`
                      : `${category} (${value})    ${(percent * 100).toFixed(
                          0
                        )}%`
                  }
                  labelLine={!isMobile} // Remove label line in mobile
                >
                  {codeSmellTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center gap-2 lg:w-48">
            {codeSmellTypes.map((entry, index) => (
              <div
                key={`legend-${index}`}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span>{entry.category}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
