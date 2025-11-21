const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");   // ← ใช้ better-sqlite3
const app = express();

/* -----------------------------
   BASE DIRECTORY (Portable)
----------------------------- */
const baseDir = process.cwd();  // ที่อยู่โฟลเดอร์ .exe ตอนรันจริง

const dataDir = path.join(baseDir, "data");
const uploadDir = path.join(baseDir, "uploads");
const publicDir = path.join(baseDir, "public");

const dbPath = path.join(dataDir, "database.sqlite");


/* -----------------------------
   DATABASE (better-sqlite3)
----------------------------- */
let db;
try {
    db = new Database(dbPath, { verbose: console.log });
    console.log("SQLite connected:", dbPath);
} catch (err) {
    console.error("DB Error:", err);
}

app.locals.db = db;


/* -----------------------------
   BODY PARSER
----------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* -----------------------------
   STATIC FILES
----------------------------- */
app.use(express.static(publicDir));
app.use("/uploads", express.static(uploadDir));


/* -----------------------------
   ROUTES
----------------------------- */
app.use("/incumbent", require("./routes/Incumbent"));
app.use("/report-incumbent", require("./routes/Report_Incumbent"));


/* -----------------------------
   START SERVER
----------------------------- */
const PORT = 3000;
app.listen(PORT, () => {
    console.log("Server running at http://localhost:" + PORT);
});
