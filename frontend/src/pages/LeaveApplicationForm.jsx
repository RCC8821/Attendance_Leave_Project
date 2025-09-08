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
import employees from "../assets/LeaveFromData";

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
    department: "", // Replaced sites with department
    approvalManager: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const departments = [ // Replaced sites array with departments
  "Agrawal Ji Site/अग्रवाल जी साइट",
    "Ahuja Ji Site/आहूजा जी साइट",
    "Chandanpura Site/चंदनपुरा साइट",
    "Choudhary Ji Site/चौधरी जी साइट",
    "Dr. Manish Jain Site/डॉ. मनीष जैन साइट",
    "Dr. Shrikant Jain Site/डॉ. श्रीकांत जैन साइट",
    "Dubey Ji Site/दुबे जी साइट",
    "Hira Hardware/हीरा हार्डवेयर",
    "Piyush Goenka/ पियूष गोयनका",
    "Rajeev Abbot. Ji Site/राजीव एबोट. जी साइट",
    "Rajesh Gupta Ji Site/राजेश गुप्‍ता जी साइट",
    "Rana Ji Site/राणा जी साइट",
    "Rcc Office/आरसीसी कार्यालय",
    "RNTU/आरएनटीयू",
    "Scope College/स्‍कॉप कॉलेज",
    "Shahpura B-280/शाहपुरा बी-280",
    "The Address A66/द एड्रेस",
    "Wallia Ji App/वालिया जी अपा",
    "Wallia Ji Commercial/वालिया जी कर्मशियल",
    "Wallia Ji House/वालिया जी हाउस",
  ]; // Add more departments as needed

  const leaveTypes = [
    "Sick leave (Illness or Injury)/बीमारी की छुट्टी (बीमारी या चोट)",
    "Personal leave/व्यक्तिगत अवकाश",
    "Emergency leave/आपातकालीन अवकाश",
    "Leave without pay/बिना वेतन छुट्टी",
  ];

  const timeSlots = [
    "Before Lunch Half day/लंच से पहले",
    "After Lunch Half day/लंच के बाद",
    "Full day/पूरा दिन",
  ];

  // Calculate days between dates
  const calculateDays = (fromDate, toDate, timeSlot) => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (from > to) return "";
      const diffTime = Math.abs(to - from);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (timeSlot.includes("Half day") && fromDate === toDate) {
        return 0.5;
      }
      return diffDays >= 1 ? diffDays : 1;
    }
    return "";
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-fill manager and employee code when employee is selected
      if (name === "name") {
        const selectedEmployee = employees.find((emp) => emp.name.toLowerCase() === value.toLowerCase());
        newData.empCode = selectedEmployee ? selectedEmployee.empCode : "";
        newData.approvalManager = selectedEmployee ? selectedEmployee.leaveApprovalManager : "";
      }

      // Auto-calculate days when dates or time slot change
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
      "department", // Replaced sites with department
    ];
    const isFormValid = requiredFields.every((field) => formData[field]);

    if (!isFormValid) {
      setErrorMessage(
        "कृपया सभी आवश्यक फ़ील्ड भरें / Please fill all required fields"
      );
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      setErrorMessage(
        "अंतिम तारीख शुरुआती तारीख के बाद होनी चाहिए / End date must be after start date"
      );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("https://final-attendance-leave-dashboard.onrender.com/api/leave-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          empCode: formData.empCode,
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          shift: formData.timeSlot,
          typeOfLeave: formData.leaveType,
          reason: formData.reason,
          days: formData.days,
          approvalManager: formData.approvalManager,
          department: formData.department, // Replaced sites with department
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit leave form");
      }

      setShowSuccessModal(true);
      // Reset form after successful submission
      setFormData({
        name: "",
        empCode: "",
        leaveType: "",
        reason: "",
        days: "",
        fromDate: "",
        toDate: "",
        timeSlot: "",
        department: "", // Replaced sites with department
        approvalManager: "",
      });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        `फॉर्म सबमिट करने में त्रुटि: ${error.message} / Error submitting form: ${error.message}`
      );
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
      department: "", // Replaced sites with department
      approvalManager: "",
    });
    setErrorMessage("");
    setShowSuccessModal(false);
  };

  // Get today's date for min date validation
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800  p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-t-2xl p-6 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-2">
           <img src="rcc-logo.png" className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg"/>
            <h1 className="text-2xl md:text-3xl font-bold">
              Leave Request Form
            </h1>
          </div>
          <p className="text-sm md:text-base text-blue-100">
             Leave request कम से कम 3 दिन पहले डालना ज़रूरी है।
            <br />
            सिर्फ emergency leave को ही same day पर approve किया जाएगा।
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-b-2xl shadow-2xl p-6 md:p-8">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2 text-red-700">
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

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                    min={today}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                    min={formData.fromDate || today}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    aria-required="true"
                  />
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
                  Department / विभाग <span className="text-red-500">*</span> // Replaced Site with Department
                </label>
                <select
                  name="department" // Replaced sites with department
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  required
                  aria-required="true"
                >
                  <option value="">Choose Department</option> // Updated label
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
                disabled={loading}
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
                {formData.fromDate && formData.toDate && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-blue-800 font-semibold">
                      Leave Duration:{" "}
                      {new Date(formData.fromDate).toLocaleDateString()} to{" "}
                      {new Date(formData.toDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
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