const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const app = express();

/* BASE DIR (โฟลเดอร์ที่ user เปิด run.cmd) */
const baseDir = __dirname;

const dataDir = path.join(baseDir, "data");
const uploadDir = path.join(baseDir, "uploads");
const publicDir = path.join(baseDir, "public");
const dbPath = path.join(dataDir, "database.sqlite");

/* DB */
let db;
try {
    db = new Database(dbPath);
    console.log("DB loaded:", dbPath);
} catch (err) {
    console.error("DB Error", err);
}

app.locals.db = db;

/* Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Static */
app.use(express.static(publicDir));
app.use("/uploads", express.static(uploadDir));

/* Routes */
app.use("/incumbent", require("./routes/Incumbent"));
app.use("/report-incumbent", require("./routes/Report_Incumbent"));

/* Start */
app.listen(3000, () => {
    console.log("Local server: http://localhost:3000");
});
