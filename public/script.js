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
    document.getElementById("formModal").style.display = "block";
}

function closeModal() {
    document.getElementById("formModal").style.display = "none";
}


/* -----------------------------
    LOAD JOB ROWS (1–15)
----------------------------- */
const jobContainer = document.getElementById("jobsContainer");
let jobFields = "";

for (let i = 1; i <= 15; i++) {
    jobFields += `
        <div class="form-group"><input placeholder="Job ${i}" id="job${i}" name="job${i}"></div>
        <div class="form-group"><input placeholder="Agency ${i}" id="Agency${i}" name="Agency${i}"></div>
        <div class="form-group"><input placeholder="Job Exp ${i}" id="job_exp${i}" name="job_exp${i}"></div>
    `;
}
jobContainer.innerHTML = jobFields;


/* -----------------------------
    SAVE (ADD / UPDATE)
----------------------------- */
document.getElementById("incumbentForm").onsubmit = async (e) => {
    e.preventDefault();

    const id = document.getElementById("id").value;
    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/update/${id}` : `${API}/add`;

    const formData = new FormData(e.target);

    const res = await fetch(url, {
        method,
        body: formData,
    });

    if (res.ok) {
        closeModal();
        loadData();
    }
};


/* -----------------------------
    EDIT
----------------------------- */
async function editItem(id) {
    const res = await fetch(API + "/list");
    const rows = await res.json();

    id = Number(id); // แก้บั๊กสำคัญ!

    const item = rows.find(x => Number(x.id) === id);

    openAddModal();
    document.getElementById("modalTitle").innerText = "แก้ไขข้อมูล";
    document.getElementById("id").value = id;

    // เติมข้อมูลลง input
    Object.keys(item).forEach(key => {
        const el = document.getElementById(key);
        if (!el) return;

        // รูปไม่ใส่ลง input file
        if (key === "pic") return;

        el.value = item[key] ?? "";
    });
}


/* -----------------------------
    DELETE
----------------------------- */
async function deleteItem(id) {
    if (!confirm("ยืนยันการลบข้อมูล?")) return;

    await fetch(API + "/delete/" + id, { method: "DELETE" });
    loadData();
}
