const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");

/* -------------------------------------------------------
   MULTER (Upload)
------------------------------------------------------- */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/successor/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) =>
        cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* -------------------------------------------------------
   GET ALL
------------------------------------------------------- */
router.get("/", (req, res) => {
    const db = req.app.locals.db;
    const rows = db.prepare(`SELECT * FROM successor ORDER BY id DESC`).all();
    res.json(rows);
});

/* -------------------------------------------------------
   GET ONE
------------------------------------------------------- */
router.get("/:id", (req, res) => {
    const db = req.app.locals.db;
    const row = db
        .prepare(`SELECT * FROM successor WHERE id=?`)
        .get(req.params.id);

    if (!row) return res.status(404).json({ error: "NOT FOUND" });

    res.json(row);
});

/* -------------------------------------------------------
   CREATE
------------------------------------------------------- */
router.post("/", upload.single("pic"), async (req, res) => {
    const db = req.app.locals.db;

    let pic_url = null;

    if (req.file) {
        const output = req.file.path.replace(/(\.[\w]+)$/, "_resized$1");
        await sharp(req.file.path).resize(600).toFile(output);
        pic_url = path.relative("uploads", output); // Use relative path
    }

    const default_fields = {
        emp_id: null, title: null, firstname: null, lastname: null, birthday: null, work_start: null,
        target_position: null, index_no: null, g_plus: null, opq: null, annual_performance66: null,
        degree_field1: null, degree_institution1: null,
        degree_field2: null, degree_institution2: null,
        degree_field3: null, degree_institution3: null,
        job1: null, job2: null, job3: null, job4: null, job5: null, job6: null, job7: null, job8: null, job9: null, job10: null,
        job11: null, job12: null, job13: null, job14: null, job15: null, job16: null, job17: null, job18: null, job19: null, job20: null,
        scope1: null, scope2: null, scope3: null, scope4: null, scope5: null,
        nextstep1: null, nextstep2: null, nextstep3: null, nextstep4: null, nextstep5: null,
    };

    const data = { ...default_fields, ...req.body, pic_url };

    const stmt = db.prepare(`
        INSERT INTO successor (
            pic_url,
            emp_id, title, firstname, lastname, birthday, work_start,
            target_position, index_no, g_plus, opq, annual_performance66,
            degree_field1, degree_institution1,
            degree_field2, degree_institution2,
            degree_field3, degree_institution3,
            job1, job2, job3, job4, job5, job6, job7, job8, job9, job10,
            job11, job12, job13, job14, job15, job16, job17, job18, job19, job20,
            scope1, scope2, scope3, scope4, scope5,
            nextstep1, nextstep2, nextstep3, nextstep4, nextstep5
        )
        VALUES (
            @pic_url,
            @emp_id, @title, @firstname, @lastname, @birthday, @work_start,
            @target_position, @index_no, @g_plus, @opq, @annual_performance66,
            @degree_field1, @degree_institution1,
            @degree_field2, @degree_institution2,
            @degree_field3, @degree_institution3,
            @job1, @job2, @job3, @job4, @job5, @job6, @job7, @job8, @job9, @job10,
            @job11, @job12, @job13, @job14, @job15, @job16, @job17, @job18, @job19, @job20,
            @scope1, @scope2, @scope3, @scope4, @scope5,
            @nextstep1, @nextstep2, @nextstep3, @nextstep4, @nextstep5
        )
    `);

    try {
        const result = stmt.run(data);
        res.json({ message: "Successor Created", id: result.lastInsertRowid });
    } catch (err) {
        console.error("DB ERROR (Create Successor)", err);
        res.status(500).json({ error: "Database Error" });
    }
});

/* -------------------------------------------------------
   UPDATE
------------------------------------------------------- */
router.put("/:id", upload.single("pic"), async (req, res) => {
    const db = req.app.locals.db;
    let pic_url = req.body.pic_old || null;

    if (req.file) {
        const output = req.file.path.replace(/(\.[\w]+)$/, "_resized$1");
        await sharp(req.file.path).resize(600).toFile(output);
        pic_url = path.relative("uploads", output);
    }
    
    const default_fields = {
        emp_id: null, title: null, firstname: null, lastname: null, birthday: null, work_start: null,
        target_position: null, index_no: null, g_plus: null, opq: null, annual_performance66: null,
        degree_field1: null, degree_institution1: null,
        degree_field2: null, degree_institution2: null,
        degree_field3: null, degree_institution3: null,
        job1: null, job2: null, job3: null, job4: null, job5: null, job6: null, job7: null, job8: null, job9: null, job10: null,
        job11: null, job12: null, job13: null, job14: null, job15: null, job16: null, job17: null, job18: null, job19: null, job20: null,
        scope1: null, scope2: null, scope3: null, scope4: null, scope5: null,
        nextstep1: null, nextstep2: null, nextstep3: null, nextstep4: null, nextstep5: null,
    };

    const data = { ...default_fields, ...req.body, pic_url, id: req.params.id };

    const stmt = db.prepare(`
        UPDATE successor SET
            pic_url=@pic_url,
            emp_id=@emp_id, title=@title, firstname=@firstname, lastname=@lastname,
            birthday=@birthday, work_start=@work_start,
            target_position=@target_position, index_no=@index_no,
            g_plus=@g_plus, opq=@opq, annual_performance66=@annual_performance66,
            degree_field1=@degree_field1, degree_institution1=@degree_institution1,
            degree_field2=@degree_field2, degree_institution2=@degree_institution2,
            degree_field3=@degree_field3, degree_institution3=@degree_institution3,
            job1=@job1, job2=@job2, job3=@job3, job4=@job4, job5=@job5,
            job6=@job6, job7=@job7, job8=@job8, job9=@job9, job10=@job10,
            job11=@job11, job12=@job12, job13=@job13, job14=@job14, job15=@job15,
            job16=@job16, job17=@job17, job18=@job18, job19=@job19, job20=@job20,
            scope1=@scope1, scope2=@scope2, scope3=@scope3, scope4=@scope4, scope5=@scope5,
            nextstep1=@nextstep1, nextstep2=@nextstep2, nextstep3=@nextstep3,
            nextstep4=@nextstep4, nextstep5=@nextstep5
        WHERE id=@id
    `);

    try {
        const result = stmt.run(data);
        res.json({ message: "Successor Updated", updated: result.changes });
    } catch (err) {
        console.error("DB ERROR (Update Successor)", err);
        res.status(500).json({ error: "Database Error" });
    }
});

/* -------------------------------------------------------
   DELETE
------------------------------------------------------- */
router.delete("/:id", (req, res) => {
    const db = req.app.locals.db;
    const stmt = db.prepare(`DELETE FROM successor WHERE id=?`);
    const result = stmt.run(req.params.id);

    res.json({ message: "Delete OK", deleted: result.changes });
});

module.exports = router;
