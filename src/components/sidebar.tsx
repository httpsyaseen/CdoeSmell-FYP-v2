"use client";

import * as React from "react";
import { FileIcon, HomeIcon, SearchIcon, UploadIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import api from "@/lib/api";

type Project = {
  _id: string;
  title: string;
  createdAt: string;
  latestVersion: {
    report: {
      totalSmells: number;
    };
  };
};

export function AppSidebar() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isActive, setIsActive] = React.useState("");

  React.useEffect(() => {
    const handleRouteChange = () => {
      setIsActive(window.location.pathname);
    };

    handleRouteChange(); // Set initial state
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  React.useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/project/recent-projects`);
        setProjects(response.data.projects);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar className="mt-16 border-r border-[#d0d7de] bg-[#f6f8fa]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium text-[#57606a] tracking-wider">
            OVERVIEW
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`rounded-md px-3 ${
                    isActive === "/dashboard"
                      ? "bg-[#eaeef2] font-medium text-[#24292f]"
                      : "hover:bg-[#eaeef2]"
                  }`}
                >
                  <a
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm text-[#24292f]"
                  >
                    <HomeIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`rounded-md px-3 ${
                    isActive === "/upload"
                      ? "bg-[#eaeef2] font-medium text-[#24292f]"
                      : "hover:bg-[#eaeef2]"
                  }`}
                >
                  <a
                    href="/upload"
                    className="flex items-center gap-2 text-sm text-[#24292f]"
                  >
                    <UploadIcon className="h-4 w-4" />
                    <span>Upload New Project</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`rounded-md px-3 ${
                    isActive === "/projects"
                      ? "bg-[#eaeef2] font-medium text-[#24292f]"
                      : "hover:bg-[#eaeef2]"
                  }`}
                >
                  <a
                    href="/projects"
                    className="flex items-center gap-2 text-sm text-[#24292f]"
                  >
                    <FileIcon className="h-4 w-4" />
                    <span>Projects</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium text-[#57606a] tracking-wider">
            RECENT PROJECTS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="relative mb-2 px-3">
              <SearchIcon className="absolute left-6 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#57606a]" />
              <Input
                placeholder="Search project"
                className="h-7 rounded-md border-[#d0d7de] bg-[#f6f8fa] pl-8 text-sm focus-visible:border-[#0969da] focus-visible:ring-1 focus-visible:ring-[#0969da]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SidebarMenu>
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <SidebarMenuItem key={index}>
                      <div className="flex items-center justify-between py-1.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-md bg-[#d0d7de] animate-pulse" />
                          <div className="h-4 w-32 rounded-md bg-[#d0d7de] animate-pulse" />
                        </div>
                        <div className="h-4 w-16 rounded-md bg-[#d0d7de] animate-pulse" />
                      </div>
                    </SidebarMenuItem>
                  ))
              ) : error ? (
                <div className="px-3 py-2 text-sm text-[#57606a]">{error}</div>
              ) : (
                filteredProjects.map((project) => (
                  <SidebarMenuItem key={project._id}>
                    <SidebarMenuButton
                      asChild
                      className="rounded-md px-3 hover:bg-[#eaeef2]"
                    >
                      <a
                        href={`/report/${project._id}`}
                        className="flex items-center justify-between text-sm text-[#24292f]"
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon className="h-4 w-4 text-[#57606a]" />
                          <span className="truncate max-w-[160px]">
                            {project.title}
                          </span>
                        </div>
                        <span className="text-xs text-[#57606a] shrink-0">
                          {formatDistanceToNow(new Date(project.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-[#d0d7de] p-3">
        <Avatar className="h-8 w-8 border border-[#d0d7de]">
          <AvatarFallback className="bg-[#eaeef2] text-[#24292f]">
            N
          </AvatarFallback>
        </Avatar>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
