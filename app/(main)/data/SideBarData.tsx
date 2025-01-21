import { JSX } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import {  FiImage } from "react-icons/fi";
// import { RiArticleLine } from "react-icons/ri";
import { HiOutlineUserGroup } from "react-icons/hi";
import { AiOutlineBarChart, AiOutlineSetting } from "react-icons/ai";
import { MdOutlineSettings } from "react-icons/md";
import { FaPenFancy } from "react-icons/fa";

// Define the structure of each sidebar item
export interface SidebarItem {
  href: string;
  label: string;
  icon: JSX.Element;
}

// Sidebar items list
export const sidebarItems: SidebarItem[] = [
  // Dashboard
  {
    href: "/Dashboard",
    label: "Dashboard",
    icon: <LuLayoutDashboard className="size-6" />,
  },

  // Blog Management
  {
    href: "/Dashboard/BlogManagement",
    label: "Blog Management",
    icon: <FaPenFancy className="size-6" />,
  },

  // Comments Moderation
  {
    href: "/dashboard/comments",
    label: "Comments Moderation",
    icon: <HiOutlineUserGroup className="size-6" />,
  },

  // Analytics
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: <AiOutlineBarChart className="size-6" />,
  },

  // Media Library
  {
    href: "/dashboard/media-library",
    label: "Media Library",
    icon: <FiImage className="size-6" />,
  },

  // User Management
  {
    href: "/dashboard/user-management",
    label: "User Management",
    icon: <HiOutlineUserGroup className="size-6" />,
  },

  // SEO Settings
  {
    href: "/dashboard/seo-settings",
    label: "SEO Settings",
    icon: <AiOutlineSetting className="size-6" />,
  },

  // Site Settings
  {
    href: "/dashboard/site-settings",
    label: "Site Settings",
    icon: <MdOutlineSettings className="size-6" />,
  },
];
