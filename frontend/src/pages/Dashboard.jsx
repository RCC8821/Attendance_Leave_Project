import React, { useState } from "react";
import { User, LogOut, Menu, X, Home, Bell, Search, CheckCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import your components (make sure these files exist in your project)
import Profile from "../components/Profile";
import LeaveData from "../components/LeaveData";
import AttendanceData from "../components/AttendanceData";
import Employees from "../components/Employees";

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("userType") === "Admin";
  const ManagerName = localStorage.getItem("userType");

  const handleLogout = () => {
    setIsLoggedOut(true);
    navigate("/");
  };

  const menuItems = [
    { id: "employees", name: "Employees", icon: User }, // Moved to top
    ...(isAdmin ? [{
      id: "dashboard",
      name: "Attendance Data",
      icon: CheckCircle,
    }] : [{
      id: "dashboard",
      name: "Dashboard",
      icon: Home,
    }]),
    { id: "leave", name: "Leave Data", icon: Calendar },
    // Removed "profile" button
  ];

  const renderContent = () => {
    switch (currentPage) {
      case "profile":
        return <Profile />;
      case "leave":
        return <LeaveData />;
      case "dashboard":
        return isAdmin ? <AttendanceData /> : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Dashboard</h3>
            <p className="text-gray-600">Welcome to your dashboard!</p>
          </div>
        );
      case "employees":
        return  <Employees />;
      default:
        return null;
    }
  };

  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center text-white max-w-md w-full border border-white/20">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Logged Out</h2>
          <p className="text-white/80">You have been successfully logged out.</p>
          <button
            onClick={() => setIsLoggedOut(false)}
            className="mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out
        ${sidebarHovered ? "lg:w-64" : "lg:w-20"}`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center p-6 border-b border-gray-100 transition-all duration-300
            ${sidebarHovered ? "justify-between" : "lg:justify-center"}`}
          >
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl mb-4 shadow-lg">
                <img src="rcc-logo.png" />
              </div>
              <h1
                className={`text-xl font-bold text-gray-800 transition-all duration-300 whitespace-nowrap
                ${sidebarHovered ? "lg:opacity-100" : "lg:opacity-0 lg:w-0 lg:overflow-hidden"}`}
              >
                Dashboard
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                      ${
                        currentPage === item.id
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }
                      ${!sidebarHovered ? "lg:justify-center" : ""}`}
                    title={!sidebarHovered ? item.name : ""}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span
                      className={`font-medium transition-all duration-300 whitespace-nowrap
                      ${
                        sidebarHovered
                          ? "lg:opacity-100"
                          : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                      }`}
                    >
                      {item.name}
                    </span>
                    {!sidebarHovered && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap hidden lg:block">
                        {item.name}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-gray-100">
            <div
              className={`flex items-center mb-4 transition-all duration-300
              ${sidebarHovered ? "space-x-3" : "lg:justify-center lg:space-x-0"}`}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div
                className={`transition-all duration-300 whitespace-nowrap
                ${
                  sidebarHovered
                    ? "lg:opacity-100"
                    : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                }`}
              >
                <p className="font-semibold text-gray-800">{ManagerName}</p>
                <p className="text-sm text-gray-600">{isAdmin ? "Admin" : "User"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group relative
                ${sidebarHovered ? "space-x-3" : "lg:justify-center lg:space-x-0"}`}
              title={!sidebarHovered ? "Logout" : ""}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span
                className={`font-medium transition-all duration-300 whitespace-nowrap
                ${
                  sidebarHovered
                    ? "lg:opacity-100"
                    : "lg:opacity-0 lg:w-0 lg:overflow-hidden"
                }`}
              >
                Logout
              </span>
              {!sidebarHovered && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap hidden lg:block">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800 capitalize">
                {currentPage === "dashboard" && isAdmin ? "Attendance Data" : currentPage}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="relative p-2 rounded-xl hover:bg-gray-100">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;