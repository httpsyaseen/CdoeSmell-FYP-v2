"use client";

import { useState, useEffect } from "react";
import { FileCode, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Smell {
  smellType: string;
  fileName: string;
  filePath: string;
  startLine: number;
  endLine: number;
  category: string;
  weight: number;
  _id: string;
}

interface FileData {
  fileName: string;
  content: string;
  _id: string;
}

interface CodeEditorProps {
  fileData: FileData[];
  smells: Smell[];
}

export default function CodeEditor({ fileData, smells }: CodeEditorProps) {
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);

  useEffect(() => {
    if (fileData.length > 0) {
      setSelectedFile(fileData[0]);
    }
  }, [fileData]);

  const getSmellsForFile = (fileName: string) => {
    return smells.filter((smell) => smell.fileName === fileName);
  };

  const getSmellWeight = (smellType: string) => {
    if (
      smellType.includes("God class") ||
      smellType.includes("Long Method") ||
      smellType.includes("High Cyclomatic Complexity")
    ) {
      return 4; // Red
    } else if (
      smellType.includes("Too Many Methods") ||
      smellType.includes("Throwing Raw Exception Types")
    ) {
      return 3; // Yellow
    } else {
      return 1; // Green
    }
  };

  const getSmellColor = (weight: number) => {
    switch (weight) {
      case 4:
        return "border-red-500 bg-red-50";
      case 3:
        return "border-yellow-500 bg-yellow-50";
      case 1:
        return "border-green-500 bg-green-50";
      default:
        return "";
    }
  };

  const getSmellBadgeColor = (weight: number) => {
    switch (weight) {
      case 4:
        return "bg-red-100 text-red-800 border-red-200";
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 1:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderFileContent = () => {
    if (!selectedFile) return null;

    const lines = selectedFile.content.split("\n");
    const fileSmells = getSmellsForFile(selectedFile.fileName);

    // Create a map to track which lines should show smell titles
    const smellTitles: Record<number, Smell> = {};

    // Create a map to track which lines should be highlighted
    const highlightedLines: Record<number, { smell: Smell; isStart: boolean }> =
      {};

    // Process each smell to determine highlighting and title placement
    fileSmells.forEach((smell) => {
      // Add the smell title to the start line
      smellTitles[smell.startLine] = smell;

      // Determine how many lines to highlight
      const smellRange = smell.endLine - smell.startLine;
      const highlightEndLine =
        smellRange > 3 ? smell.startLine + 3 : smell.endLine;

      // Mark lines for highlighting
      for (let i = smell.startLine; i <= highlightEndLine; i++) {
        highlightedLines[i] = {
          smell,
          isStart: i === smell.startLine,
        };
      }
    });

    return (
      <div className="text-xs font-mono relative">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const highlight = highlightedLines[lineNumber];
          const smellTitle = smellTitles[lineNumber];

          const smellClasses = highlight
            ? `border-l-4 ${getSmellColor(highlight.smell.weight)}`
            : "";

          return (
            <div key={lineNumber} className="relative">
              {smellTitle && (
                <div className="absolute right-4 -top-6 z-10">
                  <div
                    className={`
                    px-3 py-1 rounded-t-md border shadow-sm font-medium
                    ${getSmellBadgeColor(highlight.smell.weight)}
                  `}
                  >
                    <div className="flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      <span>{smellTitle.smellType}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className={cn("flex", smellClasses)}>
                <div className="w-12 text-right pr-4 select-none text-gray-400 border-r border-gray-200 flex-shrink-0">
                  {lineNumber}
                </div>
                <div className="pl-4 whitespace-pre-wrap break-all flex-grow text-xs py-0.5">
                  {line || " "}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
      {/* GitHub-like header */}
      <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileCode className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {selectedFile?.fileName || "Select a file"}
          </span>
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* File explorer */}
        <div className="w-64 border-r overflow-y-auto bg-gray-50">
          <div className="p-2">
            {fileData.map((file) => (
              <div
                key={file._id}
                className={cn(
                  "flex items-center p-2 cursor-pointer hover:bg-gray-200 rounded-md text-sm",
                  selectedFile?._id === file._id ? "bg-blue-100" : ""
                )}
                onClick={() => setSelectedFile(file)}
              >
                <FileCode className="h-4 w-4 mr-2 text-gray-500" />
                <span className="truncate">{file.fileName}</span>
                {getSmellsForFile(file.fileName).length > 0 && (
                  <span className="ml-auto bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full">
                    {getSmellsForFile(file.fileName).length}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Code content */}
        <div className="flex-1 overflow-auto">
          {selectedFile ? (
            <div className="relative pt-6">{renderFileContent()}</div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a file to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
