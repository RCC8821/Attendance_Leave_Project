import React, { useState, useEffect } from "react";
import { Edit } from "lucide-react";

const LeaveData = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [leaveError, setLeaveError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [status, setStatus] = useState("");
  const [approvedDays, setApprovedDays] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { type: "success"|"error", message: string }

  const isManager = localStorage.getItem("userType"); // Get userType from localStorage

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {

        const response = await fetch("https://attendance-leave-project.onrender.com/api/getFormData", {

          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();

        if (result.data) {
          console.log("Fetched leave data:", result.data);
          const filteredData = isManager === "Admin"
            ? result.data
            : result.data.filter((entry) => entry.APPROVALMANAGER === isManager);
          setLeaveData(filteredData);
        } else {
          setLeaveError(result.error || "No data available");
        }
      } catch (err) {
        setLeaveError("Failed to fetch leave data");
      }
    };
    fetchLeaveData();
  }, []);

  const handleActionClick = (entry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
    setStatus("");
    setApprovedDays("");
    setNotification(null); // Clear previous notifications
  };

  const handleSave = async () => {
  if (!status) {
    alert("Please select Approve or Reject");
    return;
  }
  if (status === "Approved" && (!approvedDays || isNaN(approvedDays) || approvedDays <= 0)) {
    alert("Please enter a valid number of approved days (greater than 0)");
    return;
  }

  // Debug: Log selectedEntry to inspect its structure
  console.log("selectedEntry:", selectedEntry);

  // Ensure selectedEntry exists
  if (!selectedEntry) {
    alert("No entry selected. Please select a leave request.");
    console.log("selectedEntry is null or undefined");
    return;
  }

  setIsLoading(true); // Show loading state
  setNotification(null); // Clear previous notifications

  try {
    const payload = {
      Approved: status, // Send "Approved" or "Rejected"
      leaveDays: status === "Approved" ? parseInt(approvedDays) : 0, // Send leaveDays, 0 if Rejected
      EMPCODE: selectedEntry.EMPCODE || "" // Use EMPCODE as the key
    };

    // Debug: Log the payload to verify
    console.log("Payload:", payload);

    // Validate EMPCODE
    if (!payload.EMPCODE) {
      setIsLoading(false);
      alert("Employee code (EMPCODE) is missing. Please ensure the selected entry has a valid employee code.");
      console.log("Possible field names in selectedEntry:", Object.keys(selectedEntry));
      return;
    }


    const response = await fetch("https://attendance-leave-project.onrender.com/api/Approve-leave", {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Update failed");
    }

    // Update the local state to remove the processed entry
    setLeaveData((prevData) =>
      prevData.filter((entry) => entry.EMPCODE !== selectedEntry.EMPCODE)
    );

    // Show success notification
    setNotification({
      type: "success",
      message: `Leave ${status} Successfully`,
    });

    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  } catch (err) {
    console.error("Error in handleSave:", err);
    setNotification({
      type: "error",
      message: err.message || "Update failed. Please try again.",
    });
    // Clear error notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  } finally {
    setIsLoading(false);
    setModalOpen(false);
  }
};

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Leave Data</h3>
        {leaveError && <div className="text-red-500 mb-4">{leaveError}</div>}
        {leaveData.length === 0 && !leaveError && (
          <p className="text-gray-600">Loading...</p>
        )}
        {leaveData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "TIMESTAMP",
                    "Employee Name",
                    "Employee Code",
                    "Department",
                    "Leave Type",
                    "Reason",
                    "Shift",
                    "From Date",
                    "To Date",
                    "Approved Days",
                    "Approval Manager",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveData.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.TIMESTAMP || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.NAME || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.EMPCODE || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.DEPARTMENT || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.TYPEOFLEAVE || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.REASON || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.SHIFT || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.DATEFROM || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.DATETO || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.APPROVEDDAY || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.APPROVALMANAGER || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleActionClick(entry)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Leave Approval</h3>
            <div className="space-y-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                disabled={isLoading}
              >
                <option value="">Select Status</option>
                <option value="Approved">Approve</option>
                <option value="Rejected">Reject</option>
              </select>
              {status === "Approved" && (
                <input
                  type="number"
                  value={approvedDays}
                  onChange={(e) => setApprovedDays(e.target.value)}
                  placeholder="Number of Approved Days"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  min="1"
                  disabled={isLoading}
                />
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveData;