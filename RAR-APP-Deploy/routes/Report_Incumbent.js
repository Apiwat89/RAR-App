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
                x: 1.4, y: 0.85, w: 8.1, h: 0.3,
                fill: { color: "00B050" }
            });

            slide.addText(`${person.title} ${person.firstname} ${person.lastname}`, {
                x: 1.4, y: 0.98,
                fontSize: 16,
                fontFace: "FreesiaUPC",
                bold: true,
                color: "000000"
            });

            slide.addText(`ถอดรหัสเส้นทางอาชีพของคุณ ${person.firstname} ${person.lastname}`, {
                x: 0.4, y: 0.42,
                fontSize: 32,
                fontFace: "FreesiaUPC",
                bold: true,
                color: "00B050"
            });

            /* --------------------------
               LEFT SIDE PICTURE
            --------------------------- */
            if (person.pic) {
                slide.addImage({
                    path: path.join(__dirname, "..", "uploads", person.pic),
                    x: 0.3, y: 0.85, w: 1, h: 1.3
                });
            }

            slide.addImage({
                path: path.join(__dirname, "..", "uploads", "Picture1.png"),
                x: 9.25, y: 0.18, w: 0.5, h: 0.5
            });

            /* --------------------------
               EDUCATION
            --------------------------- */
            let eduRows = [];
            if (person.Degree_field1 || person.Degree_institution1) {
                eduRows.push(`ปริญญาตรี    สาขา ${person.Degree_field1 || "-"}   สถาบัน ${person.Degree_institution1 || "-"}`);
            }
            if (person.Degree_field2 || person.Degree_institution2) {
                eduRows.push(`ปริญญาโท    สาขา ${person.Degree_field2 || "-"}   สถาบัน ${person.Degree_institution2 || "-"}`);
            }
            if (person.Degree_field3 || person.Degree_institution3) {
                eduRows.push(`ปริญญาเอก   สาขา ${person.Degree_field3 || "-"}   สถาบัน ${person.Degree_institution3 || "-"}`);
            }
            if (eduRows.length === 0) eduRows.push("-");

            let eduText = eduRows.join("\n");

            /* --------------------------
               MAIN TABLE
            --------------------------- */
            const tableData = [
                [
                    { text: "ตำแหน่งปัจจุบัน" ,options: { bold: true }},
                    `${person.current_position}`,
                    { text: "หน่วยงาน" ,options: { bold: true }},
                    person.unit || "-"
                ],
                [
                    { text: "อายุตัว" ,options: { bold: true }},
                    person.age || "-",
                    { text: "อายุงาน" ,options: { bold: true }},
                    `${person.work_exp}`
                ]
            ];

            slide.addTable(tableData, {
                x: 1.4, y: 1.1, w: 8.1,
                border: { type: "solid", color: "00B050", pt: 1 },
                fontSize: 14,
                fontFace: "FreesiaUPC",
                fill: "FFFFFF",
                colW: [1.6, 2.5, 1.5, 2.5]
            });


            const tableData2 = [
                [
                    { text: "ประวัติการศึกษา" ,options: { bold: true }},
                    { text: eduText, options: { fontFace: "FreesiaUPC" } },
                ]
            ];

            slide.addTable(tableData2, {
                x: 1.4, y: 1.75, w: 8.1,
                border: { type: "solid", color: "00B050", pt: 1 },
                fontSize: 14,
                fontFace: "FreesiaUPC",
                fill: "FFFFFF",
                colW: [1.6, 6.5]
            });

            /* --------------------------
               JOB BLOCKS (SNAKE ORDER)
            --------------------------- */
            let jobs = [];
            for (let i = 1; i <= 15; i++) {
                const job = person[`job${i}`];
                const ag = person[`Agency${i}`];
                const exp = person[`job_exp${i}`];
                if (job || ag || exp) {
                    jobs.push({ job, agency: ag, exp });
                }
            }

            const cols = 5;
            let startX = 0.15;
            let startY = 2.7;
            let boxW = 1.85;
            let boxH = 0.6;
            let gapX = 0.1;
            let gapY = 0.2;

            // ⭐ เก็บลูกศรไว้ก่อน
            let arrows = [];

            function snakePos(i) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                return row % 2 === 0 ? { row, col } : { row, col: cols - 1 - col };
            }

            function nextPos(i) {
                if (i + 1 >= jobs.length) return null;
                return snakePos(i + 1);
            }

            for (let i = 0; i < jobs.length; i++) {
                const pos = snakePos(i);
                const next = nextPos(i);

                let x = startX + pos.col * (boxW + gapX);
                let y = startY + pos.row * (boxH + gapY);

                // กล่อง
                slide.addShape(pptx.ShapeType.rect, {
                    x, y, w: boxW, h: boxH,
                    fill: { color: "E2F0D9" },
                    line: { color: "00B050", dashType: "dash" },
                    rectRadius: 20
                });

                slide.addText([
                    { text: "ตำแหน่ง: ", options: { bold: true } },
                    { text: `${jobs[i].job || "-"}` },
                    { text: "\n" },

                    { text: "หน่วยงาน: ", options: { bold: true } },
                    { text: `${jobs[i].agency || "-"}` },
                    { text: "\n" },

                    { text: "อายุงานรวมในตำแหน่ง: ", options: { bold: true } },
                    { text: `${jobs[i].exp || "-"}` }
                ], {
                    x: x + 0,
                    y: y + 0.03,
                    w: boxW - 0.01,
                    h: boxH - 0.05,
                    fontSize: 9.5,
                    fontFace: "FreesiaUPC",
                    color: "000000"
                });

                // --------------------------
                // ⭐ ดึงตำแหน่งของลูกศร แต่ยังไม่วาด
                // --------------------------
                if (next) {
                    let nextX = startX + next.col * (boxW + gapX);
                    let nextY = startY + next.row * (boxH + gapY);

                    if (next.row === pos.row) {
                        // แนวนอน
                        if (next.col > pos.col) {
                            arrows.push({
                                type: pptx.ShapeType.rightArrow,
                                opts: {
                                    x: x + boxW - 0.05,
                                    y: y + boxH / 2 - 0.08,
                                    w: 0.20, h: 0.20,
                                    fill: { color: "00B050" },
                                    line: "none"
                                }
                            });
                        } else {
                            arrows.push({
                                type: pptx.ShapeType.leftArrow,
                                opts: {
                                    x: x - 0.18,
                                    y: y + boxH / 2 - 0.08,
                                    w: 0.20, h: 0.20,
                                    fill: { color: "00B050" },
                                    line: "none"
                                }
                            });
                        }
                    } else {
                        // ลง
                        arrows.push({
                            type: pptx.ShapeType.downArrow,
                            opts: {
                                x: x + boxW / 2 - 0.10,
                                y: y + boxH - 0.01,
                                w: 0.20, h: 0.20,
                                fill: { color: "00B050" },
                                line: "none"
                            }
                        });
                    }
                }
            }

            /* --------------------------
               ⭐ วาดลูกศรทั้งหมดไว้บนสุด
            --------------------------- */
            for (let a of arrows) {
                slide.addShape(a.type, {
                    ...a.opts,
                    zOrder: "foreground" // สำคัญมาก!
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
