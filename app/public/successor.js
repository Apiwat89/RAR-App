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
    UTIL: safe querySelector
============================= */
function $id(id) { return document.getElementById(id); }

/* =============================
    LOAD TABLE
============================= */
async function loadData() {
    try {
        const res = await fetch(API);
        if (!res.ok) {
            console.error("LOAD ERROR:", await res.text());
            return;
        }
        const data = await res.json();

        const tbody = $id("tableBody");
        tbody.innerHTML = "";

        data.forEach(row => {
            // support both pic_url (full path) and pic (filename)
            const imgSrc = row.pic_url
                ? row.pic_url // backend might return full url
                : (row.pic ? `/uploads/successor/${row.pic}` : null);

            tbody.innerHTML += `
                <tr>
                    <td>${imgSrc ? `<img class="thumb" src="${imgSrc}">` : "-"}</td>
                    <td>${row.firstname || ""} ${row.lastname || ""}</td>
                    <td>${row.target_position || ""}</td>
                    <td>${row.index_no || ""}</td>
                    <td>${row.g_plus || ""}</td>
                    <td>${row.opq || ""}</td>
                    <td>${calcAge(row.birthday) || ""}</td>
                    <td>
                        <button class="btn-primary btn-small" onclick="editItem(${row.id})">แก้ไข</button>
                        <button class="btn-danger btn-small" onclick="deleteItem(${row.id})">ลบ</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("LOAD EXCEPTION:", err);
    }
}

loadData();

/* =============================
    MODAL CONTROL
============================= */
function openAddModal() {
    $id("modalTitle").innerText = "เพิ่มข้อมูล";
    $id("successorForm").reset();
    $id("id").value = "";

    // clear dynamic containers
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

    // clear any existing preview
    const preview = $id("picPreview");
    if (preview) preview.src = "";

    $id("formModal").style.display = "flex";
}

function closeModal() {
    $id("formModal").style.display = "none";
}

/* =============================
    JOB ROW SYSTEM (jobsContainer)
    up to 20 rows
============================= */
const jobsContainer = $id("jobsContainer");
const addJobBtn = $id("addJobRowBtn");
let jobIndex = 1;

function addJobRow(job = "") {
    const rows = jobsContainer.querySelectorAll(".job-row");
    if (rows.length >= 20) rows[0].remove();

    const div = document.createElement("div");
    div.classList.add("job-row");
    div.innerHTML = `
        <input placeholder="ตำแหน่ง" name="job${jobIndex}" value="${escapeHtml(job)}">
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
    $id("jobCount").textContent = `(${count}/20)`;
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
const scopeContainer = $id("scopeContainer");
const addScopeBtn = $id("addScopeRowBtn");
let scopeIndex = 1;

function addScopeRow(scope = "") {
    const rows = scopeContainer.querySelectorAll(".scope-row");
    if (rows.length >= 5) rows[0].remove();

    const div = document.createElement("div");
    div.classList.add("scope-row");
    div.innerHTML = `
        <input placeholder="ขอบเขตความรับผิดชอบ" name="scope${scopeIndex}" value="${escapeHtml(scope)}">
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
    $id("scopeCount").textContent = `(${count}/5)`;
}

/* =============================
    NEXT STEP ROW SYSTEM
    up to 5 rows
============================= */
const nextStepContainer = $id("nextStepContainer");
const addNextStepBtn = $id("addNextStepRowBtn");
let nextStepIndex = 1;

function addNextStepRow(next = "") {
    const rows = nextStepContainer.querySelectorAll(".next-row");
    if (rows.length >= 5) rows[0].remove();

    const div = document.createElement("div");
    div.classList.add("next-row");
    div.innerHTML = `
        <input placeholder="(ปี ค.ศ. : หัวข้อการพัฒนา) เช่น ปี 2026 : Cross-BU Rotation เป็นผู้อำนวยการด้าน X ธุรกิจ Y" name="nextstep${nextStepIndex}" value="${escapeHtml(next)}">
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
    $id("nextStepCount").textContent = `(${count}/5)`;
}

/* =============================
    SUBMIT-LOCK + SAVE (POST or PUT)
============================= */
let isSubmitting = false;

$id("successorForm").onsubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;           // กันยิงซ้ำ
    isSubmitting = true;
    $id("submit").disabled = true;

    try {
        // ensure dynamic fields names are continuous
        reindexJobRows();
        reindexScopeRows();
        reindexNextStepRows();

        const id = $id("id").value;
        const method = id ? "PUT" : "POST";
        const url = id ? `${API}/${id}` : `${API}`;

        // build FormData but append file only if user selected one
        const form = $id("successorForm");
        const formData = new FormData();

        // copy all form fields except file
        Array.from(new FormData(form).entries()).forEach(([k, v]) => {
            // skip file inputs: we'll handle explicitly
            if (k === "pic") return;
            formData.append(k, v);
        });

        // file input (assumed id="pic" and name="pic")
        const fileInput = $id("pic");
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            formData.append("pic", fileInput.files[0]);
        } else {
            // If editing and no new file chosen, don't append pic.
            // If backend expects pic_old to keep same filename, include pic_old hidden input in form.
            const picOldEl = $id("pic_old");
            if (picOldEl && picOldEl.value) {
                formData.append("pic_old", picOldEl.value);
            }
        }

        const res = await fetch(url, { method, body: formData });

        if (!res.ok) {
            const txt = await res.text();
            console.error("SERVER ERROR:", txt);
            alert("บันทึกไม่สำเร็จ: " + (txt || res.status));
            return;
        }

        closeModal();
        await loadData();
    } catch (err) {
        console.error("SUBMIT ERROR:", err);
        alert("เกิดข้อผิดพลาด");
    } finally {
        isSubmitting = false;
        $id("submit").disabled = false;
    }
};

/* =============================
    EDIT (load single item into form)
============================= */
async function editItem(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) {
            console.error("LOAD ITEM ERROR:", await res.text());
            alert("ไม่สามารถโหลดข้อมูลสำหรับแก้ไขได้");
            return;
        }
        const item = await res.json();

        openAddModal();
        $id("modalTitle").innerText = "แก้ไขข้อมูล";
        $id("id").value = id;

        // fill basic fields
        const keys = ["emp_id", "title", "firstname", "lastname", "birthday", "work_start",
            "target_position", "index_no", "g_plus", "opq", "LeaderEdge", "annual_performance66", "annual_performance67", "potential_assessment",
            "degree_field1", "degree_institution1", "degree_field2", "degree_institution2", "degree_field3", "degree_institution3"];
        keys.forEach(k => {
            const el = $id(k);
            if (el) el.value = item[k] !== undefined ? item[k] : "";
        });

        // show existing pic filename in hidden input (so backend can keep it if no new file)
        if ($id("pic_old")) {
            $id("pic_old").value = item.pic || "";
        }

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

        // preview existing image (if any)
        const preview = $id("picPreview");
        const imgSrc = item.pic_url ? item.pic_url : (item.pic ? `/uploads/successor/${item.pic}` : null);
        if (preview) preview.src = imgSrc || "";

    } catch (err) {
        console.error("EDIT ERROR:", err);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
}

/* =============================
    ค้นหาข้อมูล
============================= */
document.getElementById("searchInput").addEventListener("input", function () {
    const search = this.value.toLowerCase();
    const rows = document.querySelectorAll("#successorTable tbody tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(search) ? "" : "none";
    });
});

/* =============================
    DELETE
============================= */
async function deleteItem(id) {
    if (!confirm("ยืนยันลบรายการนี้?")) return;
    try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (!res.ok) {
            console.error("DELETE ERROR:", await res.text());
            alert("ลบรายการไม่สำเร็จ");
            return;
        }
        await loadData();
    } catch (err) {
        console.error("DELETE ERROR:", err);
        alert("เกิดข้อผิดพลาด ไม่สามารถลบได้");
    }
}

/* =============================
    PPTX DOWNLOAD
============================= */
async function downloadPPTX() {
    const res = await fetch("/Report-successor/pptx");
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

function checkFormErrors() {
    const hasError = document.querySelector(".error");
    const saveBtn = $id("submit");
    const addRowBtn = $id("addJobRowBtn");
    if (hasError) {
        saveBtn.disabled = true;
        addRowBtn.disabled = true;
    } else {
        saveBtn.disabled = false;
        addRowBtn.disabled = false;
    }
}

/* =============================
    Helpers
============================= */
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}