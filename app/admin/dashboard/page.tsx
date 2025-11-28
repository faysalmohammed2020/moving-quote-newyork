'use client'

import AdminDashboard from "@/components/AdminDashboard";
import {  Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
const DashboardPage: React.FC = () => {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  return (
    <div>
      {/* Header */}
       <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </header>
      <AdminDashboard />
    </div>
  );
};

export default DashboardPage;
