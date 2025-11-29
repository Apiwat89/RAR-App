const express = require("express");
const router = express.Router();
const PptxGenJS = require("pptxgenjs");
const path = require("path");
const { text } = require("stream/consumers");

function parseThaiDate(dateStr) {
    if (!dateStr) return null;
    let [d, m, y] = dateStr.split("/").map(Number);
    if (!d || !m || !y) return null;
    if (y > 2400) y -= 543;  // พ.ศ. → ค.ศ.
    return new Date(y, m - 1, d);
}

function calcAge(dateStr) {
    const date = parseThaiDate(dateStr);
    if (!date) return "-";

    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();
    let months = now.getMonth() - date.getMonth();

    if (months < 0) { years--; months += 12; }
    if (years < 0) return "-";

    return `${years} ปี ${months} เดือน`;
}

router.get("/pptx", async (req, res) => {

    const db = req.app.locals.db;

    // เดิมใช้ db.all(callback) → ใช้ไม่ได้กับ better-sqlite3
    // ใหม่: ดึงทั้งหมดแบบ synchronous
    const rows = db.prepare("SELECT * FROM successor").all();

    let pptx = new PptxGenJS();

    for (let person of rows) {

        let slide = pptx.addSlide();

        /* --------------------------
           HEADER
        --------------------------- */
        await addAutoFitText(slide, `รายชื่อผู้สืบทอดตำแหน่ง - ${person.target_position}`, {
            x: 0.4, y: 0.42,
            maxWidth: 11.5,     
            fontSize: 32,  
            minFont: 18,
            fontFace: "FreesiaUPC",
            bold: true,
            color: "00B050"
        });

        // ==========================
        // AUTO FIT TEXT FOR PPTX
        // ==========================
        async function addAutoFitText(slide, text, options) {
            // ค่า default
            let maxWidth = options.maxWidth || 10; 
            let minFont = options.minFont || 14;

            // Clone options เพื่อไม่แก้ object เดิม
            let opt = { ...options };

            while (opt.fontSize >= minFont) {
                slide.addText(text, opt);

                // คำนวณ approximate text width
                // (ฟังก์ชันประเมินความยาวจากจำนวนตัวอักษร)
                let estWidth = (text.length * opt.fontSize * 0.55) / 72; 

                if (estWidth <= maxWidth) return;  // ผ่าน → ไม่ล้น

                opt.fontSize -= 2; // ลดทีละ 2px
            }
        }

        slide.addImage({
            path: path.join(process.cwd(), "uploads/icon", "Picture1.png"),
            x: 9.25, y: 0.18, w: 0.5, h: 0.5
        });

        /* -------------------------------------------------------
           BLOCKS
        ------------------------------------------------------- */
        let allJobs = [];
        for (let i = 1; i <= 20; i++) {
            const job = person[`job${i}`];
            if (job && job.trim() !== "") {
                allJobs.push(job);
            }
        }
        let jobs = allJobs.slice(-5);
        let jobLines = jobs.map(j => {
            return { text: `-    ${j}\n` };
        });

        let allScope = [];
        for (let i = 1; i <= 5; i++) {
            const job = person[`scope${i}`];
            if (job && job.trim() !== "") {
                allScope.push(job);
            }
        }
        let ScopeLines = allScope.map((j,i) => {
            return { text: `${i+1}. ${j}\n` };
        });

        let allStep = [];
        for (let i = 1; i <= 5; i++) {
            const job = person[`nextstep${i}`];
            if (job && job.trim() !== "") {
                allStep.push(job);
            }
        }
        let StepLines = allStep.map((j,i) => {
            return { text: `${i+1}. ${j}\n` };
        });

        /* --------------------------
           EDUCATION
        --------------------------- */
        function buildEducation(person) {
            let edu = [];

            // ปริญญาตรี
            if (person.degree_field1 || person.degree_institution1) {
                edu.push([
                    { text: "ปริญญาตรี\n", options: { bold: true} },
                    { text: `สาขา ${person.degree_field1 || "-"}\n` },
                    { text: `${person.degree_institution1 || "-"}`, options: { bold: true} },
                    { text: "\n\n" }
                ]);
            }

            // ปริญญาโท
            if (person.degree_field2 || person.degree_institution2) {
                edu.push([
                    { text: "ปริญญาโท\n", options: { bold: true} },
                    { text: `สาขา ${person.degree_field2 || "-"}\n` },
                    { text: `${person.degree_institution2 || "-"}`, options: { bold: true} },
                    { text: "\n\n" }
                ]);
            }

            // ปริญญาเอก
            if (person.degree_field3 || person.degree_institution3) {
                edu.push([
                    { text: "ปริญญาเอก\n", options: { bold: true} },
                    { text: `สาขา ${person.degree_field3 || "-"}\n` },
                    { text: `${person.degree_institution3 || "-"}`, options: { bold: true}  }
                ]);
            }

            // ถ้าไม่มีข้อมูลเลย
            if (edu.length === 0) {
                return {
                    text: "-",
                    options: { fontSize: 12 }
                };
            }

            // รวมเป็น array เดียวสำหรับ pptxgenJS
            return {
                text: edu.flat(),  
                options: { fontSize: 12 }
            };
        }

        const tableData = [
            [
                { text: "ลำดับ", options: { bold: true, align: "center", valign: "middle", fill: "00B050", color: "ffffff"} },
                { text: "ชื่อ-นามสกุล", options: { bold: true, align: "center", valign: "middle", fill: "00B050", color: "ffffff" } },
                { text: "อายุตัว\nอายุงาน", options: { bold: true, align: "center", valign: "middle", fill: "00B050", color: "ffffff" } },
                { text: "ประวัติการทำงาน", options: { bold: true, align: "center", valign: "middle", fill: "00B050", color: "ffffff" } },
                { text: "ประวัติการศึกษา", options: { bold: true, align: "center", valign: "middle", fill: "00B050", color: "ffffff" } },
                { text: "Readiness\n(Business)", options: { bold: true, align: "center", valign: "middle", fill: "00B050", color: "ffffff" } },
                { text: "Next Step", options: { bold: true, align: "center", valign: "middle", fill: "00B050", color: "ffffff" } }
            ],
            [
                { text: `${person.index_no}`, options: { align: "center", fontSize: 12} },
                { text: `${person.title} ${person.firstname} ${person.lastname}\n\nG+ : ${person.g_plus}\nOPQ : ${person.opq}\n\nผลการปฏิบัติงาน\n67 : ${person.annual_performance67}\n66 : ${person.annual_performance66}`, options: { fontSize: 12} },
                {
                    options: { align: "center", fontSize: 12 },
                    text: [
                        { text: "อายุตัว: ", options: { bold: true } },
                        { text: `${calcAge(person.birthday)}` },
                        { text: "\n" },
                        { text: "อายุงาน: ", options: { bold: true } },
                        { text: `${calcAge(person.work_start)}` }
                    ]
                },
                {
                    options: { fontSize: 12 },
                    text: [
                        ...jobLines,
                        { text: "\nDefinition ของงานขายอาหารสัตว์ Scope of work" , options: { bold: true } },
                        ...ScopeLines
                    ]
                },
                { ...buildEducation(person) },
                {},
                { options: { fontSize: 12 }, text: [...StepLines] },
            ]
        ];

        slide.addTable(tableData, {
            x: 0, y: 0.9, w: 10,
            border: { type: "solid", color: "778899", pt: 1 },
            fontSize: 15,
            fontFace: "FreesiaUPC",
            fill: "FFFFFF",
            colW: [0.8, 1.1, 1.0, 2.6, 1.5, 1.5, 1.5]
        });

        if (person.pic) {
            slide.addImage({
                path: path.join(process.cwd(), "uploads/successor", person.pic),
                x: 0.01, y: 1.8, w: 0.778, h: 1.0
            });
        }
    }

    // return pptx
    const file = await pptx.write("nodebuffer");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", "attachment; filename=CareerPath.pptx");
    res.send(file);
});

module.exports = router;
