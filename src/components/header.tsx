"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiUser, HiOutlineUser } from "react-icons/hi2";
import { LogOutIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="bg-[#f6f9fb] w-full sticky top-0 z-[99] flex px-10 backdrop-blur-2xl justify-between h-16 border-b items-center">
      <div className="flex gap-2 items-center">
        <Image
          src={"/logo.png"}
          className="object-cover h-6 w-6"
          height={24}
          width={24}
          alt="Logo"
        />
        <h1 className="font-semibold text-xl">Code Doctor</h1>
      </div>

      <div className="flex gap-2 items-center">
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex gap-2 items-center cursor-pointer">
                <span className="text-lg font-semibold">{user?.name}</span>
                {user?.photo ? (
                  <div className="relative h-9 w-9 rounded-full overflow-hidden bg-[#04609E] dark:bg-gray-700 flex items-center justify-center">
                    <Image
                      src={user.photo}
                      alt="User profile"
                      width={36}
                      height={36}
                      className="object-cover h-full w-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center size-9 bg-[#04609E] dark:bg-gray-700 rounded-full overflow-hidden">
                    <HiUser size={24} color="white" />
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40 mt-2 rounded-md shadow-md p-1 bg-white dark:bg-gray-900">
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
              >
                <HiOutlineUser
                  className="text-gray-600 dark:text-gray-300"
                  size={18}
                />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-md cursor-pointer"
              >
                <LogOutIcon className="text-red-500" size={18} />
                <span className="text-red-500">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="bg-transparent hover:bg-transparent p-0 hidden md:flex items-center gap-2">
            <span className="flex items-center justify-center size-9 bg-[#0366d6] dark:bg-gray-700 rounded-full overflow-hidden">
              <HiUser size={24} color="white" />
            </span>
            <span className="sr-only">Login/Signup</span>
          </div>
        )}
      </div>
    </nav>
  );
}
