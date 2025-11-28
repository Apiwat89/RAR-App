const API = "/successor"; // ต้องตรงกับ router

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
    const res = await fetch(API);
    const data = await res.json();

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    data.forEach(row => {
        tbody.innerHTML += `
            <tr>
                <td>${row.pic_url ? `<img class="thumb" src="/uploads/${row.pic_url}">` : "-"}</td>
                <td>${row.firstname || ""} ${row.lastname || ""}</td>
                <td>${row.target_position || ""}</td>
                <td>${row.index_no || ""}</td>
                <td>${calcAge(row.birthday) || ""}</td>
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
    document.getElementById("successorForm").reset();
    document.getElementById("id").value = "";

    jobsContainer.innerHTML = "";
    scopeContainer.innerHTML = "";
    nextStepContainer.innerHTML = "";

    jobIndex = 1;
    scopeIndex = 1;
    nextStepIndex = 1;

    addJobRow();
    addScopeRow();
    addNextStepRow();

    updateJobCount();
    updateScopeCount();
    updateNextStepCount();

    document.getElementById("formModal").style.display = "block";
}

function closeModal() {
    document.getElementById("formModal").style.display = "none";
}

/* =============================
    JOB ROW SYSTEM (jobsContainer)
    up to 20 rows
============================= */
const jobsContainer = document.getElementById("jobsContainer");
const addJobBtn = document.getElementById("addJobRowBtn");
let jobIndex = 1;

function addJobRow(job = "") {
    let rows = jobsContainer.querySelectorAll(".job-row");

    // ถ้าเต็ม 20 → ให้ลบอันแรก
    if (rows.length >= 20) {
        rows[0].remove();
    }

    // เพิ่มแถวใหม่
    const div = document.createElement("div");
    div.classList.add("job-row");
    div.innerHTML = `
        <input placeholder="ตำแหน่ง" name="job${jobIndex}" value="${job}">
        <button type="button" class="remove-job" onclick="deleteJobRow(this);">ลบแถวนี้</button>
    `;
    jobsContainer.appendChild(div);

    jobIndex++;
    reindexJobRows();
    updateJobCount();
}

addJobBtn.addEventListener("click", () => addJobRow());

function deleteJobRow(btn) {
    const row = btn.closest(".job-row");
    if (row) row.remove();
    reindexJobRows();
    updateJobCount();
}

function updateJobCount() {
    const count = jobsContainer.querySelectorAll(".job-row").length;
    document.getElementById("jobCount").textContent = `(${count}/20 ตำแหน่ง)`;
}

function reindexJobRows() {
    const rows = jobsContainer.querySelectorAll(".job-row");
    let i = 1;
    rows.forEach(row => {
        const input = row.querySelector("input");
        input.name = `job${i}`;
        i++;
    });
    jobIndex = i;
}

/* =============================
    SCOPE ROW SYSTEM (scopeContainer)
    up to 5 rows
============================= */
const scopeContainer = document.getElementById("scopeContainer");
const addScopeBtn = document.getElementById("addScopeRowBtn");
let scopeIndex = 1;

function addScopeRow(scope = "") {
    let rows = scopeContainer.querySelectorAll(".scope-row");

    // ถ้าเต็ม 5 → ลบแถวแรก
    if (rows.length >= 5) {
        rows[0].remove();
    }

    const div = document.createElement("div");
    div.classList.add("scope-row");
    div.innerHTML = `
        <input placeholder="ขอบเขตความรับผิดชอบ" name="scope${scopeIndex}" value="${scope}">
        <button type="button" class="remove-scope" onclick="deleteScopeRow(this);">ลบแถวนี้</button>
    `;
    scopeContainer.appendChild(div);

    scopeIndex++;
    reindexScopeRows();
    updateScopeCount();
}

addScopeBtn.addEventListener("click", () => addScopeRow());

function deleteScopeRow(btn) {
    const row = btn.closest(".scope-row");
    if (row) row.remove();
    reindexScopeRows();
    updateScopeCount();
}

function reindexScopeRows() {
    const rows = scopeContainer.querySelectorAll(".scope-row");
    let i = 1;
    rows.forEach(row => {
        const input = row.querySelector("input");
        input.name = `scope${i}`;
        i++;
    });
    scopeIndex = i;
}

function updateScopeCount() {
    const count = scopeContainer.querySelectorAll(".scope-row").length;
    document.getElementById("scopeCount").textContent = `(${count}/5 Scope)`;
}

/* =============================
    NEXT STEP ROW SYSTEM
    up to 5 rows
============================= */
const nextStepContainer = document.getElementById("nextStepContainer");
const addNextStepBtn = document.getElementById("addNextStepRowBtn");
let nextStepIndex = 1;

function addNextStepRow(next = "") {

    let rows = nextStepContainer.querySelectorAll(".next-row");

    // ถ้าเต็ม 5 → ลบแถวแรก
    if (rows.length >= 5) {
        rows[0].remove();
    }

    const div = document.createElement("div");
    div.classList.add("next-row");
    div.innerHTML = `
        <input placeholder="ขั้นตอนถัดไป" name="nextstep${nextStepIndex}" value="${next}">
        <button type="button" class="remove-next" onclick="deleteNextStepRow(this);">ลบแถวนี้</button>
    `;
    nextStepContainer.appendChild(div);

    nextStepIndex++;
    reindexNextStepRows();
    updateNextStepCount();
}

addNextStepBtn.addEventListener("click", () => addNextStepRow());

function deleteNextStepRow(btn) {
    const row = btn.closest(".next-row");
    if (row) row.remove();
    reindexNextStepRows();
    updateNextStepCount();
}

function reindexNextStepRows() {
    const rows = nextStepContainer.querySelectorAll(".next-row");
    let i = 1;
    rows.forEach(row => {
        const input = row.querySelector("input");
        input.name = `nextstep${i}`;
        i++;
    });
    nextStepIndex = i;
}

function updateNextStepCount() {
    const count = nextStepContainer.querySelectorAll(".next-row").length;
    document.getElementById("nextStepCount").textContent = `(${count}/5 Step)`;
}


/* =============================
    SAVE (POST or PUT)
============================= */
document.getElementById("successorForm").onsubmit = async (e) => {
    e.preventDefault();

    try {
        // reindex to ensure names are continuous
        reindexJobRows();
        reindexScopeRows();
        reindexNextStepRows();

        const id = document.getElementById("id").value;
        const method = id ? "PUT" : "POST";
        const url = id ? `${API}/${id}` : `${API}`;

        const formData = new FormData(e.target);

        const options = { method, body: formData };
        const res = await fetch(url, options);
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
    EDIT (load single item into form)
============================= */
async function editItem(id) {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) {
        alert("ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้");
        return console.error(await res.text());
    }
    const item = await res.json();

    openAddModal();
    document.getElementById("modalTitle").innerText = "แก้ไขข้อมูล";
    document.getElementById("id").value = id;

    // fill basic fields
    const keys = ["emp_id","title","firstname","lastname","birthday","work_start",
                  "target_position","index_no","g_plus","opq","annual_performance66","annual_performance67",
                  "degree_field1","degree_institution1","degree_field2","degree_institution2","degree_field3","degree_institution3"];
    keys.forEach(k => {
        const el = document.getElementById(k);
        if (el && item[k] !== undefined) el.value = item[k];
    });

    // jobs
    jobsContainer.innerHTML = "";
    jobIndex = 1;
    for (let i = 1; i <= 20; i++) {
        const val = item[`job${i}`];
        if (val) addJobRow(val);
    }
    if (jobsContainer.querySelectorAll(".job-row").length === 0) addJobRow();

    // scopes
    scopeContainer.innerHTML = "";
    scopeIndex = 1;
    for (let i = 1; i <= 5; i++) {
        const val = item[`scope${i}`];
        if (val) addScopeRow(val);
    }
    if (scopeContainer.querySelectorAll(".scope-row").length === 0) addScopeRow();

    // next steps
    nextStepContainer.innerHTML = "";
    nextStepIndex = 1;
    for (let i = 1; i <= 5; i++) {
        const val = item[`nextstep${i}`];
        if (val) addNextStepRow(val);
    }
    if (nextStepContainer.querySelectorAll(".next-row").length === 0) addNextStepRow();

    updateJobCount();
    updateScopeCount();
    updateNextStepCount();
}

/* =============================
    DELETE
============================= */
async function deleteItem(id) {
    if (!confirm("ยืนยันลบรายการนี้?")) return;
    try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!res.ok) {
            alert("ลบรายการไม่สำเร็จ");
            console.error(await res.text());
            return;
        }
        loadData();
    } catch (err) {
        console.error("DELETE ERROR:", err);
        alert("เกิดข้อผิดพลาด ไม่สามารถลบได้");
    }
}

/* =============================
    PPTX DOWNLOAD
============================= */
async function downloadPPTX() {
    const res = await fetch("/Report-incumbent/pptx");
    if (!res.ok) { alert("ไม่สามารถดาวน์โหลดได้"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Successor_Report.pptx";
    a.click();
    URL.revokeObjectURL(url);
}

/* =============================
    VALIDATION (date formatting and job-exp)
============================= */
document.addEventListener("input", function (e) {
    if (e.target.id === "birthday" || e.target.id === "work_start") {
        let v = e.target.value.replace(/[^0-9]/g, "");
        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
        if (v.length >= 6) v = v.slice(0, 5) + "/" + v.slice(5, 9);
        if (v.length > 10) v = v.slice(0, 10);
        e.target.value = v;
        validateDateInput(e.target);
        checkFormErrors();
    }
});

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
    const parts = input.value.split("/");
    const ok =
        parts.length === 3 &&
        parts[0].length === 2 &&
        parts[1].length === 2 &&
        parts[2].length === 4;
    if (!ok) {
        msg.textContent = "กรุณากรอกให้ครบรูปแบบ DD/MM/YYYY";
        input.classList.add("error");
        input.style.borderColor = "red";
    } else {
        msg.textContent = "";
        input.classList.remove("error");
        input.style.borderColor = "";
    }
}

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
