const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

/* ===========================================================
   CREATE TABLE (Auto)
=========================================================== */
router.use((req, res, next) => {
    const db = req.app.locals.db;

    db.prepare(`
        CREATE TABLE IF NOT EXISTS successor (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pic TEXT,

            emp_id TEXT,
            title TEXT,
            firstname TEXT,
            lastname TEXT,
            birthday TEXT,
            work_start TEXT,

            target_position TEXT,
            index_no TEXT,
            g_plus TEXT,
            opq TEXT,
            annual_performance66 TEXT,
            annual_performance67 TEXT,

            degree_field1 TEXT,
            degree_institution1 TEXT,
            degree_field2 TEXT,
            degree_institution2 TEXT,
            degree_field3 TEXT,
            degree_institution3 TEXT,

            job1 TEXT, job2 TEXT, job3 TEXT, job4 TEXT, job5 TEXT,
            job6 TEXT, job7 TEXT, job8 TEXT, job9 TEXT, job10 TEXT,
            job11 TEXT, job12 TEXT, job13 TEXT, job14 TEXT, job15 TEXT,
            job16 TEXT, job17 TEXT, job18 TEXT, job19 TEXT, job20 TEXT,

            scope1 TEXT, scope2 TEXT, scope3 TEXT, scope4 TEXT, scope5 TEXT,
            nextstep1 TEXT, nextstep2 TEXT, nextstep3 TEXT, nextstep4 TEXT, nextstep5 TEXT
        )
    `).run();

    next();
});

/* ===========================================================
   MULTER UPLOAD
=========================================================== */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/successor/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

async function compressImage(filePath) {
    try {
        await sharp(filePath)
            .resize({ width: 600 })
            .jpeg({ quality: 50 })
            .toFile(filePath + "_tmp");

        fs.renameSync(filePath + "_tmp", filePath);
    } catch (e) { console.error(e); }
}

/* ===========================================================
   GET ALL
=========================================================== */
router.get("/", (req, res) => {
    const db = req.app.locals.db;
    const rows = db.prepare(`SELECT * FROM successor ORDER BY id DESC`).all();

    rows.forEach(r => {
        r.pic_url = r.pic ? "/uploads/successor/" + r.pic : null;
    });

    res.json(rows);
});

/* ===========================================================
   GET ONE
=========================================================== */
router.get("/:id", (req, res) => {
    const db = req.app.locals.db;
    const row = db.prepare(`SELECT * FROM successor WHERE id=?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: "NOT FOUND" });
    res.json(row);
});

/* ===========================================================
   INSERT
=========================================================== */
router.post("/", upload.single("pic"), async (req, res) => {
    const db = req.app.locals.db;
    let pic = "";

    if (req.file) {
        await compressImage(req.file.path);
        pic = req.file.filename;
    }

    const fields = [
        "pic",
        "emp_id","title","firstname","lastname",
        "birthday","work_start",
        "target_position","index_no","g_plus","opq",
        "annual_performance66","annual_performance67",
        "degree_field1","degree_institution1",
        "degree_field2","degree_institution2",
        "degree_field3","degree_institution3"
    ];

    for (let i = 1; i <= 20; i++) fields.push(`job${i}`);
    for (let i = 1; i <= 5; i++) fields.push(`scope${i}`);
    for (let i = 1; i <= 5; i++) fields.push(`nextstep${i}`);

    const sql = `
        INSERT INTO successor (${fields.join(",")})
        VALUES (${fields.map(() => "?").join(",")})
    `;

    const values = fields.map(f => f === "pic" ? pic : req.body[f] || "");

    const result = db.prepare(sql).run(values);

    res.json({ message: "Added", id: result.lastInsertRowid });
});

/* ===========================================================
   UPDATE (KEEP OLD IMAGE)
=========================================================== */
router.put("/:id", upload.single("pic"), async (req, res) => {
    const db = req.app.locals.db;

    // 1) ดึงข้อมูลเก่า
    const old = db.prepare(`SELECT pic FROM successor WHERE id=?`).get(req.params.id);
    let newPic = old.pic; // ค่า default = ใช้รูปเดิม

    // 2) ถ้ามีรูปใหม่
    if (req.file) {
        await compressImage(req.file.path);
        newPic = req.file.filename;

        // ลบรูปเก่า
        if (old && old.pic) {
            const oldPath = "uploads/successor/" + old.pic;
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
    }

    // 3) สร้าง fields list
    const fields = [
        "pic",
        "emp_id","title","firstname","lastname",
        "birthday","work_start",
        "target_position","index_no","g_plus","opq",
        "annual_performance66","annual_performance67",
        "degree_field1","degree_institution1",
        "degree_field2","degree_institution2",
        "degree_field3","degree_institution3"
    ];

    for (let i = 1; i <= 20; i++) fields.push(`job${i}`);
    for (let i = 1; i <= 5; i++) fields.push(`scope${i}`);
    for (let i = 1; i <= 5; i++) fields.push(`nextstep${i}`);

    // 4) กำหนดค่าใหม่ pic ใช้ newPic
    const values = fields.map(f => {
        if (f === "pic") return newPic;
        return req.body[f] || "";
    });

    const sql = `
        UPDATE successor SET
        ${fields.map(f => `${f}=?`).join(",")}
        WHERE id=?
    `;

    values.push(req.params.id);

    const result = db.prepare(sql).run(values);

    res.json({ message: "Updated", updated: result.changes });
});

/* ===========================================================
   DELETE 
=========================================================== */
router.delete("/:id", (req, res) => {
    const db = req.app.locals.db;
    const id = req.params.id;

    // 1) ดึงชื่อไฟล์รูป
    const row = db.prepare(`SELECT pic FROM successor WHERE id=?`).get(id);

    // 2) ลบข้อมูลจากฐานข้อมูล
    const result = db.prepare(`DELETE FROM successor WHERE id=?`).run(id);

    // 3) ถ้ามีรูป → ลบจากโฟลเดอร์
    if (row && row.pic) {
        const filePath = path.join("uploads/successor", row.pic);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    res.json({ message: "Deleted", deleted: result.changes });
});

module.exports = router;
