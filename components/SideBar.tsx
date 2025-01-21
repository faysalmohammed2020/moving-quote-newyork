"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { sidebarItems, SidebarItem } from "@/app/(main)/data/SideBarData";
import { LuArrowLeftFromLine, LuArrowRightToLine } from "react-icons/lu";

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const pathname = usePathname();
  const isActive = (path: string): boolean => pathname === path;

  return (
    <aside
      className={`flex flex-col shrink-0 h-full ${
        isCollapsed ? "w-[72px]" : "w-72"
      } transition-width duration-500 bg-slate-800 overflow-x-hidden`}
    >
      {/* Toggle Button */}
      <div className="p-4 text-right">
        <button
          onClick={toggleMenu}
          className="text-white focus:outline-none transform transition-transform duration-300"
        >
          {isCollapsed ? (
            <LuArrowRightToLine className="size-6 font-extrabold flex justify-center text-center" />
          ) : (
            <LuArrowLeftFromLine className="size-6 flex justify-end font-extrabold" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 grow overflow-y-auto overflow-x-hidden hide-scrollbar">
        <ul className="space-y-3">
          {sidebarItems.map((item: SidebarItem) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex py-2 px-2 items-center font-medium ${
                isCollapsed ? "gap-0" : "gap-3"
              } whitespace-nowrap ${
                isActive(item.href)
                  ? "bg-cyan-600 rounded-xl w-full text-white"
                  : "hover:text-white text-white/80"
              }`}
            >
              <div>{item.icon}</div>
              <li className={`text-md ${isCollapsed ? "hidden" : "block"}`}>
                {item.label}
              </li>
            </Link>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
