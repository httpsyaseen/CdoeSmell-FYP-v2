"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Clock, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

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

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  console.log(projects);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Retrieve token from cookies

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
    return <div className="container mx-auto py-8 px-20">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto dark:bg-[#040820] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Projects</h1>
        <Button
          className="flex items-center gap-2 dark:bg-[#3a4255] dark:text-white"
          onClick={() => router.push("/upload")}
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="relative mb-8 ">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-white" />
        <Input
          placeholder="Search projects..."
          className="pl-10 w-full md:max-w-md dark:bg-[#282f41] dark:text-white dark:placeholder:text-white"
          aria-label="Search projects"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card
            key={project._id}
            className="overflow-hidden dark:bg-[#0F172A] shadow-md pb-3 "
          >
            <CardHeader className="pb-2 ">
              <h2 className="text-xl font-bold">{project.title}</h2>
              <p className="text-muted-foreground text-sm line-clamp-2 dark:text-white">
                {project.description}
              </p>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm font-medium mb-1">Team</p>
                  <div className="flex -space-x-2">
                    {project?.members?.map((member) => (
                      <Avatar
                        key={member.id}
                        className="border-2 border-background h-8 w-8"
                      >
                        <AvatarImage
                          src={member.photo || "/placeholder.svg"}
                          alt={member.name}
                        />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {project.members.length > 3 && (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium border-2 border-background">
                        +{project.members.length - 3}
                      </div>
                    )}
                    {project.members.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No team members
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium mb-1">Total Smells</p>
                  <div className="flex items-center justify-end">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                    <span className="font-semibold">{project.totalSmells}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center text-sm text-muted-foreground dark:text-white">
                <Clock className="h-4 w-4 mr-1" color="white" />
                <span>Updated {formatDate(project.lastUpdated)}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="dark:bg-[#126ed3] bg-primary text-white dark:text-white cursor-pointer"
                onClick={() => router.push(`/report/${project._id}`)}
              >
                View Report
              </Button>
            </CardFooter>
          </Card>
        ))}
        {filteredProjects.length === 0 && (
          <p className="text-center text-muted-foreground col-span-full">
            No projects found matching your search.
          </p>
        )}
      </div>
    </main>
  );
}
