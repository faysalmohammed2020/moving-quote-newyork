import Sidebar from "@/components/SideBar";
import React, { ReactNode } from "react";


interface DashboardLayoutProps {
  children: ReactNode; // Accepts nested routes or pages as children
}

const Layout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-auto h-screen flex-shrink-0 bg-white">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-grow p-4 max-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
