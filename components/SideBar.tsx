"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { sidebarItems, SidebarItem } from "@/app/(main)/data/SideBarData";
import { LuArrowLeftFromLine, LuArrowRightToLine } from "react-icons/lu";
import { FiLogOut } from "react-icons/fi";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/lib/auth-client";

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const toggleMenu = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    signOut({
      redirect: true,
      callbackUrl: "/sign-in",
    });
  };

  const isActive = (path: string): boolean => pathname === path;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user role with proper formatting
  const getUserRole = () => {
    if (!session?.user?.role) return "User";
    return session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1).toLowerCase();
  };

  // Show expanded state when hovered, even if collapsed
  const expandedWidth = isHovered && isCollapsed ? "w-64" : isCollapsed ? "w-20" : "w-72";

  return (
    <aside
      className={`flex flex-col shrink-0 h-full ${expandedWidth} transition-all duration-300 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden relative border-r border-slate-700`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Area */}
      <div className="p-5 border-b border-slate-700 flex items-center justify-between">
        <div className={`flex items-center ${isCollapsed && !isHovered ? "justify-center w-full" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {(!isCollapsed || isHovered) && (
            <h1 className="text-white font-semibold text-lg ml-3 whitespace-nowrap">Admin Portal</h1>
          )}
        </div>
        
        {/* Toggle Button - Only show when not hovered in collapsed state */}
        {(!isCollapsed || !isHovered) && (
          <button
            onClick={toggleMenu}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <LuArrowRightToLine className="w-4 h-4" />
            ) : (
              <LuArrowLeftFromLine className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 grow overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {sidebarItems.map((item: SidebarItem) => {
            // Check if the user has access to this menu item based on role
            if (item.roles && session?.user?.role && !item.roles.includes(session.user.role)) {
              return null;
            }
            
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center py-3 px-4 font-medium rounded-xl transition-all duration-200 group ${
                    active
                      ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 border-l-4 border-cyan-400"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  } ${isCollapsed && !isHovered ? "justify-center" : ""}`}
                >
                  <div className={`${active ? "text-cyan-400" : "text-slate-400 group-hover:text-white"} transition-colors`}>
                    {item.icon}
                  </div>
                  {(!isCollapsed || isHovered) && (
                    <span className={`ml-3 transition-opacity duration-300 ${isCollapsed && isHovered ? "opacity-100" : "opacity-100"}`}>
                      {item.label}
                    </span>
                  )}
                  {active && (!isCollapsed || isHovered) && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User & Logout Section */}
      <div className="p-4 border-t border-slate-700">
        <div className={`flex items-center ${isCollapsed && !isHovered ? "justify-center" : "justify-between"}`}>
          {(!isCollapsed || isHovered) && session?.user && (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-blue-700 flex items-center justify-center text-white font-medium text-sm">
                {getUserInitials()}
              </div>
              <div className="ml-3">
                <p className="text-white text-sm font-medium truncate max-w-[120px]">
                  {session.user.name || "User"}
                </p>
                <p className="text-slate-400 text-xs">
                  {getUserRole()}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Logout"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hover indicator for collapsed state */}
      {isCollapsed && !isHovered && (
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
          <div className="w-1 h-10 bg-cyan-500 rounded-l-lg"></div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;