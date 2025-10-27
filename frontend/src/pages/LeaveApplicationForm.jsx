
import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";

// Date utility functions from the first code
const formatDateToDDMMYYYY = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDDMMYYYYToISO = (ddmmyyyy) => {
  if (!ddmmyyyy || !ddmmyyyy.includes("/")) return "";
  try {
    const [day, month, year] = ddmmyyyy.split("/");
    const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";
    return isoDate;
  } catch {
    return "";
  }
};

const validateDDMMYYYY = (value) => {
  if (!value || typeof value !== "string") return false;
  const pattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  if (!pattern.test(value)) return false;

  const isoDate = parseDDMMYYYYToISO(value);
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

// Days calculation from the first code
const calculateDays = (fromDateStr, toDateStr, timeSlot) => {
  if (!fromDateStr || !toDateStr) return "";

  const fromISO = parseDDMMYYYYToISO(fromDateStr);
  const toISO = parseDDMMYYYYToISO(toDateStr);

  if (!fromISO || !toISO) return "";

  const fromDate = new Date(fromISO);
  const toDate = new Date(toISO);

  if (fromDate > toDate) return "";

  const diffTime = Math.abs(toDate - fromDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const isHalfDay = timeSlot && (
    timeSlot.includes("Half day") || timeSlot.includes("आधा दिन")
  );

  if (fromDateStr === toDateStr && isHalfDay) {
    return "0.5";
  }

  return diffDays.toString();
};

const LeaveApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    empCode: "",
    leaveType: "",
    reason: "",
    days: "",
    fromDate: "",
    toDate: "",
    timeSlot: "",
    department: "",
    approvalManager: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const leaveTypes = [
    "Sick leave (Illness or Injury)/बीमारी की छुट्टी (बीमारी या चोट)",
    "Personal leave/व्यक्तिगत अवकाश",
    "Emergency leave/आपातकालीन अवकाश",
    "Leave without pay/बिना वेतन छुट्टी",
  ];

  const timeSlots = [
    "Before Lunch Half day/लंच से पहले आधा दिन",
    "After Lunch Half day/लंच के बाद आधा दिन",
    "Full day/पूरा दिन",
  ];

  // Fetch employee data from API
  useEffect(() => {
    const fetchEmployeeData = async () => {
      setFetchLoading(true);
      try {
        const response = await fetch("https://attendance-leave-project.onrender.com/api/DropdownUserData");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch employee data");
        }

        const formattedEmployees = data.data.map((item) => ({
          name: item["Names"] || "",
          empCode: item["EMP Code"] || "",
          leaveApprovalManager: item["Leave Approval Manager"] || "",
          department: item["Sites"] || "",
        }));

        setEmployees(formattedEmployees);
        const uniqueDepartments = [
          ...new Set(formattedEmployees.map((emp) => emp.department).filter((dept) => dept.trim())),
        ];
        setDepartments(uniqueDepartments);
        setErrorMessage("");
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setErrorMessage(`Failed to load employee data: ${error.message}`);
        setEmployees([]);
        setDepartments([]);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-fill empCode, approvalManager, and department when name is selected
      if (name === "name") {
        const selectedEmployee = employees.find(
          (emp) => emp.name.toLowerCase() === value.toLowerCase()
        );
        newData.empCode = selectedEmployee ? selectedEmployee.empCode : "";
        newData.approvalManager = selectedEmployee
          ? selectedEmployee.leaveApprovalManager
          : "";
        newData.department = selectedEmployee ? selectedEmployee.department : "";
      }

      // Recalculate days when dates or time slot change
      if (name === "fromDate" || name === "toDate" || name === "timeSlot") {
        newData.days = calculateDays(
          name === "fromDate" ? value : newData.fromDate,
          name === "toDate" ? value : newData.toDate,
          name === "timeSlot" ? value : newData.timeSlot
        );
      }

      return newData;
    });
    setErrorMessage("");
  };

  // Handle date picker change to convert ISO to DD/MM/YYYY
  const handleDatePickerChange = (name, isoDate) => {
    if (!isoDate) {
      setFormData((prev) => ({
        ...prev,
        [name]: "",
        days: "",
      }));
      setErrorMessage("");
      return;
    }

    const ddmmyyyy = formatDateToDDMMYYYY(isoDate);
    setFormData((prev) => {
      const newData = { ...prev, [name]: ddmmyyyy };

      if (name === "fromDate" || name === "toDate") {
        const otherDate = name === "fromDate" ? prev.toDate : prev.fromDate;
        newData.days = calculateDays(
          name === "fromDate" ? ddmmyyyy : otherDate,
          name === "toDate" ? ddmmyyyy : otherDate,
          prev.timeSlot
        );
      }

      return newData;
    });
    setErrorMessage("");
  };

  // Get min date for toDate
  const getToDateMin = () => {
    if (formData.fromDate) {
      return parseDDMMYYYYToISO(formData.fromDate);
    }
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const requiredFields = [
      "name",
      "leaveType",
      "reason",
      "fromDate",
      "toDate",
      "timeSlot",
      "department",
    ];
    const missing = requiredFields.filter((field) => !formData[field]?.trim());

    if (missing.length > 0) {
      setErrorMessage(`Please fill: ${missing.join(", ")}`);
      return;
    }

    // Validate dates
    if (!validateDDMMYYYY(formData.fromDate) || !validateDDMMYYYY(formData.toDate)) {
      setErrorMessage("Please select valid dates");
      return;
    }

    const fromISO = parseDDMMYYYYToISO(formData.fromDate);
    const toISO = parseDDMMYYYYToISO(formData.toDate);
    const fromDate = new Date(fromISO);
    const toDate = new Date(toISO);

    if (fromDate > toDate) {
      setErrorMessage("To date must be after From date");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const submitData = {
        name: formData.name.trim(),
        empCode: formData.empCode.trim(),
        department: formData.department.trim(),
        fromDate: formData.fromDate.trim(), // DD/MM/YYYY format
        toDate: formData.toDate.trim(),     // DD/MM/YYYY format
        shift: formData.timeSlot.trim(),
        typeOfLeave: formData.leaveType.trim(),
        reason: formData.reason.trim(),
        days: formData.days || "0",
        approvalManager: formData.approvalManager.trim(),
      };

      const response = await fetch("https://attendance-leave-project.onrender.com/api/leave-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit leave form");
      }

      setShowSuccessModal(true);
      setFormData({
        name: "",
        empCode: "",
        leaveType: "",
        reason: "",
        days: "",
        fromDate: "",
        toDate: "",
        timeSlot: "",
        department: "",
        approvalManager: "",
      });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(`Error submitting form: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setFormData({
      name: "",
      empCode: "",
      leaveType: "",
      reason: "",
      days: "",
      fromDate: "",
      toDate: "",
      timeSlot: "",
      department: "",
      approvalManager: "",
    });
    setErrorMessage("");
    setShowSuccessModal(false);
  };

  // Get today's date for min date validation
  const todayISO = new Date().toISOString().split("T")[0];
  const todayFormatted = formatDateToDDMMYYYY(todayISO);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-t-2xl p-6 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img
              src="/rcc-logo.png"
              className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg"
              alt="RCC Logo"
            />
            <h1 className="text-2xl md:text-3xl font-bold">
              Leave Request Form
            </h1>
          </div>
          <p className="text-sm md:text-base text-blue-100">
            <strong>Date Format:</strong> DD/MM/YYYY (e.g., {todayFormatted})
            <br />
            Leave request कम से कम 3 दिन पहले डालना ज़रूरी है।
            <br />
            सिर्फ emergency leave को ही same day पर approve किया जाएगा।
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-b-2xl shadow-2xl p-6 md:p-8">
          {/* Loading and Error Messages */}
          {fetchLoading && (
            <div
              className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg flex items-center gap-2 text-blue-700"
              role="alert"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading employee and department data...</span>
            </div>
          )}
          {errorMessage && (
            <div
              className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2 text-red-700"
              role="alert"
            >
              <X className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4" />
                  Full Name / पूरा नाम <span className="text-red-500">*</span>
                </label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  required
                  aria-required="true"
                  disabled={fetchLoading || employees.length === 0}
                >
                  <option value="">Choose Employee</option>
                  {employees.map((employee) => (
                    <option key={employee.empCode} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4" />
                  Employee Code / कर्मचारी कोड
                </label>
                <input
                  type="text"
                  name="empCode"
                  value={formData.empCode}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Clock className="w-4 h-4" />
                Type of Leave / छुट्टी का प्रकार{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                required
                aria-required="true"
              >
                <option value="">Choose Leave Type</option>
                {leaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" />
                Reason for Leave / छुट्टी का कारण{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white resize-none"
                placeholder="Please provide detailed reason for your leave..."
                required
                aria-required="true"
              />
            </div>

            {/* Date Range */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Leave Duration / छुट्टी की अवधि
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Select dates using calendar picker (displays as DD/MM/YYYY)
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={parseDDMMYYYYToISO(formData.fromDate)}
                      onChange={(e) => handleDatePickerChange("fromDate", e.target.value)}
                      min={todayISO}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                      aria-required="true"
                    />
                    {formData.fromDate && (
                      <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                        <span className="text-sm text-gray-500">
                          {formData.fromDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={parseDDMMYYYYToISO(formData.toDate)}
                      onChange={(e) => handleDatePickerChange("toDate", e.target.value)}
                      min={getToDateMin()}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                      aria-required="true"
                    />
                    {formData.toDate && (
                      <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                        <span className="text-sm text-gray-500">
                          {formData.toDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Number of Days
                  </label>
                  <input
                    type="text"
                    name="days"
                    value={formData.days}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    readOnly
                    aria-readonly="true"
                  />
                </div>
              </div>
            </div>

            {/* Time Slot and Department */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Clock className="w-4 h-4" />
                  AM/PM/All day <span className="text-red-500">*</span>
                </label>
                <select
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  required
                  aria-required="true"
                >
                  <option value="">Choose Time Slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4" />
                  Department / विभाग <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  required
                  aria-required="true"
                  disabled={fetchLoading || departments.length === 0}
                >
                  <option value="">Choose Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Approval Manager */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4" />
                Leave Approval Manager / अवकाश स्वीकृति प्रबंधक
              </label>
              <input
                type="text"
                name="approvalManager"
                value={formData.approvalManager}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                readOnly
                aria-readonly="true"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || fetchLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    📤 Submit Application
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                🔄 Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 transform animate-in fade-in zoom-in duration-300">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  ✅ Application Submitted Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your leave application has been submitted and is pending
                  approval.
                </p>
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-blue-800 font-semibold">
                    Leave Duration: {formData.fromDate} to {formData.toDate}
                  </p>
                  <p className="text-blue-800">Days: {formData.days}</p>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApplicationForm;