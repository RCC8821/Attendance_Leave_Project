import React, { useState, useEffect } from "react";
import { User, Plus, Search, Filter, Users, UserCheck, Calendar, Mail, Building, Briefcase, Phone, MapPin, Edit, Trash2, X } from "lucide-react";

// Enhanced AddEmployee component with all inputs
const AddEmployee = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    Names: '',
    Email: '',
    Department: '',
    Designation: '',
    Phone: '',
    Address: '',
    JoiningDate: '',
    Salary: '',
    Status: 'present'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Names.trim()) newErrors.Names = 'Name is required';
    if (!formData.Email.trim()) newErrors.Email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) newErrors.Email = 'Invalid email format';
    if (!formData.Department.trim()) newErrors.Department = 'Department is required';
    if (!formData.Designation.trim()) newErrors.Designation = 'Designation is required';
    if (!formData.Phone.trim()) newErrors.Phone = 'Phone number is required';
    if (!formData.Address.trim()) newErrors.Address = 'Address is required';
    if (!formData.JoiningDate) newErrors.JoiningDate = 'Joining date is required';
    if (!formData.Salary.trim()) newErrors.Salary = 'Salary is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Add New Employee</h3>
              <p className="text-blue-100 mt-1">Fill in the employee details below</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="Names"
                  value={formData.Names}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    errors.Names ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.Names && <p className="text-red-500 text-xs mt-1">{errors.Names}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    errors.Email ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    errors.Phone ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.Phone && <p className="text-red-500 text-xs mt-1">{errors.Phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="Status"
                  value={formData.Status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="present">Present</option>
                  <option value="leave">On Leave</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea
                name="Address"
                value={formData.Address}
                onChange={handleInputChange}
                rows="3"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  errors.Address ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter complete address"
              />
              {errors.Address && <p className="text-red-500 text-xs mt-1">{errors.Address}</p>}
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
              Professional Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <input
                  type="text"
                  name="Department"
                  value={formData.Department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    errors.Department ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="e.g., Engineering, Marketing"
                />
                {errors.Department && <p className="text-red-500 text-xs mt-1">{errors.Department}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                <input
                  type="text"
                  name="Designation"
                  value={formData.Designation}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    errors.Designation ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="e.g., Software Engineer, Manager"
                />
                {errors.Designation && <p className="text-red-500 text-xs mt-1">{errors.Designation}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date *</label>
                <input
                  type="date"
                  name="JoiningDate"
                  value={formData.JoiningDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    errors.JoiningDate ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.JoiningDate && <p className="text-red-500 text-xs mt-1">{errors.JoiningDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary *</label>
                <input
                  type="number"
                  name="Salary"
                  value={formData.Salary}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    errors.Salary ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter salary amount"
                />
                {errors.Salary && <p className="text-red-500 text-xs mt-1">{errors.Salary}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-3xl border-t border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Employee'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dynamic stats data
  const [statsData, setStatsData] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
  });

  useEffect(() => {
    // Fetch data from the backend
    const fetchEmployees = async () => {
      try {

        const response = await fetch("https://attendance-leave-project.onrender.com/api/getEmployees");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const { data } = await response.json();
        
        // Assuming status is not provided in the backend data, set a default or derive it
        const enrichedData = data.map((employee, index) => ({
          id: index + 1, // Generate a unique ID (since backend doesn't provide one)
          ...employee,
          status: "present", // Default status (modify based on your logic)
          Phone: employee.Phone || "+1 234 567 8900",
          Address: employee.Address || "123 Main St, City, State",
          JoiningDate: employee.JoiningDate || "2024-01-15",
          Salary: employee.Salary || "50000"
        }));

        setEmployees(enrichedData);
        
        // Update stats
        setStatsData({
          totalEmployees: enrichedData.length,
          presentToday: enrichedData.filter((e) => e.status === "present").length,
          onLeave: enrichedData.filter((e) => e.status === "leave").length,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.Names.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.Department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveEmployee = (newEmployeeData) => {
    const newEmployee = {
      id: employees.length + 1,
      ...newEmployeeData,
      status: newEmployeeData.Status
    };
    
    setEmployees(prev => [...prev, newEmployee]);
    
    // Update stats
    setStatsData(prev => ({
      totalEmployees: prev.totalEmployees + 1,
      presentToday: newEmployee.status === "present" ? prev.presentToday + 1 : prev.presentToday,
      onLeave: newEmployee.status === "leave" ? prev.onLeave + 1 : prev.onLeave,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Employees */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {statsData.totalEmployees}
              </div>
              <div className="text-gray-500 font-medium text-sm uppercase tracking-wider">
                Total Employees
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-full"></div>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {statsData.presentToday}
              </div>
              <div className="text-gray-500 font-medium text-sm uppercase tracking-wider">
                Present Today
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
              style={{ width: `${statsData.totalEmployees ? (statsData.presentToday / statsData.totalEmployees) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {statsData.onLeave}
              </div>
              <div className="text-gray-500 font-medium text-sm uppercase tracking-wider">
                On Leave
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
              style={{ width: `${statsData.totalEmployees ? (statsData.onLeave / statsData.totalEmployees) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Employee Management Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with Add Button */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>Employee Management</span>
              </h3>
              <p className="text-gray-600 text-sm mt-1">Manage your team members and their information</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Employee</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors duration-200">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600 font-medium">Filter</span>
            </button>
          </div>
        </div>

        {/* Employee List - New Card Style */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading employees...</p>
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">No Employees Found</h4>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "Start by adding your first employee"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full -translate-y-6 translate-x-6"></div>
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors duration-200">
                          {employee.Names}
                        </h4>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            employee.status === "present"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {employee.status === "present" ? "Present" : "On Leave"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Employee Details */}
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="truncate">{employee.Email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2 text-green-500" />
                      <span>{employee.Department}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                      <span>{employee.Designation}</span>
                    </div>
                    {employee.Phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-orange-500" />
                        <span>{employee.Phone}</span>
                      </div>
                    )}
                    {employee.Address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                        <span className="truncate">{employee.Address}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200 relative z-10">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>ID: #{employee.id}</span>
                      {employee.JoiningDate && (
                        <span>Joined: {new Date(employee.JoiningDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Employee Count Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <p className="text-sm text-gray-600 text-center">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddForm && (
        <AddEmployee 
          onClose={() => setShowAddForm(false)} 
          onSave={handleSaveEmployee}
        />
      )}
    </div>
  );
};

export default Employees;
