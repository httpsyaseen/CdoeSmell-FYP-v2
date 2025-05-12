"use client";

import { CodeIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiArrowRight } from "react-icons/hi";
import { HiUser } from "react-icons/hi2";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="w-full sticky top-0 z-[99] flex px-10 backdrop-blur-2xl justify-between h-16 bg-background/95 border-b items-center">
      <div className="flex gap-2 items-center">
        <CodeIcon className="h-6 w-6 text-primary" />
        <h1 className="font-bold text-xl">CodeScent</h1>
      </div>

      <div className="flex gap-2 items-center">
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex gap-2 items-center">
                <span className="text-lg font-semibold">{user?.name}</span>
                {user?.photo ? (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden cursor-pointer">
                    <Image
                      src={user.photo}
                      alt="User profile"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-transparent hover:bg-transparent p-0 hidden md:flex items-center gap-2 cursor-pointer">
                    <span className="flex items-center justify-center size-9 bg-[#04609E] dark:bg-gray-700 rounded-full overflow-hidden">
                      <HiUser size={24} color="white" />
                    </span>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="bg-transparent hover:bg-transparent p-0 hidden md:flex items-center gap-2">
            <span className="flex items-center justify-center size-9 bg-[#04609E] dark:bg-gray-700 rounded-full overflow-hidden">
              <HiUser size={24} color="white" />
            </span>
            <span className="text-black dark:text-white hidden xl:flex ">
              <HiArrowRight size={24} />
            </span>
            <span className="sr-only">Login/Signup</span>
          </div>
        )}
      </div>
    </nav>
  );
}
