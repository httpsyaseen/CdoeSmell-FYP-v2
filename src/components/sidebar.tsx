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
  const [isActive, setIsActive] = React.useState(window.location.href);

  React.useEffect(() => {
    setIsActive(window.location.href);
  }, []);

  React.useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/recent-projects`
        );
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
    <Sidebar className="border-r mt-16 bg-white">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground tracking-wider">
            OVERVIEW
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`${isActive === "/dashboard" && "bg-[#edeef1]"}`}
                >
                  <a
                    href="/dashboard"
                    className="flex items-center gap-3 text-sm text-foreground hover:text-primary"
                  >
                    <HomeIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`${isActive === "/dashboard" && "bg-[#edeef1]"}`}
                >
                  <a
                    href="/upload"
                    className="flex items-center gap-3 text-sm text-foreground hover:text-primary"
                  >
                    <UploadIcon className="h-4 w-4" />
                    <span>Upload New Project</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="/projects"
                    className="flex items-center gap-3 text-sm text-foreground hover:text-primary"
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
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground tracking-wider">
            RECENT PROJECTS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="relative mb-2">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search project"
                className="pl-9 h-8 bg-background text-sm"
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
                      <div className="flex items-center justify-between py-1.5 px-2">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded-md bg-muted animate-pulse" />
                          <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
                        </div>
                        <div className="h-4 w-16 rounded-md bg-muted animate-pulse" />
                      </div>
                    </SidebarMenuItem>
                  ))
              ) : error ? (
                <div className="text-sm text-muted-foreground p-2">{error}</div>
              ) : (
                filteredProjects.map((project) => (
                  <SidebarMenuItem key={project._id}>
                    <SidebarMenuButton asChild>
                      <a
                        href={`/report/${project._id}`}
                        className="flex items-center justify-between text-sm text-foreground hover:text-primary"
                      >
                        <div className="flex items-center gap-3">
                          <FileIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[160px]">
                            {project.title}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
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
      <SidebarFooter className="border-t p-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            N
          </AvatarFallback>
        </Avatar>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
