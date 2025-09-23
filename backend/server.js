const express = require("express");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const { error } = require("console");
// Load environment variables from .env file
dotenv.config();
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from React frontend
app.use(express.json());

// Check if all required environment variables are set
const requiredEnvVars = [
  "GOOGLE_TYPE",
  "GOOGLE_PROJECT_ID",
  "GOOGLE_PRIVATE_KEY_ID",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_CLIENT_EMAIL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_AUTH_URI",
  "GOOGLE_TOKEN_URI",
  "GOOGLE_AUTH_PROVIDER_X509_CERT_URL",
  "GOOGLE_CLIENT_X509_CERT_URL",
  "GOOGLE_UNIVERSE_DOMAIN",
  "SPREADSHEET_ID",
  "PORT",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "JWT_SECRET",
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);
if (missingEnvVars.length > 0) {
  console.error("Missing environment variables:", missingEnvVars);
  process.exit(1);
}

// Google Sheets API setup using credentials from .env
const credentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "",
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Google Sheet ID from .env
const spreadsheetId = process.env.SPREADSHEET_ID;
console.log(spreadsheetId);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// // DropDown Users Data Api ///////////////////////////////////////////

app.get("/api/DropdownUserData", async (req, res) => {
  try {
    // Fetch data from Google Sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "ALL DOER NAMES RCC/DIMENSION!A:H",
    });

    const rows = response.data.values || [];
    
    // Check if data exists
    if (rows.length === 0) {
      return res.status(400).json({ error: "No data found in the sheet" });
    }

    // Get headers from first row or use fallback
    let headers = rows[0] || [];
    console.log("Initial headers from row 0:", headers);
    
    if (!headers.length || headers.some((h) => !h || h.trim() === "")) {
      headers = [
        "Names",
        "EMP Code",
        "Mobile No",
        "Email",
        "Leave Approval Manager",
      ];
      console.log("Using fallback headers:", headers);
    } else {
      headers = headers.map((header) => header.trim());
      console.log("Normalized headers:", headers);
    }

    // Process rows (skip header row)
    const data = rows.slice(1).map((row) => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] ? row[index].trim() : '';
      });
      return rowData;
    });

    // Filter out empty rows and validate required fields
    const filteredData = data.filter((row) => 
      row["Names"] && row["Names"].trim() !== ''
    );

    // Return formatted response
    res.status(200).json({
      success: true,
      count: filteredData.length,
      data: filteredData
    });

  } catch (error) {
    console.error("Error fetching data from Google Sheet:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch data from Google Sheet",
      details: error.message
    });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Users!A:C", // Assumes Email (A), Password (B), Type (C)
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(400).json({ error: "No users found in the sheet" });
    }

    // Skip header row and find user by email and password
    const user = rows
      .slice(1)
      .find((row) => row[0] === email && row[1] === password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Get user type from column C (index 2)
    const userType = user[2]; // 'Admin' or 'Employee'
    if (
      ![
        "Admin",
        "Ravindra Singh",
        "Lt Col Mayank Sharma (Retd)",
        "Subhash Patidar",
      ].includes(userType)
    ) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    // Generate JWT token
    const token = jwt.sign({ email, userType }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.json({ token, userType });
  } catch (error) {
    console.error("Error in login:", error.message, error.stack);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
});

// Protected route example
app.get("/api/user", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ email: decoded.email });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Upload to Cloudinary
async function uploadToCloudinary(base64Image, fileName) {
  try {
    console.log("Uploading file to Cloudinary:", fileName);
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        public_id: fileName,
        folder: "AttendanceImages",
      }
    );
    console.log("File uploaded to Cloudinary, URL:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message, error.stack);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
}

// Attendance validation endpoint
app.get("/api/attendance", async (req, res) => {
  try {
    const { email } = req.query;
    console.log("Fetching attendance records for email:", email);

    // Define today and tomorrow in IST
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = "Attendance!A:I"; // Updated range to include imageUrl (A to I columns)

    console.log("Fetching data from Google Sheet");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found in Google Sheet");
      return res.status(404).json({ error: "No data found in Google Sheet" });
    }

    // Assuming first row is headers
    const headers = rows[0];
    console.log("Sheet headers:", headers);
    const emailIndex = headers.indexOf("Email");
    const timestampIndex = headers.indexOf("Timestamp");
    const entryTypeIndex = headers.indexOf("EntryType");

    if (emailIndex === -1 || timestampIndex === -1 || entryTypeIndex === -1) {
      console.error("Required columns not found. Indices:", {
        emailIndex,
        timestampIndex,
        entryTypeIndex,
      });
      return res.status(400).json({
        error:
          "Invalid sheet structure: Email, Timestamp, or EntryType column missing",
      });
    }

    // Filter records from Google Sheet
    let records = rows.slice(1); // Skip header row
    if (email) {
      records = records.filter((row) => row[emailIndex] === email);
      records = records.filter((row) => {
        const recordDate = new Date(row[timestampIndex]);
        return recordDate >= today && recordDate < tomorrow;
      });
    } else {
      records = records.filter((row) => {
        const recordDate = new Date(row[timestampIndex]);
        return recordDate >= today && recordDate < tomorrow;
      });
    }

    // Convert rows to objects for JSON response with entryType
    const formattedRecords = records.map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        if (index === entryTypeIndex) {
          record["entryType"] = row[index] || "";
        } else {
          record[header] = row[index] || "";
        }
      });
      return record;
    });

    console.log("Retrieved records:", formattedRecords);
    res.status(200).json(formattedRecords);
  } catch (error) {
    console.error(
      "Error fetching attendance records:",
      error.message,
      error.stack
    );
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Attendance form submission endpoint
app.post("/api/attendance-Form", async (req, res) => {
  try {
    const {
      email,
      name,
      empCode,
      site,
      entryType,
      workShift,
      locationName,
      image,
    } = req.body;

    console.log("Received attendance data:", {
      email,
      name,
      empCode,
      site,
      entryType,
      workShift,
      locationName,
    });

    // Validate required fields
    if (
      !email ||
      !name ||
      !empCode ||
      !site ||
      !entryType ||
      !workShift ||
      !locationName
    ) {
      console.error("Missing required fields:", {
        email,
        name,
        empCode,
        site,
        entryType,
        workShift,
        locationName,
      });
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    let imageUrl = null;
    if (image) {
      const fileName = `attendance_${email}_${Date.now()}`;
      imageUrl = await uploadToCloudinary(image, fileName);
    }
    const formatTimestamp = (date) => {
      const pad = (num) => String(num).padStart(2, "0");
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };
    // Get current timestamp in ISO format
    const timestamp = formatTimestamp(new Date());

    // Prepare values for Google Sheets
    const values = [
      [
        timestamp,
        email,
        name,
        empCode,
        site,
        entryType,
        workShift,
        locationName,
        imageUrl || "",
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Attendance!A:I",
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    res
      .status(200)
      .json({ result: "success", message: "Attendance recorded successfully" });
  } catch (error) {
    console.error("Error processing attendance:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Get form data endpoint
app.get("/api/getFormData", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "LeaveFrom!A:K",
    });

    const rows = response.data.values || [];
    console.log("Raw rows fetched:", rows);

    if (!rows.length) {
      return res.status(404).json({ error: "No data found in the sheet" });
    }

    // Get headers from row 0, with fallback if invalid
    let headers = rows[0] || [];
    console.log("Initial headers from row 0:", headers);
    if (!headers.length || headers.some((h) => !h || h.trim() === "")) {
      headers = [
        "TIMESTAMP",
        "NAME",
        "EMPCODE",
        "DEPARTMENT",
        "DATEFROM",
        "DATETO",
        "SHIFT",
        "TYPEOFLEAVE",
        "REASON",
        "APPROVEDDAY",
        "APPROVALMANAGER",
      ];
      console.log("Using fallback headers:", headers);
    } else {
      headers = headers.map((header) => header.trim());
      console.log("Normalized headers:", headers);
    }

    const dataRows = rows.slice(1);
    console.log("Data rows (from row 2):", dataRows);

    if (!dataRows.length) {
      return res
        .status(404)
        .json({ error: "No data found starting from row 2" });
    }

    // Map data rows to objects
    const formData = dataRows
      .map((row) => {
        if (!row || row.length === 0) return null;
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] ? row[index].trim() : "";
        });
        return obj;
      })
      .filter((obj) => obj !== null);

    console.log("Form data before filtering:", formData);
    const finalFormData = formData.filter((obj) =>
      Object.values(obj).some((value) => value !== "")
    );

    console.log("Final form data:", finalFormData);
    if (finalFormData.length === 0) {
      return res
        .status(404)
        .json({ error: "No valid data found starting from row 2" });
    }

    return res.json({ data: finalFormData });
  } catch (error) {
    console.error(
      "Error fetching data from Google Sheet:",
      error.message,
      error.stack
    );
    return res
      .status(500)
      .json({ error: "Server error: Failed to fetch data" });
  }
});

// Leave form submission endpoint
app.post("/api/leave-form", async (req, res) => {
  try {
    const {
      name,
      empCode,
      department,
      fromDate,
      toDate,
      shift,
      typeOfLeave,
      reason,
      days,
      approvalManager,
    } = req.body;

    console.log("Received leave form data:", {
      name,
      empCode,
      department,
      fromDate,
      toDate,
      shift,
      typeOfLeave,
      reason,
      days,
      approvalManager,
    });

    // Validate required fields
    const requiredFields = {
      name,
      empCode,
      department,
      fromDate,
      toDate,
      shift,
      typeOfLeave,
      reason,
      days,
      approvalManager,
    };
    const missingFields = Object.keys(requiredFields).filter(
      (key) => !requiredFields[key]
    );

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Verify sheet existence
    const sheetName = "LeaveFrom";
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });
    const sheetExists = spreadsheet.data.sheets.some(
      (sheet) => sheet.properties.title === sheetName
    );
    if (!sheetExists) {
      console.error(`Sheet '${sheetName}' not found in spreadsheet`);
      return res.status(400).json({
        error: "Invalid spreadsheet configuration",
        details: `Sheet '${sheetName}' does not exist in the spreadsheet`,
      });
    }

    // Get current timestamp in ISO format
    const timestamp = new Date().toISOString();

    // Prepare values for Google Sheets
    const values = [
      [
        timestamp,
        name,
        empCode,
        department,
        fromDate,
        toDate,
        shift,
        typeOfLeave,
        reason,
        days,
        approvalManager,
      ],
    ];

    // Append data to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}!A:K`,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    res.status(200).json({
      result: "success",
      message: "Leave form recorded successfully",
    });
  } catch (error) {
    console.error("Error processing leave form:", error.message, error.stack);
    if (error.message.includes("Unable to parse range")) {
      return res.status(400).json({
        error: "Invalid spreadsheet range",
        details:
          "Please ensure the sheet 'LeaveFrom' exists and the range A:K is valid",
      });
    }
    if (error.code === 403) {
      return res.status(403).json({
        error: "Permission denied",
        details:
          "Ensure the service account has edit access to the spreadsheet",
      });
    }
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Get attendance data endpoint
app.get("/api/getAttendance-Data", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Attendance!A:I",
    });

    const rows = response.data.values || [];
    console.log("Raw rows fetched:", rows);

    if (!rows.length) {
      return res.status(404).json({ error: "No data found in the sheet" });
    }

    // Get headers from row 0, with fallback if invalid
    let headers = rows[0] || [];
    console.log("Initial headers from row 0:", headers);
    if (!headers.length || headers.some((h) => !h || h.trim() === "")) {
      headers = [
        "Timestamp",
        "Email",
        "Name",
        "EmpCode",
        "Site",
        "EntryType",
        "WorkShift",
        "LocationName",
        "ImageUrl",
      ];
      console.log("Using fallback headers:", headers);
    } else {
      headers = headers.map((header) => header.trim());
      console.log("Normalized headers:", headers);
    }

    const dataRows = rows.slice(1);
    console.log("Data rows (from row 2):", dataRows);

    if (!dataRows.length) {
      return res
        .status(404)
        .json({ error: "No data found starting from row 2" });
    }

    // Map data rows to objects
    const formData = dataRows
      .map((row) => {
        if (!row || row.length === 0) return null;
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] ? row[index].trim() : "";
        });
        return obj;
      })
      .filter((obj) => obj !== null);

    console.log("Form data before filtering:", formData);
    const finalFormData = formData.filter((obj) =>
      Object.values(obj).some((value) => value !== "")
    );

    console.log("Final form data:", finalFormData);
    if (finalFormData.length === 0) {
      return res
        .status(404)
        .json({ error: "No valid data found starting from row 2" });
    }

    return res.json({ data: finalFormData });
  } catch (error) {
    console.error(
      "Error fetching data from Google Sheet:",
      error.message,
      error.stack
    );
    return res
      .status(500)
      .json({ error: "Server error: Failed to fetch data" });
  }
});

// Approve leave endpoint
app.post("/api/Approve-leave", async (req, res) => {
  const { Approved, leaveDays, EMPCODE } = req.body;

  console.log("Received payload:", req.body);

  // Validate input
  if (!Approved || leaveDays === undefined || !EMPCODE) {
    console.log(
      "Validation failed - Approved:",
      Approved,
      "leaveDays:",
      leaveDays,
      "EMPCODE:",
      EMPCODE
    );
    return res
      .status(400)
      .json({ error: "Approved, leaveDays, and EMPCODE are required" });
  }
  if (!["Approved", "Rejected"].includes(Approved)) {
    console.log("Invalid Approved value:", Approved);
    return res
      .status(400)
      .json({ error: "Approved must be either 'Approved' or 'Rejected'" });
  }
  if (typeof leaveDays !== "number" || leaveDays < 0) {
    console.log("Invalid leaveDays value:", leaveDays);
    return res
      .status(400)
      .json({ error: "leaveDays must be a non-negative number" });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "LeaveFrom!A:N", // Updated range to include column N
    });

    const rows = response.data.values || [];
    console.log("Fetched rows:", rows);

    if (!rows.length) {
      return res.status(404).json({ error: "No data found in the sheet" });
    }

    const headerRow = rows[0];
    console.log("Header row:", headerRow);

    const empCodeIndex = headerRow.indexOf("EMPCODE");
    if (empCodeIndex === -1) {
      console.log("EMPCODE column not found in header row");
      return res
        .status(400)
        .json({ error: "EMPCODE column not found in sheet" });
    }

    const dataRows = rows.slice(1);
    const rowIndex = dataRows.findIndex((row) => row[empCodeIndex] === EMPCODE);
    if (rowIndex === -1) {
      return res
        .status(404)
        .json({ error: `No matching row found for EMPCODE: ${EMPCODE}` });
    }

    const actualRowIndex = rowIndex + 2;
    console.log("Actual row index:", actualRowIndex);

    const originalRow = [...dataRows[rowIndex]];
    const updatedRow = [...originalRow];
    updatedRow[11] = Approved; // Column L (index 11) for Approved/Rejected
    updatedRow[12] = leaveDays.toString(); // Column M (index 12) for leave days
    // Add current date and time to Column N (index 13)
    const currentDateTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata", // Adjust timezone as needed
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    updatedRow[13] = currentDateTime; // Column N (index 13) for approval timestamp
    console.log("Original row:", originalRow);
    console.log("Updated row before update:", updatedRow);

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `LeaveFrom!A${actualRowIndex}:N${actualRowIndex}`, // Updated range to include column N
      valueInputOption: "RAW",
      resource: {
        values: [updatedRow],
      },
    });
    console.log("Update response:", updateResponse.data);

    console.log("Updated row in sheet:", updatedRow);
    return res.json({
      message:
        "Leave status, days, and approval timestamp updated successfully",
    });
  } catch (error) {
    console.error("Error in update:", error.message, error.stack);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
});

// ///////////////////////////////////   Get Employees Data ////////////////////////////////

app.get("/api/getEmployees", async (req, res) => {
  try {
    // Fetch data from the Google Sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "ALL DOER NAMES RCC/DIMENSION!A:G", // Adjust 'Sheet1' to your sheet name, e.g., 'ALL DOER NAMES RCC/DIMENSION'
    });

    const rows = response.data.values || [];
    console.log("Raw rows fetched:", rows);

    if (!rows.length) {
      return res.status(404).json({ error: "No data found in the sheet" });
    }

    // Define the expected headers
    const headers = [
      "Names",
      "EMP Code",
      "Mobile No.",
      "Email",
      "Leave Approval Manager",
      "Department",
      "Designation",
    ];
    console.log("Using headers:", headers);

    // Validate headers from the first row
    const sheetHeaders = rows[0] || [];
    console.log("Headers from sheet (row 1):", sheetHeaders);

    // Check if sheet headers match expected headers (optional validation)
    const normalizedSheetHeaders = sheetHeaders.map((h) => h?.trim() || "");
    if (
      normalizedSheetHeaders.length !== headers.length ||
      !headers.every((h, i) => h === normalizedSheetHeaders[i])
    ) {
      console.warn(
        "Sheet headers do not match expected headers. Using predefined headers."
      );
    }

    // Get data rows (starting from row 2)
    const dataRows = rows.slice(1);
    console.log("Data rows (from row 2):", dataRows);

    if (!dataRows.length) {
      return res
        .status(404)
        .json({ error: "No data found starting from row 2" });
    }

    // Map data rows to objects using the predefined headers
    const formData = dataRows
      .map((row) => {
        if (!row || row.length === 0) return null;
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] ? row[index].trim() : "";
        });
        return obj;
      })
      .filter((obj) => obj !== null);

    console.log("Form data before filtering:", formData);

    // Filter out rows where all values are empty
    const finalFormData = formData.filter((obj) =>
      Object.values(obj).some((value) => value !== "")
    );

    console.log("Final form data:", finalFormData);

    if (finalFormData.length === 0) {
      return res
        .status(404)
        .json({ error: "No valid data found starting from row 2" });
    }

    return res.json({ data: finalFormData });
  } catch (error) {
    console.error(
      "Error fetching data from Google Sheet:",
      error.message,
      error.stack
    );
    return res
      .status(500)
      .json({ error: "Server error: Failed to fetch data" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
