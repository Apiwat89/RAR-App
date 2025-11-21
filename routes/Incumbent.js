const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

/* -------------------------------------------------------
   MULTER (Upload)
------------------------------------------------------- */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });



/* -------------------------------------------------------
   CREATE TABLE (better-sqlite3 ไม่มี callback)
------------------------------------------------------- */
router.use((req, res, next) => {
    const db = req.app.locals.db;

    const createSQL = `
        CREATE TABLE IF NOT EXISTS incumbent (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pic TEXT,
            emp_id TEXT,
            title TEXT,
            firstname TEXT,
            lastname TEXT,
            current_position TEXT,
            unit TEXT,
            age TEXT,
            work_exp TEXT,

            Degree_field1 TEXT,
            Degree_institution1 TEXT,
            Degree_field2 TEXT,
            Degree_institution2 TEXT,
            Degree_field3 TEXT,
            Degree_institution3 TEXT,

            job1 TEXT, job2 TEXT, job3 TEXT, job4 TEXT, job5 TEXT,
            job6 TEXT, job7 TEXT, job8 TEXT, job9 TEXT, job10 TEXT,
            job11 TEXT, job12 TEXT, job13 TEXT, job14 TEXT, job15 TEXT,

            Agency1 TEXT, Agency2 TEXT, Agency3 TEXT, Agency4 TEXT, Agency5 TEXT,
            Agency6 TEXT, Agency7 TEXT, Agency8 TEXT, Agency9 TEXT, Agency10 TEXT,
            Agency11 TEXT, Agency12 TEXT, Agency13 TEXT, Agency14 TEXT, Agency15 TEXT,

            job_exp1 TEXT, job_exp2 TEXT, job_exp3 TEXT, job_exp4 TEXT, job_exp5 TEXT,
            job_exp6 TEXT, job_exp7 TEXT, job_exp8 TEXT, job_exp9 TEXT, job_exp10 TEXT,
            job_exp11 TEXT, job_exp12 TEXT, job_exp13 TEXT, job_exp14 TEXT, job_exp15 TEXT
        )
    `;

    db.prepare(createSQL).run();
    next();
});


/* -------------------------------------------------------
   INSERT
------------------------------------------------------- */
router.post("/add", upload.single("pic"), (req, res) => {
    const db = req.app.locals.db;
    const body = req.body;
    const picPath = req.file ? req.file.filename : "";

    const fields = [
        "pic", "emp_id", "title", "firstname", "lastname",
        "current_position", "unit", "age", "work_exp",
        "Degree_field1", "Degree_institution1",
        "Degree_field2", "Degree_institution2",
        "Degree_field3", "Degree_institution3"
    ];

    for (let i = 1; i <= 15; i++) {
        fields.push(`job${i}`);
        fields.push(`Agency${i}`);
        fields.push(`job_exp${i}`);
    }

    const values = fields.map(f => f === "pic" ? picPath : body[f] || "");
    const placeholders = fields.map(() => "?").join(",");

    const sql = `INSERT INTO incumbent (${fields.join(",")}) VALUES (${placeholders})`;

    const stmt = db.prepare(sql);
    const result = stmt.run(values);

    res.json({ message: "Insert OK", id: result.lastInsertRowid });
});


/* -------------------------------------------------------
   LIST
------------------------------------------------------- */
router.get("/list", (req, res) => {
    const db = req.app.locals.db;

    const rows = db.prepare(`SELECT * FROM incumbent ORDER BY id DESC`).all();

    const host = req.protocol + "://" + req.get("host") + "/uploads/";

    const result = rows.map(r => ({
        ...r,
        pic_url: r.pic ? host + r.pic : null
    }));

    res.json(result);
});


/* -------------------------------------------------------
   UPDATE
------------------------------------------------------- */
router.put("/update/:id", upload.single("pic"), (req, res) => {
    const db = req.app.locals.db;
    const id = req.params.id;
    const body = req.body;

    if (req.file) body.pic = req.file.filename;

    const degreeFields = [
        "Degree_field1", "Degree_institution1",
        "Degree_field2", "Degree_institution2",
        "Degree_field3", "Degree_institution3"
    ];

    degreeFields.forEach(f => { if (!(f in body)) body[f] = ""; });

    for (let i = 1; i <= 15; i++) {
        ["job", "Agency", "job_exp"].forEach(p => {
            const f = `${p}${i}`;
            if (!(f in body)) body[f] = "";
        });
    }

    const updates = Object.keys(body).map(k => `${k}=?`).join(",");
    const values = [...Object.values(body), id];

    const stmt = db.prepare(`UPDATE incumbent SET ${updates} WHERE id=?`);
    const result = stmt.run(values);

    res.json({ message: "Update OK", updated: result.changes });
});


/* -------------------------------------------------------
   DELETE
------------------------------------------------------- */
router.delete("/delete/:id", (req, res) => {
    const db = req.app.locals.db;

    const stmt = db.prepare(`DELETE FROM incumbent WHERE id=?`);
    const result = stmt.run(req.params.id);

    res.json({ message: "Delete OK", deleted: result.changes });
});


module.exports = router;
