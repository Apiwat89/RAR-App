const express = require("express");
const router = express.Router();
const PptxGenJS = require("pptxgenjs");
const path = require("path");

router.get("/pptx", (req, res) => {
    const db = req.app.locals.db;

    db.all("SELECT * FROM incumbent", async (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        let pptx = new PptxGenJS();

        for (let person of rows) {
            let slide = pptx.addSlide();

            /* --------------------------
               SECTION HEADER (TITLE)
            --------------------------- */
            slide.addShape(pptx.ShapeType.rect, {
                x: 0.2, y: 0.2, w: 12, h: 0.8,
                fill: { color: "00B050" }
            });

            slide.addText(`ถอดรหัสเส้นทางอาชีพของคุณ ชื่อ ${person.firstname} ${person.lastname}`, {
                x: 0.3, y: 0.25,
                fontSize: 24,
                bold: true,
                color: "FFFFFF"
            });

            /* --------------------------
               LEFT SIDE PICTURE
            --------------------------- */
            if (person.pic) {
                slide.addImage({
                    path: path.join(__dirname, "..", "uploads", person.pic),
                    x: 0.3, y: 1.3, w: 2.2, h: 2.2
                });
            }

            slide.addText("BU Head\nPicture", {
                x: 0.35, y: 1.3,
                w: 2.2, h: 2.2,
                fontSize: 16,
                bold: true,
                color: "666666",
                align: "center",
                valign: "middle"
            });

            /* --------------------------
               MAIN TABLE SECTION
            --------------------------- */
            const tableData = [
                [
                    { text: "คำนำหน้า ชื่อ นามสกุล", options: { fill: "D9EAD3", bold: true } },
                    `${person.title} ${person.firstname} ${person.lastname}`,
                    { text: "หน่วยงาน", options: { fill: "D9EAD3", bold: true } },
                    person.unit || "-"
                ],
                [
                    { text: "ตำแหน่งปัจจุบัน", options: { fill: "D9EAD3", bold: true } },
                    person.current_position || "-",
                    { text: "อายุงาน", options: { fill: "D9EAD3", bold: true } },
                    `${person.age || 0} ปี ${person.work_exp || 0} เดือน`
                ],
                [
                    { text: "ประวัติการศึกษา", options: { fill: "D9EAD3", bold: true } },
                    `${person.Degree_field1 || ""} / ${person.Degree_institution1 || ""}`,
                    "",
                    ""
                ]
            ];

            slide.addTable(tableData, {
                x: 3, y: 1.3, w: 9,
                border: { type: "solid", color: "999999", pt: 1 },
                fontSize: 14,
                fill: "FFFFFF"
            });

            /* --------------------------
               JOB BLOCKS (1–15)
            --------------------------- */

            let jobs = [];
            for (let i = 1; i <= 15; i++) {
                const job = person[`job${i}`];
                const ag = person[`Agency${i}`];
                const exp = person[`job_exp${i}`];
                if (job || ag || exp) {
                    jobs.push({
                        job,
                        agency: ag,
                        exp
                    });
                }
            }

            // วางกล่องเป็น grid 5×3
            const cols = 5;
            const rowsCount = Math.ceil(jobs.length / cols);

            let startX = 0.3;
            let startY = 4.2;
            let boxW = 2.5;
            let boxH = 1.1;
            let gapX = 0.3;
            let gapY = 0.3;

            for (let i = 0; i < jobs.length; i++) {
                let col = i % cols;
                let row = Math.floor(i / cols);

                let x = startX + col * (boxW + gapX);
                let y = startY + row * (boxH + gapY);

                // กล่องพื้นเขียวอ่อน ขอบประ
                slide.addShape(pptx.ShapeType.rect, {
                    x, y, w: boxW, h: boxH,
                    fill: { color: "E2F0D9" },
                    line: { color: "00B050", dashType: "dash" }
                });

                slide.addText(
                    `ตำแหน่ง: ${jobs[i].job || "-"}\n` +
                    `หน่วยงาน: ${jobs[i].agency || "-"}\n` +
                    `อายุงานรวมในตำแหน่ง: ${jobs[i].exp || "-"}`,
                    {
                        x: x + 0.1, y: y + 0.05,
                        w: boxW - 0.2, h: boxH - 0.1,
                        fontSize: 11,
                        color: "000000"
                    }
                );

                // ลูกศรขวา
                slide.addShape(pptx.ShapeType.rightArrow, {
                    x: x + boxW - 0.1, y: y + boxH / 2 - 0.2,
                    w: 0.4, h: 0.4,
                    fill: { color: "92D050" }
                });
            }
        }

        // ส่งไฟล์กลับ
        const pptxFile = await pptx.write("nodebuffer");
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        );
        res.setHeader("Content-Disposition", "attachment; filename=CareerPath.pptx");
        res.send(pptxFile);
    });
});

module.exports = router;
