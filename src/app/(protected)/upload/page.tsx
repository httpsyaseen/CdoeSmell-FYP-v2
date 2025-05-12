"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, Upload, X, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function UploadProjectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Project data state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Team members state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    projectName?: string;
    projectDescription?: string;
    file?: string;
    submission?: string;
  }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (
      file &&
      (file.type === "application/zip" || file.name.endsWith(".zip"))
    ) {
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, file: undefined }));
    } else {
      setErrors((prev) => ({ ...prev, file: "Please upload a ZIP file" }));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout) clearTimeout(searchTimeout);

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchTimeout(setTimeout(() => fetchUsers(value), 500));
  };

  const fetchUsers = async (query: string) => {
    try {
      const { data } = await api.get(`/user/userinfo/${query}`);
      setSearchResults(data.user ? [data.user] : []);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addMember = (user: any) => {
    if (!selectedMembers.some((member) => member.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
      setSearchResults((prev) =>
        prev.filter((result) => result.id !== user.id)
      );
    }
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((member) => member.id !== userId));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!projectName.trim()) newErrors.projectName = "Project name is required";
    if (!projectDescription.trim())
      newErrors.projectDescription = "Description is required";
    if (!selectedFile) newErrors.file = "ZIP file required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", projectName);
      formData.append("description", projectDescription);
      formData.append("project", selectedFile as Blob);
      formData.append(
        "members",
        JSON.stringify(selectedMembers.map((m) => m.id))
      );

      const { data } = await api.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project/create-project`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      router.push(`/report/${data.project._id}`);
    } catch (error: any) {
      console.error("Project creation failed:", error);
      setErrors((prev) => ({
        ...prev,
        submission: error.response?.data?.message || "Project creation failed",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="container py-8 mx-auto dark:bg-[#040820]">
      <div className="flex items-center gap-2 mb-6 max-w-xl mx-auto">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Upload New Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-xl mx-auto">
        {/* Project Details Card */}
        <Card className="dark:bg-[#0f142a]">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={cn(
                  "dark:bg-[#E5EFFF0D] dark:placeholder:text-[#E5EFFFAD]",
                  errors.projectName && "border-destructive"
                )}
              />
              {errors.projectName && (
                <p className="text-destructive text-sm">{errors.projectName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className={cn(
                  "dark:bg-[#E5EFFF0D] dark:placeholder:text-[#E5EFFFAD]",
                  errors.projectDescription && "border-destructive"
                )}
              />
              {errors.projectDescription && (
                <p className="text-destructive text-sm">
                  {errors.projectDescription}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Upload Card */}
        <Card className="dark:bg-[#0f142a]">
          <CardContent className="pt-6 space-y-4">
            <Label>
              Project File <span className="text-destructive">*</span>
            </Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
                "dark:bg-[#E5EFFF0D] transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25",
                errors.file && "border-destructive/50"
              )}
              {...{
                onDragOver: handleDragOver,
                onDragLeave: handleDragLeave,
                onDrop: handleDrop,
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">
                  {selectedFile ? selectedFile.name : "Drag & Drop ZIP file"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {selectedFile
                    ? `${(selectedFile.size / 1e6).toFixed(2)} MB`
                    : "or click to browse"}
                </p>
              </div>
            </div>
            {errors.file && (
              <p className="text-destructive text-sm">{errors.file}</p>
            )}
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card className="dark:bg-[#0f142a]">
          <CardContent className="pt-6 space-y-4">
            <Label>Team Members</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 dark:bg-[#E5EFFF0D]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {searchQuery.length > 1 && (
              <Card className="mt-2 dark:bg-[#3a4255]">
                <CardContent className="p-0">
                  {isSearching ? (
                    <div className="py-4 flex-center">
                      <Loader2 className="animate-spin text-muted-foreground" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ScrollArea className="max-h-48">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="p-2 flex-between cursor-pointer hover:bg-muted dark:bg-[#0F172A]"
                          onClick={() => addMember(user)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.photo} alt={user.name} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-muted-foreground text-xs">
                                @
                                {user.username ||
                                  user.name.toLowerCase().replace(/\s+/g, "_")}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Add
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground">
                      <p>No users found</p>
                      <p className="text-xs mt-1">Try different search terms</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedMembers.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium text-sm">
                  Selected Members ({selectedMembers.length})
                </h3>
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-2 flex-between rounded-md border dark:bg-[#040820]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.photo} alt={member.name} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-muted-foreground text-xs">
                          @
                          {member.username ||
                            member.name.toLowerCase().replace(/\s+/g, "_")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => removeMember(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {errors.submission && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {errors.submission}
          </div>
        )}

        <Button
          type="submit"
          className="w-full dark:bg-[#126ed3] dark:text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Project...
            </>
          ) : (
            "Create Project"
          )}
        </Button>
      </form>
    </div>
  );
}
