"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Book,
  ChevronDown,
  Clock,
  Eye,
  Plus,
  Search,
} from "lucide-react";
import api from "@/lib/api";
import Loading from "@/components/loading";

interface TeamMember {
  id: string;
  name: string;
  photo?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  members: TeamMember[];
  totalSmells: number;
  lastUpdated: string;
}

export default function GitHubProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/get-all-projects`
        );

        // Extract projects from response
        const fetchedProjects = response.data.data.projects.map(
          (project: any) => ({
            _id: project._id,
            title: project.title,
            description: project.description,
            members: project.members.length > 0 ? project.members : [],
            totalSmells: project.totalSmells,
            lastUpdated: project.lastUpdated,
          })
        );

        setProjects(fetchedProjects);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to fetch projects");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) =>
    [project.title, project.description].some((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="rounded-md border border-[#d0d7de] bg-[#ffebe9] p-4 text-[#cf222e]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-6 px-4 md:px-6 bg-white">
      {/* Header section with GitHub-style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-[#d0d7de]">
        <div className="flex items-center gap-2">
          <Book className="h-5 w-5 text-[#57606a]" />
          <h1 className="text-xl font-semibold text-[#24292f]">Projects</h1>
        </div>
        <Button
          className="mt-4 md:mt-0 flex items-center gap-2 bg-[#2da44e] hover:bg-[#2c974b] text-white border-0"
          onClick={() => router.push("/upload")}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Search and filter section with GitHub-style */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#57606a]" />
          <Input
            placeholder="Find a project..."
            className="pl-10 h-9 border-[#d0d7de] text-[#24292f] placeholder:text-[#57606a] focus-visible:ring-[#0969da] focus-visible:border-[#0969da]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm font-medium text-[#24292f] border-[#d0d7de] bg-[#f6f8fa] hover:bg-[#f3f4f6]"
          >
            Sort by date
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Projects list with GitHub-style */}
      <div className="rounded-md border border-[#d0d7de] divide-y divide-[#d0d7de]">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project._id}
              className="p-4 hover:bg-[#f6f8fa] transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-semibold text-[#0969da] hover:underline truncate">
                      <a
                        href={`/code-editor/${project._id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(`/code-editor/${project._id}`);
                        }}
                      >
                        {project.title}
                      </a>
                    </h2>
                  </div>
                  <p className="text-sm text-[#57606a] mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#57606a]">
                    <div className="flex items-center">
                      <AlertTriangle className="h-3.5 w-3.5 text-[#d29922] mr-1" />
                      <span className="font-semibold">
                        {project.totalSmells} code smells
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span className="font-semibold">
                        Updated on {formatDate(project.lastUpdated)}
                      </span>
                    </div>

                    {project.members.length > 0 && (
                      <div className="flex items-center">
                        <span className="mr-2 font-semibold">
                          Team Members:{" "}
                        </span>
                        <div className="flex -space-x-1 mr-1">
                          {project.members.slice(0, 3).map((member) => (
                            <Avatar
                              key={member.id}
                              className="h-5 w-5 border border-white"
                            >
                              <AvatarImage
                                src={member.photo || "/placeholder.svg"}
                                alt={member.name}
                              />
                              <AvatarFallback className="text-[9px] bg-[#cff5ff] text-[#0969da]">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {project.members.length > 3 && (
                          <span>
                            +{project.members.length - 3} contributors
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-start mt-3 md:mt-0">
                  <Button
                    size="sm"
                    className="h-8 text-xs font-medium text-[#24292f] border-[1px] border-[#d0d7de] bg-[#f6f8fa] hover:bg-[#f3f4f6] cursor-pointer"
                    onClick={() => router.push(`/report/${project._id}`)}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View Report
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-[#57606a]">
            <div className="mb-3">
              <Search className="h-8 w-8 mx-auto text-[#8c959f]" />
            </div>
            <h3 className="text-base font-semibold mb-1">
              No matching projects found
            </h3>
            <p className="text-sm">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
