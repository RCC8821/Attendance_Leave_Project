import React from "react";
import { User } from "lucide-react";

const Profile = () => {
    const isManager = localStorage.getItem("userType"); // Get userType from localStorage
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{isManager}</h3>
            <p className="text-gray-600">Manager</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold">john.doe@example.com</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-semibold">+1 234 567 8900</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;