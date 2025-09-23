import React, { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { Link } from "react-router-dom";

const AttendanceData = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch("https://attendance-leave-project.onrender.com/api/getAttendance-Data", {

          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (result.data) {
          console.log(result.data)
          setAttendanceData(result.data);
        } else {
          setError(result.error || "No attendance data available");
        }
      } catch (err) {
        setError("Failed to fetch attendance data");
      }
    };
    fetchAttendanceData();
  }, []);

  const handleActionClick = (entry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
    setStatus("");
    setRemarks("");
  };

  const handleSave = async () => {
    if (!status) {
      alert("Please select a status");
      return;
    }
    try {
      const payload = {
        status,
        attendanceId: selectedEntry?.attendanceId,
        remarks,
      };

      const response = await fetch("https://attendance-leave-project.onrender.com/api/updateAttendance", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error((await response.json()).error || "Update failed");
      }

      const Response = await fetch("https://attendance-leave-project.onrender.com/api/getAttendance-Data", {

        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const refreshedResult = await refreshedResponse.json();
      if (refreshedResult.data) {
        setAttendanceData(refreshedResult.data);
      }
    } catch (err) {
      setError(err.message || "Update failed. Please try again.");
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h2>
        <p className="text-blue-100">Manage attendance data here.</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Attendance Data</h3>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {attendanceData.length === 0 && !error && (
          <p className="text-gray-600">Loading...</p>
        )}
        {attendanceData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Date",
                    "Employee Name",
                    "Employee Code",
                    "Department",
                    "Entry Type",
                    "work Shift",
                    "ImageUrl",
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
                {attendanceData.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.Timestamp || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.Name || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.EnpCode || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.site || ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.EntryType || ""}</td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.checkOutTime || ""}</td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.workShift || ""}</td>
                    <Link to={entry.imageUrl || ""} > <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">View PDF</td> </Link>
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
            <h3 className="text-xl font-bold text-gray-800 mb-4">Attendance Approval</h3>
            <div className="space-y-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceData;