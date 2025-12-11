const API = "/incumbent";

/* =============================
    DATE PARSE & AGE
============================= */
function parseThaiDate(dateStr) {
    if (!dateStr) return null;
    let [d, m, y] = dateStr.split("/").map(Number);
    if (!d || !m || !y) return null;
    if (y > 2400) y -= 543; // พ.ศ. → ค.ศ.
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

/* =============================
    LOAD TABLE
============================= */
async function loadData() {
    const res = await fetch(API + "/list");
    const data = await res.json();

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    data.forEach(row => {
        tbody.innerHTML += `
            <tr>
                <td>${row.pic_url ? `<img class="thumb" src="${row.pic_url}">` : "-"}</td>
                <td>${row.firstname} ${row.lastname}</td>
                <td>${row.current_position ?? ""}</td>
                <td>${row.unit ?? ""}</td>
                <td>${calcAge(row.birthday) ?? ""}</td>
                <td>
                    <button class="btn-primary btn-small" onclick="editItem(${row.id})">แก้ไข</button>
                    <button class="btn-danger btn-small" onclick="deleteItem(${row.id})">ลบ</button>
                </td>
            </tr>
        `;
    });
}

loadData();

/* =============================
    MODAL CONTROL
============================= */
function openAddModal() {
    document.getElementById("modalTitle").innerText = "เพิ่มข้อมูล";
    document.getElementById("incumbentForm").reset();
    document.getElementById("id").value = "";

    jobsContainer.innerHTML = "";
    jobIndex = 1;
    addJobRow();

    updateJobCount();

    document.getElementById("formModal").style.display = "block";
}

function closeModal() {
    document.getElementById("formModal").style.display = "none";
}

/* =============================
    JOB ROW SYSTEM
============================= */
const jobsContainer = document.getElementById("jobsContainer");
const addBtn = document.getElementById("addJobRowBtn");
let jobIndex = 1;

function addJobRow(job = "", agency = "", exp = "") {
    const rows = document.querySelectorAll("#jobsContainer .job-row");

    if (rows.length >= 20) rows[0].remove();

    const div = document.createElement("div");
    div.classList.add("job-row");

    div.innerHTML = `
        <input placeholder="ตำแหน่ง" name="job${jobIndex}" value="${job}">
        <input placeholder="หน่วยงาน" name="Agency${jobIndex}" value="${agency}">
        <input placeholder="อายุงาน (yy/mm)" name="job_exp${jobIndex}" value="${exp}">
        <button type="button" class="remove-job" onclick="deleteRow(this);">ลบแถวนี้</button>
    `;
        // <div class="exp-error-container" style="margin-top:4px; min-height:14px;">
        //     <span id="job_exp${jobIndex}_error" style="color:red; font-size:12px;"></span>
        // </div>
    jobsContainer.appendChild(div);
    jobIndex++;

    reindexJobRows();
    updateJobCount();
}

addBtn.addEventListener("click", () => addJobRow());

function updateJobCount() {
    const count = document.querySelectorAll("#jobsContainer .job-row").length;
    document.getElementById("jobCount").textContent = `(${count}/20)`;
}

/* =============================
    SAVE
============================= */
document.getElementById("incumbentForm").onsubmit = async (e) => {
    e.preventDefault();

    try {
        reindexJobRows();

        const id = document.getElementById("id").value;
        const method = id ? "PUT" : "POST";
        const url = id ? `${API}/update/${id}` : `${API}/add`;

        const formData = new FormData(e.target);
        const res = await fetch(url, { method, body: formData });

        if (!res.ok) {
            console.error("SERVER ERROR:", await res.text());
            alert("บันทึกไม่สำเร็จ");
            return;
        }

        closeModal();
        loadData();

    } catch (err) {
        console.error("SUBMIT ERROR:", err);
        alert("เกิดข้อผิดพลาด");
    }
};

/* =============================
    EDIT
============================= */
async function editItem(id) {
    const res = await fetch(API + "/list");
    const rows = await res.json();
    const item = rows.find(x => Number(x.id) === Number(id));

    openAddModal();
    document.getElementById("modalTitle").innerText = "แก้ไขข้อมูล";
    document.getElementById("id").value = id;

    Object.keys(item).forEach(key => {
        const el = document.getElementById(key);
        if (el && key !== "pic") el.value = item[key] ?? "";
    });

    jobsContainer.innerHTML = "";
    jobIndex = 1;

    let jobList = [];

    for (let i = 1; i <= 20; i++) {
        const job = item[`job${i}`];
        const agency = item[`Agency${i}`];
        const exp = item[`job_exp${i}`];
        if (job || agency || exp) jobList.push({ job, agency, exp });
    }

    jobList.slice(-20).forEach(j => addJobRow(j.job, j.agency, j.exp));

    updateJobCount();
}

/* =============================
    REINDEX
============================= */
function reindexJobRows() {
    const rows = document.querySelectorAll("#jobsContainer .job-row");
    let i = 1;

    rows.forEach(row => {
        row.querySelectorAll("input").forEach(input => {

            if (input.name.includes("job_exp")) {
                input.name = `job_exp${i}`;
            } else if (input.name.includes("Agency")) {
                input.name = `Agency${i}`;
            } else if (input.name.includes("job")) {
                input.name = `job${i}`;
            }

        });
        i++;
    });
}

/* =============================
    DELETE
============================= */
/* =============================
    DELETE ITEM (SERVER)
============================= */
async function deleteItem(id) {
    if (!confirm("ยืนยันลบรายการนี้?")) return;

    try {
        const res = await fetch(`${API}/delete/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            alert("ลบรายการไม่สำเร็จ");
            console.error(await res.text());
            return;
        }

        loadData(); // refresh table
    } catch (err) {
        console.error("DELETE ERROR:", err);
        alert("เกิดข้อผิดพลาด ไม่สามารถลบได้");
    }
}

function deleteRow(btn) {
    const row = btn.closest(".job-row");
    row.remove();
    reindexJobRows();
    updateJobCount();
}

/* =============================
    PPTX DOWNLOAD
============================= */
async function downloadPPTX() {
    const res = await fetch("/Report-incumbent/pptx");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Incumbent_Report.pptx";
    a.click();
    URL.revokeObjectURL(url);
}

/* =============================
    VALIDATION
============================= */
document.addEventListener("input", function (e) {

    /* --- วันเกิด / เริ่มงาน : DD/MM/YYYY --- */
    if (e.target.id === "birthday" || e.target.id === "work_start") {

        let v = e.target.value.replace(/[^0-9]/g, "");

        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
        if (v.length >= 6) v = v.slice(0, 5) + "/" + v.slice(5, 9);
        if (v.length > 10) v = v.slice(0, 10);

        e.target.value = v;

        validateDateInput(e.target);
        checkFormErrors();
    }

    /* --- job_exp : YY/MM --- */
    if (e.target.name?.includes("job_exp")) {
        let v = e.target.value.replace(/[^0-9]/g, "");
        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4);
        if (v.length > 5) v = v.slice(0, 5);
        e.target.value = v;

        validateJobExpInput(e.target);
        checkFormErrors();
    }
});

/* --- DD/MM/YYYY --- */
function validateDateInput(input) {
    const msgId = input.id + "_error";
    let msg = document.getElementById(msgId);

    if (!msg) {
        msg = document.createElement("div");
        msg.id = msgId;
        msg.style.color = "red";
        msg.style.fontSize = "12px";
        msg.style.marginTop = "2px";
        input.insertAdjacentElement("afterend", msg);
    }

    const v = input.value.trim();
    const parts = v.split("/");

    // ตรวจรูปแบบ
    if (parts.length !== 3 || parts[0].length !== 2 || parts[1].length !== 2 || parts[2].length !== 4) {
        setDateError("รูปแบบต้องเป็น DD/MM/YYYY");
        return;
    }

    let [d, m, y] = parts.map(Number);

    // แปลงปี พ.ศ. → ค.ศ.
    if (y > 2400) y = y - 543;

    // ตรวจช่วงตัวเลข
    if (m < 1 || m > 12) {
        setDateError("เดือนต้องอยู่ระหว่าง 01-12");
        return;
    }
    if (d < 1 || d > 31) {
        setDateError("วันต้องอยู่ระหว่าง 01-31");
        return;
    }

    // ตรวจวันจริงตามเดือน
    const testDate = new Date(y, m - 1, d);
    if (
        testDate.getFullYear() !== y ||
        testDate.getMonth() !== m - 1 ||
        testDate.getDate() !== d
    ) {
        setDateError("วันที่ไม่ถูกต้อง (ไม่มีอยู่จริง)");
        return;
    }

    clearDateError();
    return;

    // helper
    function setDateError(txt) {
        msg.textContent = txt;
        input.classList.add("error");
        input.style.borderColor = "red";
    }
    function clearDateError() {
        msg.textContent = "";
        input.classList.remove("error");
        input.style.borderColor = "";
    }
}

/* --- YY/MM --- */
function validateJobExpInput(input) {
    const v = input.value.trim();

    let msgId = input.name + "_error";
    let msg = document.getElementById(msgId);

    // helper: ลบ error box
    function removeErrorBox() {
        if (msg) {
            msg.remove();
            msg = null;
        }
        input.classList.remove("error");
        input.style.borderColor = "";
    }

    // ถ้า error ต้องมี msg box
    function createMsgBox() {
        if (!msg) {
            msg = document.createElement("div");
            msg.id = msgId;
            msg.style.color = "red";
            msg.style.fontSize = "12px";
            msg.style.marginTop = "2px";
            input.insertAdjacentElement("afterend", msg);
        }
    }

    // helper
    function setError(txt) {
        createMsgBox();
        msg.textContent = txt;
        input.classList.add("error");
        input.style.borderColor = "red";
    }

    /* ============================
         VALIDATION
    ============================ */

    // ต้องเป็น 5 ตัว → "YY/MM"
    if (!/^\d{2}\/\d{2}$/.test(v)) {
        setError("รูปแบบต้องเป็น YY/MM เช่น 03/08");
        return;
    }

    const [yy, mm] = v.split("/").map(Number);

    if (mm >= 12) {
        setError("เดือนต้องน้อยกว่า 12");
        return;
    }

    removeErrorBox();
}

/* =============================
    ค้นหาข้อมูล
============================= */
document.getElementById("searchInput").addEventListener("input", function () {
    const search = this.value.toLowerCase();
    const rows = document.querySelectorAll("#incumbentTable tbody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(search) ? "" : "none";
    });
});


/* =============================
    CHECK ERRORS
============================= */
function checkFormErrors() {
    const hasError = document.querySelector(".error");
    const saveBtn = document.getElementById("submit");
    const addRowBtn = document.getElementById("addJobRowBtn");

    if (hasError) {
        saveBtn.disabled = true;
        addRowBtn.disabled = true;
    } else {
        saveBtn.disabled = false;
        addRowBtn.disabled = false;
    }
}
