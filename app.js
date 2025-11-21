const express = require("express");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const app = express();

/* ---------------------------------------------------------
   รองรับ pkg (.exe) และ Node ปกติ
--------------------------------------------------------- */
const baseDir = process.pkg
  ? path.dirname(process.execPath)
  : __dirname;

const dataDir = process.pkg
  ? path.join(baseDir, "data")
  : path.join(__dirname, "data");

const uploadDir = process.pkg
  ? path.join(baseDir, "uploads")
  : path.join(__dirname, "uploads");

const publicDir = process.pkg
  ? path.join(baseDir, "public")
  : path.join(__dirname, "public");

// ensure folders exist
[dataDir, uploadDir, publicDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// database path
const dbPath = path.join(dataDir, "database.sqlite");

/* ---------------------------------------------------------
   DATABASE
--------------------------------------------------------- */
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("DB Error:", err);
    else console.log("SQLite connected:", dbPath);
});
app.locals.db = db;

/* ---------------------------------------------------------
   BODY PARSER
--------------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------------------------------------------------
   STATIC FILES
--------------------------------------------------------- */
app.use(express.static(publicDir));
app.use("/uploads", express.static(uploadDir));

/* ---------------------------------------------------------
   ROUTES (ต้องใช้ absolute path)
--------------------------------------------------------- */
const incumbentRoute = require(path.join(__dirname, "routes", "Incumbent"));
const reportRoute = require(path.join(__dirname, "routes", "Report_Incumbent"));

app.use("/incumbent", incumbentRoute);
app.use("/report-incumbent", reportRoute);

/* ---------------------------------------------------------
   START SERVER
--------------------------------------------------------- */
const PORT = 3000;
app.listen(PORT, () => {
    console.log("Server running at http://localhost:" + PORT);
});
