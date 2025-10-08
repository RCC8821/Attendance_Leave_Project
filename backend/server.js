const express = require("express");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Check required environment variables
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

// Google Sheets API setup
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
const spreadsheetId = process.env.SPREADSHEET_ID;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Dropdown Users Data API

// app.get("/api/DropdownUserData", async (req, res) => {
//   try {
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: "ALL DOER NAMES RCC/DIMENSION!A:I", // Includes Sites (column I)
//     });

//     const rows = response.data.values || [];
//     console.log("Raw Google Sheets response:", rows); // Log raw data

//     if (rows.length === 0) {
//       return res.status(400).json({ error: "No data found in the sheet" });
//     }

//     let headers = rows[0] || [];
//     console.log("Headers:", headers); // Log headers

//     if (!headers.length || headers.some((h) => !h || h.trim() === "")) {
//       headers = [
//         "Names",
//         "EMP Code",
//         "Mobile No.",
//         "Email",
//         "Leave Approval Manager",
//         "Department",
//         "Designation",
//         "Sites",
//       ];
//       console.warn(
//         "Using default headers due to invalid or missing headers in sheet"
//       );
//     } else {
//       headers = headers.map((header) => header.trim());
//     }

//     if (!headers.includes("Sites")) {
//       console.warn("Sites column not found in headers. Check Google Sheet.");
//     }

//     const data = rows.slice(1).map((row, index) => {
//       const rowData = {};
//       headers.forEach((header, colIndex) => {
//         rowData[header] = row[colIndex] ? row[colIndex].trim() : "";
//       });
//       console.log(`Processed row ${index + 1}:`, rowData); // Log each row
//       return rowData;
//     });

//     const filteredData = data.filter(
//       (row) => row["Names"] && row["Names"].trim() !== ""
//     );
//     console.log("Filtered data:", filteredData); // Log filtered data

//     if (
//       filteredData.every((row) => !row["Sites"] || row["Sites"].trim() === "")
//     ) {
//       console.warn("Sites column is empty for all rows");
//     }

//     res.status(200).json({
//       success: true,
//       count: filteredData.length,
//       data: filteredData,
//     });
//   } catch (error) {
//     console.error("Error fetching data from Google Sheet:", error.message);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch data from Google Sheet",
//       details: error.message,
//     });
//   }
// });


// Dropdown Users Data API
app.get("/api/DropdownUserData", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "ALL DOER NAMES RCC/DIMENSION!A:I", // Extended range for safety
    });

    const rows = response.data.values || [];
    console.log("Raw Google Sheets response:", JSON.stringify(rows, null, 2));

    if (rows.length === 0) {
      return res.status(400).json({ error: "No data found in the sheet" });
    }

    let headers = rows[0] || [];
    console.log("Headers:", headers);

    const expectedHeaders = [
      "Names",
      "EMP Code",
      "Mobile No.",
      "Email",
      "Leave Approval Manager",
      "Department",
      "Designation",
      "Sites",
    ];

    if (!headers.length || headers.some((h) => !h || h.trim() === "")) {
      console.warn("Using default headers due to invalid or missing headers in sheet");
      headers = expectedHeaders;
    } else {
      headers = headers.map((header, index) => {
        if (index === 7 && (!header || header.trim() !== "Sites")) {
          console.warn(`Expected 'Sites' in column H, found '${header}'. Correcting to 'Sites'.`);
          return "Sites";
        }
        if (index === 0 && (!header || header.trim() !== "Names")) {
          console.warn(`Expected 'Names' in column A, found '${header}'. Correcting to 'Names'.`);
          return "Names";
        }
        return header.trim();
      });
    }

    if (!headers.includes("Sites")) {
      console.warn("Sites column not found in headers. Check Google Sheet.");
    }

    const data = rows.slice(1).map((row, index) => {
      const rowData = {};
      headers.forEach((header, colIndex) => {
        rowData[header] = row[colIndex] ? row[colIndex].trim() : "";
        if (header === "Names") {
          console.log(`Names value for row ${index + 1}:`, row[colIndex] || "Empty");
        }
        if (header === "Sites") {
          console.log(`Sites value for row ${index + 1}:`, row[colIndex] || "Empty");
        }
      });
      console.log(`Processed row ${index + 1}:`, rowData);
      return rowData;
    });

    // Relaxed filter to include all rows for debugging
    const filteredData = data; // Temporarily remove filter
    // Original filter: const filteredData = data.filter((row) => row["Names"] && row["Names"].trim() !== "");

    console.log("Filtered data:", JSON.stringify(filteredData, null, 2));

    if (
      filteredData.every((row) => !row["Sites"] || row["Sites"].trim() === "")
    ) {
      console.warn("Sites column is empty for all rows");
    }

    res.status(200).json({
      success: true,
      count: filteredData.length,
      data: filteredData,
    });
  } catch (error) {
    console.error("Error fetching data from Google Sheet:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch data from Google Sheet",
      details: error.message,
    });
  }
});


// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Users!A:C",
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      return res.status(400).json({ error: "No users found in the sheet" });
    }

    const user = rows
      .slice(1)
      .find((row) => row[0] === email && row[1] === password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userType = user[2];
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

    const token = jwt.sign({ email, userType }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ token, userType });
  } catch (error) {
    console.error("Error in login:", error.message);
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
});

// Protected user route
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
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64Data}`,
      {
        public_id: fileName,
        folder: "AttendanceImages",
      }
    );
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
}

// Attendance validation endpoint

app.get("/api/attendance", async (req, res) => {
  try {
    const { email, date } = req.query;

    // Parse input date (YYYY-MM-DD or DD/MM/YYYY)
    let today;
    if (!date) {
      today = new Date();
    } else if (date.includes('-')) {
      // YYYY-MM-DD format
      const [year, month, day] = date.split('-');
      today = new Date(year, month - 1, day); // month is 0-based
    } else if (date.includes('/')) {
      // DD/MM/YYYY format
      const [day, month, year] = date.split('/');
      today = new Date(year, month - 1, day);
    } else {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (isNaN(today.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Normalize to IST and set to start of day
    today = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    console.log("Parsed input date (today):", today, "Tomorrow:", tomorrow);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Attendance!A:I",
    });

    const rows = response.data.values || [];
    if (!rows.length) {
      return res.status(404).json({ error: "No data found in Google Sheet" });
    }

    const headers = rows[0];
    console.log("Sheet headers:", headers);

    const emailIndex = headers.findIndex(
      (header) => header && header.toLowerCase() === "email"
    );
    const timestampIndex = headers.findIndex(
      (header) => header && header.toLowerCase() === "timestamp"
    );
    const entryTypeIndex = headers.findIndex(
      (header) => header && header.toLowerCase() === "entrytype"
    );
    const siteIndex = headers.findIndex(
      (header) => header && header.toLowerCase() === "site"
    );

    if (
      emailIndex === -1 ||
      timestampIndex === -1 ||
      entryTypeIndex === -1 ||
      siteIndex === -1
    ) {
      return res.status(400).json({
        error: "Invalid sheet structure",
        details: `Missing columns: ${emailIndex === -1 ? "Email, " : ""}${
          timestampIndex === -1 ? "Timestamp, " : ""
        }${entryTypeIndex === -1 ? "EntryType, " : ""}${
          siteIndex === -1 ? "Site" : ""
        }`,
      });
    }

    let records = rows.slice(1).filter((row) => {
      // Parse sheet Timestamp (DD/MM/YYYY HH:MM:SS)
      const timestampStr = row[timestampIndex];
      if (!timestampStr) return false;

      const [datePart] = timestampStr.split(" "); // Get date part only
      const [day, month, year] = datePart.split("/");
      const recordDate = new Date(year, month - 1, day); // Ignore time
      if (isNaN(recordDate.getTime())) return false;

      // Normalize to IST
      const recordDateIST = new Date(recordDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      recordDateIST.setHours(0, 0, 0, 0);

      console.log("Raw timestamp:", timestampStr, "Parsed date (IST):", recordDateIST);

      return (
        recordDateIST.getTime() === today.getTime() &&
        (!email || row[emailIndex].toLowerCase() === email.toLowerCase())
      );
    });

    const formattedRecords = records.map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] || "";
      });
      return record;
    });

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

    if (
      !email ||
      !name ||
      !empCode ||
      !site ||
      !entryType ||
      !workShift ||
      !locationName
    ) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided" });
    }

    let imageUrl = null;
    if (image) {
      const fileName = `attendance_${email}_${Date.now()}`;
      imageUrl = await uploadToCloudinary(image, fileName);
    }

  const now = new Date();
const istOptions = {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};
const istFormatter = new Intl.DateTimeFormat("en-IN", istOptions);
const parts = istFormatter.formatToParts(now);

const year = parts.find((p) => p.type === "year").value;
const month = parts.find((p) => p.type === "month").value;
const day = parts.find((p) => p.type === "day").value;
const hour = parts.find((p) => p.type === "hour").value;
const minute = parts.find((p) => p.type === "minute").value;
const second = parts.find((p) => p.type === "second").value;

const timestamp = `${day}/${month}/${year} ${hour}:${minute}:${second}`;
console.log(timestamp)
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
      spreadsheetId,
      range: "Attendance!A:I",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res
      .status(200)
      .json({ result: "success", message: "Attendance recorded successfully" });
  } catch (error) {
    console.error("Error processing attendance:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});


app.get("/api/getFormData", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "LeaveFrom!A:M", // Covers all 13 columns (A to M)
    });

    const rows = response.data.values || [];
    if (!rows.length) {
      return res.status(404).json({ error: "No data found in the sheet" });
    }

    let headers = rows[0] || [];
    if (!headers.length || headers.some((h) => !h || h.trim() === "")) {
      headers = [
        "UID",
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
        "STATUS",
        "Leave Granted",
      ];
    } else {
      headers = headers.map((header) => header.trim());
    }

    console.log("Headers:", headers);
    console.log("Raw Rows:", rows);

    const formData = rows
      .slice(1)
      .map((row) => {
        if (!row || row.length === 0) return null;
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] ? row[index].trim() : "";
        });
        console.log("Processed Row Object:", obj); // Debug each row
        return obj;
      })
      .filter((obj) => obj && Object.values(obj).some((value) => value !== ""))
      // Filter to include only rows where STATUS is empty
      .filter((obj) => obj && (!obj["STATUS"] || obj["STATUS"].trim() === ""));

    console.log("Filtered Form Data:", formData);

    if (!formData.length) {
      return res
        .status(404)
        .json({ error: "No valid data found starting from row 2" });
    }

    res.json({ data: formData });
  } catch (error) {
    console.error("Error fetching data from Google Sheet:", error.message);
    res.status(500).json({ error: "Server error: Failed to fetch data" });
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
      return res
        .status(400)
        .json({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        });
    }

    const sheetName = "LeaveFrom";
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = spreadsheet.data.sheets.some(
      (sheet) => sheet.properties.title === sheetName
    );
    if (!sheetExists) {
      return res.status(400).json({
        error: "Invalid spreadsheet configuration",
        details: `Sheet '${sheetName}' does not exist in the spreadsheet`,
      });
    }

    // Fetch current rows to determine the next UID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`, // Check first column for row count
    });
    const rows = response.data.values || [];
    const uid = rows.length; // UID = row count (including header) = 1 for first data row
    console.log("Generated UID:", uid);

    // Generate IST timestamp for SubmissionDate
    const now = new Date();
    const istOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const istFormatter = new Intl.DateTimeFormat("en-IN", istOptions);
    const parts = istFormatter.formatToParts(now);
    const timestamp = `${parts.find((p) => p.type === "day").value}/${parts.find((p) => p.type === "month").value}/${parts.find((p) => p.type === "year").value} ${parts.find((p) => p.type === "hour").value}:${parts.find((p) => p.type === "minute").value}:${parts.find((p) => p.type === "second").value}`;
    console.log("SubmissionDate:", timestamp);

    // Prepare values with UID as the first column
    const values = [
      [
        uid.toString(), // Column A: UID (1, 2, 3, ... as string)
        timestamp, // Column B: SubmissionDate
        name,
        empCode,
        department,
        fromDate,
        toDate,
        shift,
        typeOfLeave,
        reason,
        days.toString(), // Ensure days is a string
        approvalManager,
      ],
    ];

    // Append the new row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:L`, // Range A:L for 12 columns
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.status(200).json({
      result: "success",
      message: "Leave form recorded successfully",
      uid, // Return UID for use in Approve-leave
    });
  } catch (error) {
    console.error("Error processing leave form:", error.message);
    if (error.message.includes("Unable to parse range")) {
      return res.status(400).json({
        error: "Invalid spreadsheet range",
        details: `Please ensure the sheet '${sheetName}' exists and the range A:L is valid`,
      });
    }
    if (error.code === 403) {
      return res.status(403).json({
        error: "Permission denied",
        details: "Ensure the service account has edit access to the spreadsheet",
      });
    }
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Get attendance data endpoint
app.get("/api/getAttendance-Data", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Attendance!A:I",
    });

    const rows = response.data.values || [];
    if (!rows.length) {
      return res.status(404).json({ error: "No data found in the sheet" });
    }

    let headers = rows[0] || [];
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
    } else {
      headers = headers.map((header) => header.trim());
    }

    const formData = rows
      .slice(1)
      .map((row) => {
        if (!row || row.length === 0) return null;
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] ? row[index].trim() : "";
        });
        return obj;
      })
      .filter((obj) => obj && Object.values(obj).some((value) => value !== ""));

    if (!formData.length) {
      return res
        .status(404)
        .json({ error: "No valid data found starting from row 2" });
    }

    res.json({ data: formData });
  } catch (error) {
    console.error("Error fetching data from Google Sheet:", error.message);
    res.status(500).json({ error: "Server error: Failed to fetch data" });
  }
});



//// Approvel Leave

app.post("/api/Approve-leave", async (req, res) => {
  const { Approved, leaveDays, UID } = req.body;

  console.log("Request Body:", req.body); // Log request body: { Approved: 'Approved', leaveDays: 1, UID: 1 }

  if (!Approved || leaveDays === undefined || !UID) {
    return res.status(400).json({ error: "Approved, leaveDays, and UID are required" });
  }
  if (!["Approved", "Rejected"].includes(Approved)) {
    return res.status(400).json({ error: "Approved must be either 'Approved' or 'Rejected'" });
  }
  if (typeof leaveDays !== "number" || leaveDays < 0) {
    return res.status(400).json({ error: "leaveDays must be a non-negative number" });
  }

  try {
    console.log("Spreadsheet ID:", spreadsheetId);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "LeaveFrom!A:O", // Range A:O to include all 15 columns
    });

    const rows = response.data.values || [];
    console.log("Fetched Rows:", rows);
    if (!rows.length) {
      return res.status(404).json({ error: "No data found in the sheet" });
    }

    const headerRow = rows[0];
    const uidIndex = headerRow.indexOf("UID");
    console.log("Header Row:", headerRow, "UID Index:", uidIndex);
    if (uidIndex === -1) {
      return res.status(400).json({ error: "UID column not found in sheet" });
    }

    const dataRows = rows.slice(1);
    const rowIndex = dataRows.findIndex(
      (row) => row[uidIndex]?.toString() === UID.toString()
    );
    console.log("Row Index:", rowIndex, "UID:", UID);
    if (rowIndex === -1) {
      return res.status(404).json({ error: `No matching row found for UID: ${UID}` });
    }

    const actualRowIndex = rowIndex + 2;
    console.log("Actual Row Index:", actualRowIndex);
    const updatedRow = [...dataRows[rowIndex]];
    while (updatedRow.length <= 14) updatedRow.push(""); // Pad row to include columns A:O (15 columns)
    updatedRow[12] = Approved; // Column M: Approved
    updatedRow[13] = leaveDays.toString(); // Column N: leaveDays

    // Generate IST timestamp for ApprovalTimestamp
    const now = new Date();
    const istOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const istFormatter = new Intl.DateTimeFormat("en-IN", istOptions);
    const parts = istFormatter.formatToParts(now);
    const timestamp = `${parts.find((p) => p.type === "year").value}-${parts.find((p) => p.type === "month").value}-${parts.find((p) => p.type === "day").value} ${parts.find((p) => p.type === "hour").value}:${parts.find((p) => p.type === "minute").value}:${parts.find((p) => p.type === "second").value}`;
    updatedRow[14] = timestamp; // Column O: ApprovalTimestamp
    console.log("Updated Row:", updatedRow);

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `LeaveFrom!A${actualRowIndex}:O${actualRowIndex}`, // Update range A:O
      valueInputOption: "RAW",
      resource: { values: [updatedRow] },
    });
    console.log("Update Response:", updateResponse.data);

    // Verify the update
    const verifyResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `LeaveFrom!A${actualRowIndex}:O${actualRowIndex}`, // Verify range A:O
    });
    console.log("Verified Row Data:", verifyResponse.data.values);

    res.json({ message: "Leave status, days, and approval date updated successfully" });
  } catch (error) {
    console.error("Error in update:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Get employees data endpoint
app.get("/api/getEmployees", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "ALL DOER NAMES RCC/DIMENSION!A:G",
    });

    const rows = response.data.values || [];
    if (!rows.length) {
      return res.status(404).json({ error: "No data found in the sheet" });
    }

    const headers = [
      "Names",
      "EMP Code",
      "Mobile No.",
      "Email",
      "Leave Approval Manager",
      "Department",
      "Designation",
    ];
    const dataRows = rows.slice(1);

    const formData = dataRows
      .map((row) => {
        if (!row || row.length === 0) return null;
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] ? row[index].trim() : "";
        });
        return obj;
      })
      .filter((obj) => obj && Object.values(obj).some((value) => value !== ""));

    if (!formData.length) {
      return res
        .status(404)
        .json({ error: "No valid data found starting from row 2" });
    }

    res.json({ data: formData });
  } catch (error) {
    console.error("Error fetching data from Google Sheet:", error.message);
    res.status(500).json({ error: "Server error: Failed to fetch data" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
