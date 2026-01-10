
import { useState, useEffect, useRef } from "react";
import { Camera, MapPin, Clock, User, Mail, Building, CheckCircle, XCircle, Loader2 } from "lucide-react";

function AttendanceForm() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    empCode: "",
    site: "",
    entryType: "",
    workShift: "",
    locationName: "",
    image: null,
  });

  const [userData, setUserData] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [nearbyOffices, setNearbyOffices] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({
    hasCheckedIn: false,
    hasCheckedOut: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const reloadTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const offices = [
    { name: "Home", lat: 23.231878, lng: 77.455833 },
    { name: "Office/कार्यालय", lat: 23.19775059819785, lng: 77.41701272524529 },
    { name: "RNTU/आरएनटीयू", lat: 23.135181, lng: 77.563744 },
    { name: "Dubey Ji Site/दुबे जी साइट", lat: 23.124046, lng: 77.497393 },
    { name: "Madhav Gupta Ji/माधव गुप्ता जी", lat: 23.1714257, lng: 77.427868 },
    { name: "Dr.Shrikant Jain Site/डॉ. श्रीकांत जैन साइट", lat: 23.186214, lng: 77.428280 },
    { name: "Dr.Manish Jain Site/डॉ. मनीष जैन साइट", lat: 23.215016, lng: 77.426319 },
    { name: "Rana Ji Site/राणा जी साइट", lat: 23.182188, lng: 77.454757 },
    { name: "Rajeev Abbot. Ji Site/राजीव एबोट. जी साइट", lat: 23.263392, lng: 77.457032 },
    { name: "Piyush Goenka/ पियूष गोयनका", lat: 23.234808, lng: 77.395521 },
    { name: "Wallia Ji Commercial/वालिया जी कर्मशियल", lat: 23.184511, lng: 77.462847 },
    { name: "Wallia Ji Appartment/वालिया जी अपार्टमेन्‍ट", lat: 23.181771, lng: 77.432712 },
    { name: "Ahuja Ji Site/आहूजा जी साइट", lat: 23.214686, lng: 77.438693 },
    { name: "Scope College/स्‍कॉप कॉलेज", lat: 23.152594, lng: 77.478894 },
  ];

  const isSpecificRCC = formData.site.toLowerCase() === "rcc office/आरसीसी कार्यालय".toLowerCase();

  // ==================== SIMPLE 5 MINUTE AUTO-RELOAD ====================
  useEffect(() => {
    // Start 5 minute countdown timer
    const startCountdown = () => {
      countdownTimerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up - reload the page
            clearInterval(countdownTimerRef.current);
            console.log("5 minutes completed. Reloading page...");
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // Start the countdown immediately
    startCountdown();

    // Clear timer on component unmount
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
      }
    };
  }, []); // Empty dependency array - runs only once on mount

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ==================== ATTENDANCE STATUS FETCH ====================
  const fetchAttendanceStatus = async (email) => {
    if (!email || typeof email !== 'string' || !userData.some((user) => user.email && user.email.toLowerCase() === email.toLowerCase())) {
      console.log('Invalid email or user not found:', email);
      setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
      return;
    }

    try {
      console.log('Fetching attendance status for email:', email);

      // Generate date in YYYY-MM-DD format
      const now = new Date();
      const istOptions = {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };
      const yyyyMMddFormatter = new Intl.DateTimeFormat("en-CA", istOptions); // YYYY-MM-DD
      const [year, month, day] = yyyyMMddFormatter.format(now).split('-');
      const yyyyMMddDate = `${year}-${month}-${day}`; // e.g., "2025-10-03"
      console.log("Generated date (YYYY-MM-DD):", yyyyMMddDate);

      // Try YYYY-MM-DD first
      let url = `https://attendance-leave-project.onrender.com/api/attendance?email=${encodeURIComponent(email)}&date=${yyyyMMddDate}`;
      console.log("Trying API URL (YYYY-MM-DD):", url);
      let response = await fetch(url, { cache: 'no-store' });

      let records = [];
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error with YYYY-MM-DD:", response.status, response.statusText, errorText);

        // Fallback to DD/MM/YYYY
        const ddMMyyyyFormatter = new Intl.DateTimeFormat("en-IN", istOptions); // DD/MM/YYYY
        const ddMMyyyyDate = ddMMyyyyFormatter.format(now); // e.g., "03/10/2025"
        console.log("Falling back to DD/MM/YYYY:", ddMMyyyyDate);
        url = `https://attendance-leave-project.onrender.com/api/attendance?email=${encodeURIComponent(email)}&date=${ddMMyyyyDate}`;
        response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          const errorText2 = await response.text();
          throw new Error(`Failed to fetch attendance records: ${response.status} ${response.statusText}. Details: ${errorText2}`);
        }
      }

      records = await response.json();
      console.log("API Response:", records);

      const hasCheckedIn = records.some((record) => {
        const entryType = record.EntryType?.trim().toLowerCase();
        const site = record.site?.trim().toLowerCase();
        return entryType === "in" && site === "rcc office/आरसीसी कार्यालय".toLowerCase();
      });

      const hasCheckedOut = records.some((record) => {
        const entryType = record.EntryType?.trim().toLowerCase();
        const site = record.site?.trim().toLowerCase();
        return entryType === "out" && site === "rcc office/आरसीसी कार्यालय".toLowerCase();
      });

      console.log("Attendance Status:", { hasCheckedIn, hasCheckedOut });
      setAttendanceStatus({ hasCheckedIn, hasCheckedOut });
    } catch (error) {
      console.error("Error fetching attendance status:", error.message, error.stack);
      setErrorMessage(`Error fetching attendance status: ${error.message.split("Details:")[1]?.trim() || error.message}`);
      setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
    }
  };

  // ==================== USEEFFECT HOOKS ====================
  // Fetch user data on mount
  useEffect(() => {
    const init = async () => {
      try {
        setIsDataLoading(true);
        const res = await fetch("https://attendance-leave-project.onrender.com/api/DropdownUserData", {
          cache: 'no-store',
          priority: 'high'
        });
        const apiData = await res.json();
        console.log("API Response:", apiData);

        if (!apiData.success) {
          throw new Error(apiData.error || "Failed to fetch user data");
        }

        const normalizedData = apiData.data.map((row) => ({
          name: row["Names"] || "",
          empCode: row["EMP Code"] || "",
          mobile: row["Mobile No."] || "",
          email: row["Email"] || "",
          site: row["Sites"] || "",
        }));

        const usersWithEmail = normalizedData.filter(
          (user) => user.email && typeof user.email === 'string'
        );
        console.log("Users with email:", usersWithEmail);

        if (usersWithEmail.length === 0) {
          setErrorMessage("No user data with emails available. Please contact support.");
        }

        setUserData(usersWithEmail);
        setFilteredEmails(usersWithEmail);

        const uniqueSites = [
          ...new Set(normalizedData.map((user) => user.site).filter((site) => site && site !== "N/A"))
        ];
        console.log("Unique sites:", uniqueSites);
        setFilteredSites(uniqueSites);

        if (uniqueSites.length === 0) {
          console.warn("No valid Sites data received");
          setErrorMessage("No site data available. Please contact the administrator.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorMessage("Failed to load user data from API. Please try again later.");
      } finally {
        setIsDataLoading(false);
      }
    };

    init();
  }, []);

  // Fetch attendance status when email or site changes
  useEffect(() => {
    if (formData.email && isSpecificRCC) {
      fetchAttendanceStatus(formData.email);
    } else {
      setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
    }
  }, [formData.email, formData.site]);

  // Reset form fields when email changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      entryType: "",
      locationName: "",
      image: null,
    }));
    setCapturedImage(null);
    setNearbyOffices([]);
  }, [formData.email]);

  // ==================== EVENT HANDLERS ====================
  const handleEmailSelect = (email) => {
    const today = new Date().toISOString().split('T')[0];
    const storedEmail = localStorage.getItem('userEmail');

    if (storedEmail && storedEmail.toLowerCase() !== email.toLowerCase()) {
      setErrorMessage("Another email is already used for today's attendance. Please use the same email.");
      return;
    }

    const user = userData.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        name: user.name,
        empCode: user.empCode,
        site: user.site,
        entryType: "",
        workShift: "",
        locationName: "",
        image: null,
      }));
      setFilteredEmails(userData);
      setIsEmailDropdownOpen(false);
      setErrorMessage("");
      localStorage.setItem('userEmail', user.email);
      fetchAttendanceStatus(user.email);
    } else {
      setErrorMessage("Selected email is not valid. Please choose from the dropdown.");
    }
  };

  const handleEmailSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFormData((prev) => ({ ...prev, email: e.target.value }));

    if (searchTerm === "") {
      setFilteredEmails(userData);
    } else {
      const filtered = userData.filter(
        (user) => user.email && typeof user.email === 'string' && user.email.toLowerCase().includes(searchTerm)
      );
      setFilteredEmails(filtered);
    }
    setIsEmailDropdownOpen(true);
  };

  const handleEmailFocus = () => {
    setFilteredEmails(userData);
    setIsEmailDropdownOpen(true);
  };

  const handleEmailBlur = () => {
    setTimeout(() => {
      setIsEmailDropdownOpen(false);
    }, 300);
  };

  const handleSiteSelect = (site) => {
    setFormData((prev) => ({
      ...prev,
      site,
      entryType: "",
      locationName: "",
      image: null,
    }));
    setFilteredSites([]);
    setCapturedImage(null);
    setNearbyOffices([]);
    setIsSiteDropdownOpen(false);
    if (formData.email) {
      fetchAttendanceStatus(formData.email);
    }
  };

  const handleSiteSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFormData((prev) => ({ ...prev, site: e.target.value }));

    const uniqueSites = [...new Set(userData.map((user) => user.site).filter((site) => site && site !== "N/A"))];
    const filtered = uniqueSites.filter((site) => site.toLowerCase().includes(searchTerm));
    setFilteredSites(filtered);
    setIsSiteDropdownOpen(true);
  };

  const handleSiteFocus = () => {
    const uniqueSites = [...new Set(userData.map((user) => user.site).filter((site) => site && site !== "N/A"))];
    setFilteredSites(uniqueSites);
    setIsSiteDropdownOpen(true);
  };

  const handleSiteBlur = () => {
    setTimeout(() => setIsSiteDropdownOpen(false), 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleGetNearbyOffices = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          console.log("Current location:", userLat, userLng);

          const filteredOffices = offices.filter(
            (office) => calculateDistance(userLat, userLng, office.lat, office.lng) <= 300
          );
          setNearbyOffices(filteredOffices);

          const nearbyOfficeNames = filteredOffices.map((office) => office.name).join(", ");
          setFormData((prev) => ({
            ...prev,
            locationName: nearbyOfficeNames || "No offices within 300m",
          }));
          setLocationLoading(false);
        },
        (error) => {
          console.error("Error fetching location:", error.message);
          setErrorMessage("Unable to fetch your location. Please enable geolocation.");
          setFormData((prev) => ({
            ...prev,
            locationName: "Location access denied",
          }));
          setLocationLoading(false);
        }
      );
    } else {
      setErrorMessage("Geolocation is not supported by this browser.");
      setFormData((prev) => ({
        ...prev,
        locationName: "Geolocation not supported",
      }));
      setLocationLoading(false);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err.message);
      setErrorMessage("Unable to access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.toBlob((blob) => {
        setFormData((prev) => ({ ...prev, image: blob }));
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
      }, "image/jpeg");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  const toBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    const requiredFields = {
      email: "Email Address",
      name: "Name",
      empCode: "Emp Code",
      site: "Site",
      entryType: "Entry Type",
      workShift: "Work Shift",
      locationName: "Location Name",
      image: "Image",
    };

    const missingFields = Object.keys(requiredFields).filter((key) => !formData[key] || formData[key] === "");
    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map((key) => requiredFields[key]).join(", ");
      setErrorMessage(`Please fill in all required fields: ${missingFieldNames}`);
      setIsSubmitting(false);
      return;
    }

    const user = userData.find((user) => user.email && user.email.toLowerCase() === formData.email.toLowerCase());
    if (!user) {
      setErrorMessage("Invalid email. Please select a valid email from the suggestions.");
      setIsSubmitting(false);
      return;
    }

    if (user.name !== formData.name || user.empCode !== formData.empCode) {
      setErrorMessage("Name or Employee Code does not match the selected email.");
      setIsSubmitting(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail && storedEmail.toLowerCase() !== formData.email.toLowerCase()) {
      setErrorMessage("Another email is already used for today's attendance. Please use the same email.");
      setIsSubmitting(false);
      return;
    }

    // Refetch status before submit to ensure latest from API
    await fetchAttendanceStatus(formData.email);

    const { hasCheckedIn, hasCheckedOut } = attendanceStatus;

    if (isSpecificRCC) {
      if (formData.entryType === "Out" && !hasCheckedIn) {
        setErrorMessage("You must Check In before Checking Out.");
        setIsSubmitting(false);
        return;
      }
      if (formData.entryType === "In" && hasCheckedIn) {
        setErrorMessage("You have already checked in today.");
        setIsSubmitting(false);
        return;
      }
      if (formData.entryType === "Out" && hasCheckedOut) {
        setErrorMessage("You have already checked out today.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const imageBase64 = await toBase64(formData.image);
      const payload = {
        email: formData.email,
        name: formData.name,
        empCode: formData.empCode,
        site: formData.site,
        entryType: formData.entryType,
        workShift: formData.workShift,
        locationName: formData.locationName,
        image: imageBase64,
      };

      const response = await fetch("https://attendance-leave-project.onrender.com/api/attendance-Form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (response.ok && responseData.result === "success") {
        setSuccessMessage(`Attendance ${formData.entryType === "In" ? "Check In" : "Check Out"} submitted successfully!`);
        setShowSuccess(true);

        localStorage.setItem('userEmail', formData.email);
        await fetchAttendanceStatus(formData.email);

        setTimeout(() => setShowSuccess(false), 3000);

        // Reset form after successful submission
        setFormData({
          email: "",
          name: "",
          empCode: "",
          site: "",
          entryType: "",
          workShift: "",
          locationName: "",
          image: null,
        });
        setNearbyOffices([]);
        setCapturedImage(null);
        setFilteredEmails(userData);
        setFilteredSites([]);
        setIsEmailDropdownOpen(false);
        setIsSiteDropdownOpen(false);
        setErrorMessage("");
        setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
      } else {
        setErrorMessage(
          `Error submitting attendance: ${responseData.error || "Please try again."}${responseData.details ? ` (${responseData.details})` : ""}`
        );
      }
    } catch (error) {
      console.error("Error submitting attendance:", error.message, error.stack);
      setErrorMessage(`Error submitting attendance: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allEntryTypes = [
    { value: "In", label: "Check In" },
    { value: "Out", label: "Check Out" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400 flex items-center space-x-3 max-w-sm">
              <CheckCircle className="w-6 h-6 animate-bounce" />
              <div>
                <p className="font-semibold text-sm">Success!</p>
                <p className="text-xs opacity-90">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Auto-reload Timer Indicator */}
        <div className="fixed top-4 right-4 z-30">
          <div className="bg-black bg-opacity-80 text-white px-4 py-3 rounded-xl flex flex-col items-center shadow-lg">
            <div className="text-xs text-gray-300 mb-1">Auto-reload in</div>
            <div className="text-xl font-bold text-yellow-300">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-xs text-gray-400 mt-1">mm:ss</div>
          </div>
        </div>

        {/* Data Loading Overlay */}
        {isDataLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 max-w-sm mx-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading User Data</h3>
                <p className="text-gray-600 text-sm">Please wait while we fetch user information...</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submitting Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 max-w-sm mx-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitting Attendance</h3>
                <p className="text-gray-600 text-sm">Please wait while we process your request...</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <img src="rcc-logo.png" className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg" alt="RCC Logo" />
          <h1 className="text-3xl font-bold text-white">Attendance Form</h1>
          <p className="text-white mt-2">Mark your attendance with ease</p>
          <p className="text-yellow-200 text-sm mt-1">
            Page auto-reloads every 5 minutes
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}

            {filteredEmails.length === 0 && !formData.email && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-700 text-sm">
                  No valid email suggestions available. Please contact support.
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span>Email Address <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.email}
                    onChange={handleEmailSearch}
                    onFocus={handleEmailFocus}
                    onBlur={handleEmailBlur}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pl-11"
                    placeholder="Click to select email..."
                    autoComplete="off"
                  />
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  {formData.email && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, email: "", name: "", empCode: "", site: "" }));
                        setFilteredEmails(userData);
                        setIsEmailDropdownOpen(false);
                        setErrorMessage("");
                        setAttendanceStatus({ hasCheckedIn: false, hasCheckedOut: false });
                      }}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                  {isEmailDropdownOpen && filteredEmails.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredEmails.map((user) => (
                        <div
                          key={user.email}
                          onMouseDown={() => handleEmailSelect(user.email)}
                          className="px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">
                            {user.name || '(No name)'} - {user.empCode || '(No emp code)'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Emp Code Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>Name <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>Emp Code <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={formData.empCode}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                    readOnly
                  />
                </div>
              </div>

              {/* Site Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Building className="w-4 h-4 text-indigo-500" />
                  <span>Site <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.site}
                    onChange={handleSiteSearch}
                    onFocus={handleSiteFocus}
                    onBlur={handleSiteBlur}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pl-11"
                    placeholder="Type to search site..."
                    autoComplete="off"
                  />
                  <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  {formData.site && isSiteDropdownOpen && filteredSites.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredSites.map((site) => (
                        <div
                          key={site}
                          onMouseDown={() => handleSiteSelect(site)}
                          className="px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          {site}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Entry Type and Work Shift Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <CheckCircle className="w-4 h-4 text-indigo-500" />
                    <span>Entry Type <span className="text-red-500">*</span></span>
                  </label>
                  {isSpecificRCC && attendanceStatus.hasCheckedIn && attendanceStatus.hasCheckedOut ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-green-700 text-sm">You have completed Check In and Check Out for today.</p>
                    </div>
                  ) : (
                    <select
                      name="entryType"
                      value={formData.entryType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none bg-white"
                    >
                      <option value="">-- Select Entry Type --</option>
                      {(() => {
                        let entryOptions = allEntryTypes;
                        if (isSpecificRCC) {
                          entryOptions = allEntryTypes.filter(type => {
                            if (type.value === "In" && !attendanceStatus.hasCheckedIn) return true;
                            if (type.value === "Out" && attendanceStatus.hasCheckedIn && !attendanceStatus.hasCheckedOut) return true;
                            return false;
                          });
                        }
                        return entryOptions.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ));
                      })()}
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>Work Shift <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    name="workShift"
                    value={formData.workShift}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none bg-white"
                  >
                    <option value="">-- Select Work Shift --</option>
                    <option value="09:00 AM - 06:00 PM">09:00 AM - 06:00 PM</option>
                    <option value="09:30 AM - 06:00 PM">09:30 AM - 06:00 PM</option>
                    <option value="02:00 PM - 06:00 PM">02:00 PM - 06:00 PM</option>
                    <option value="09:00 PM - 01:00 PM">09:00 PM - 01:00 PM</option>
                    <option value="08:00 AM - 04:00 PM">08:00 AM - 04:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span>Location Name <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.locationName}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 pl-11"
                    placeholder="Click 'Get Nearby Offices' to populate"
                    readOnly
                  />
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={handleGetNearbyOffices}
                  disabled={locationLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Getting Location...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      <span>Get Nearby Offices</span>
                    </>
                  )}
                </button>
              </div>

              {/* Camera Section */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>Capture Image <span className="text-red-500">*</span></span>
                </label>
                {!isCameraOpen && !capturedImage && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Open Camera</span>
                  </button>
                )}
                {isCameraOpen && (
                  <div className="space-y-3">
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                      <video ref={videoRef} className="w-full h-64 object-cover" playsInline />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={takePhoto}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                )}
                {capturedImage && (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-64 object-cover rounded-xl border-2 border-green-200"
                      />
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Image Captured</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Retake Photo
                    </button>
                  </div>
                )}
                <canvas ref={canvasRef} width="640" height="480" className="hidden" />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full px-6 py-4 font-semibold rounded-xl shadow-lg transition-all duration-200 ${
                    isSubmitting
                      ? "bg-indigo-400 text-white cursor-wait"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105"
                  } flex items-center justify-center space-x-2`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Attendance</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            © 2025 Attendance Portal. Secure & Reliable.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Page reloads automatically every 5 minutes
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AttendanceForm;