"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Cog,
  Download,
  RefreshCw,
  FileText,
  Bug,
  FileWarning,
  BarChart2,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import CodeSmellPieChart from "@/components/dashbaord/custom-piechart";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [project, setProject] = useState<any>({});
  const [isLoading, setisLoading] = useState(false);
  console.log(id);

  useEffect(() => {
    const fetchProject = async () => {
      setisLoading(true);
      try {
        const { data } = await api.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/get-project/${id}`
        );

        setProject(data.project);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setisLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleUpload = () => {
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("project", file);

      api
        .patch(
          `http://localhost:3000/api/v1/project/update-project/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          setProject(response.data.project);
          console.log("File uploaded successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        })
        .finally(() => {
          setIsUploading(false);
          setFile(null);
        });
    }
  };

  const goToSettings = () => {
    router.push(`/report/${id}/settings`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto  dark:bg-[#040820]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{project?.title}</h1>
          <Badge
            variant="outline"
            className="ml-2 dark:bg-[#3a4255] dark:text-white"
          >
            version: {project?.latestVersion?.version}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 dark:bg-[#3a4255] dark:text-white"
          >
            <Download className="h-4 w-4 mr-1" />
            <span>Download Report</span>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 dark:bg-[#3a4255] dark:text-white cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                <span>Update Project</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-[#040820] ">
              <DialogHeader>
                <DialogTitle>Upload Project Update</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="projectFile">Project Zip File</Label>
                  <Input
                    id="projectFile"
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </div>
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                )}
                <DialogTrigger asChild>
                  <Button
                    onClick={async () => {
                      await handleUpload();
                    }}
                    disabled={!file || isUploading}
                    className="gap-2 dark:text-white dark:bg-[#3a4255] cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Upload Project"}
                  </Button>
                </DialogTrigger>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 dark:bg-[#3a4255] dark:text-white"
            onClick={goToSettings}
          >
            <Cog className="h-4 w-4 mr-1" />
            <span>Project Settings</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="dark:bg-[#0F172A]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project?.latestVersion?.report?.totalFiles}
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-[#0F172A]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Code Smells
            </CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project?.latestVersion?.report?.totalSmells}
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-[#0F172A]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Affected Files
            </CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project?.latestVersion?.report?.AffectedFiles}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                ((project?.latestVersion?.report?.AffectedFiles ?? 0) /
                  (project?.latestVersion?.report?.totalFiles ?? 1)) *
                  100
              )}
              % of total files
            </p>
          </CardContent>
        </Card>
        <Card className="dark:bg-[#0F172A]">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Code Quality</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project?.qualityScore}</div>
            <Progress value={project?.qualityScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <CodeSmellPieChart
        chartData={project?.latestVersion?.report?.chartData}
      />
    </div>
  );
}
