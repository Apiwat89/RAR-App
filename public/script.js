const API = "/incumbent";

/* -----------------------------
   LOAD TABLE
----------------------------- */
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
                <td>${row.age ?? ""}</td>
                <td>
                    <button class="btn-primary btn-small" onclick="editItem(${row.id})">แก้ไข</button>
                    <button class="btn-danger btn-small" onclick="deleteItem(${row.id})">ลบ</button>
                </td>
            </tr>
        `;
    });
}

loadData();


/* -----------------------------
    MODAL CONTROL
----------------------------- */
function openAddModal() {
    document.getElementById("modalTitle").innerText = "เพิ่มข้อมูล";
    document.getElementById("incumbentForm").reset();
    document.getElementById("id").value = "";

    jobsContainer.innerHTML = "";
    jobIndex = 1;
    addJobRow();

    document.getElementById("formModal").style.display = "block";
}

function closeModal() {
    document.getElementById("formModal").style.display = "none";
}


/* -----------------------------
    JOB ROW SYSTEM
----------------------------- */
const jobsContainer = document.getElementById("jobsContainer");
const addBtn = document.getElementById("addJobRowBtn");
let jobIndex = 1;

function addJobRow(job = "", agency = "", exp = "") {
    const div = document.createElement("div");
    div.classList.add("job-row");

    div.innerHTML = `
        <input placeholder="ตำแหน่ง" name="job${jobIndex}" value="${job}">
        <input placeholder="หน่วยงาน" name="Agency${jobIndex}" value="${agency}">
        <input placeholder="อายุงาน" name="job_exp${jobIndex}" value="${exp}">
        <button type="button" class="remove-job" onclick="this.parentElement.remove()">ลบแถวนี้</button>
    `;

    jobsContainer.appendChild(div);
    jobIndex++;
}

addBtn.addEventListener("click", () => addJobRow());


/* -----------------------------
    SAVE (ADD / UPDATE)
----------------------------- */
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
            alert("บันทึกไม่สำเร็จ (ดู console)");
            return;
        }

        closeModal();
        loadData();

    } catch (err) {
        console.error("SUBMIT ERROR:", err);
        alert("เกิดข้อผิดพลาด (ดู console)");
    }
};



/* -----------------------------
    EDIT
----------------------------- */
async function editItem(id) {
    const res = await fetch(API + "/list");
    const rows = await res.json();

    id = Number(id);
    const item = rows.find(x => Number(x.id) === id);

    openAddModal();
    document.getElementById("modalTitle").innerText = "แก้ไขข้อมูล";
    document.getElementById("id").value = id;

    // เติมข้อมูลลง input
    Object.keys(item).forEach(key => {
        const el = document.getElementById(key);
        if (!el || key === "pic") return;
        el.value = item[key] ?? "";
    });

    jobsContainer.innerHTML = "";
    jobIndex = 1;

    let added = false;

    for (let i = 1; i <= 15; i++) {
        const job = item[`job${i}`];
        const agency = item[`Agency${i}`];
        const exp = item[`job_exp${i}`];

        if (job || agency || exp) {
            addJobRow(job ?? "", agency ?? "", exp ?? "");
            added = true;
        }
    }

    if (!added) addJobRow();
}

function reindexJobRows() {
    const rows = document.querySelectorAll("#jobsContainer .job-row");

    let index = 1;
    rows.forEach(row => {
        const inputs = row.querySelectorAll("input");

        inputs[0].name = `job${index}`;
        inputs[1].name = `Agency${index}`;
        inputs[2].name = `job_exp${index}`;

        index++;
    });

    jobIndex = index; // อัปเดตตัวนับ
}

/* -----------------------------
    DELETE
----------------------------- */
async function deleteItem(id) {
    if (!confirm("ยืนยันการลบข้อมูล?")) return;

    await fetch(API + "/delete/" + id, { method: "DELETE" });
    loadData();
}


/* -----------------------------
    PPTX
----------------------------- */
async function downloadPPTX() {
    const res = await fetch("/Report-incumbent/pptx");

    if (!res.ok) {
        alert("โหลดไฟล์ไม่สำเร็จ");
        return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Incumbent_Report.pptx";
    a.click();

    window.URL.revokeObjectURL(url);
}
