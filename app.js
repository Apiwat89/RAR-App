const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();

// ใช้ JSON และ form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database
const db = new sqlite3.Database("./data/database.sqlite", (err) => {
    if (err) console.error(err);
    else console.log("SQLite connected");
});
app.locals.db = db;

// public
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// routes
const incumbentRoute = require("./routes/Incumbent");
app.use("/incumbent", incumbentRoute);

// run server
const PORT = 3000;
app.listen(PORT, () => console.log("Server running on port http://localhost:3000"));