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
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <LuLayoutDashboard className="size-6" />,
  },

  // Blog Management
  {
    href: "/admin/dashboard/BlogManagement",
    label: "Blog Management",
    icon: <FaPenFancy className="size-6" />,
  },

  // Comments Moderation
  // {
  //   href: "/Dashboard/comments",
  //   label: "Comments Moderation",
  //   icon: <HiOutlineUserGroup className="size-6" />,
  // },

  // Analytics
  // {
  //   href: "/Dashboard/analytics",
  //   label: "Analytics",
  //   icon: <AiOutlineBarChart className="size-6" />,
  // },

  // Media Library
  // {
  //   href: "/Dashboard/media-library",
  //   label: "Media Library",
  //   icon: <FiImage className="size-6" />,
  // },

  // User Management
  // {
  //   href: "/Dashboard/user-management",
  //   label: "User Management",
  //   icon: <HiOutlineUserGroup className="size-6" />,
  // },

  
];
