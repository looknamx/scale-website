/* Supabase persistence and authentication layer. */
const dbClient = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.publishableKey
);

let refreshTimer = null;
let loadingData = false;

function showLogin(message = "") {
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("appShell").classList.add("auth-hidden");
  document.getElementById("loginError").textContent = message;
}

function showApp(user) {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("auth-hidden");
  const initial = (user?.email || "B").charAt(0).toUpperCase();
  document.getElementById("userButton").textContent = initial;
  document.getElementById("userButton").title = `${user?.email || ""} • คลิกเพื่อออกจากระบบ`;
}

async function login(event) {
  event.preventDefault();
  const button = document.getElementById("loginButton");
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  button.disabled = true;
  button.textContent = "กำลังเข้าสู่ระบบ...";
  document.getElementById("loginError").textContent = "";

  const { data: authData, error } = await dbClient.auth.signInWithPassword({ email, password });
  button.disabled = false;
  button.textContent = "เข้าสู่ระบบ";
  if (error) return showLogin("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

  showApp(authData.user);
  await loadData();
  startAutoRefresh();
}

async function logout() {
  await dbClient.auth.signOut();
  stopAutoRefresh();
  showLogin();
}

function currentCustomerId() {
  if (!currentDetail) return null;
  return data[currentDetail.province]?.[currentDetail.index]?.[7] || null;
}

function rebuildData(rows) {
  Object.keys(data).forEach(key => delete data[key]);
  rows.forEach(row => {
    if (!data[row.province]) data[row.province] = [];
    const entries = (row.job_entries || [])
      .map(entry => ({
        id: entry.id,
        date: entry.entry_date,
        desc: entry.description,
        price: Number(entry.price),
        bill: entry.bill_no
      }))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    data[row.province].push([
      row.name, row.phone, row.job_type, row.job_no, entries,
      row.address, String(row.created_year), row.id
    ]);
  });
}

function findCustomerById(id) {
  for (const [province, rows] of Object.entries(data)) {
    const index = rows.findIndex(row => row[7] === id);
    if (index >= 0) return { province, index };
  }
  return null;
}

async function loadData() {
  if (loadingData) return;
  loadingData = true;
  const detailId = currentCustomerId();
  const { data: rows, error } = await dbClient
    .from("customers")
    .select("id,name,phone,job_type,job_no,address,province,created_year,created_at,job_entries(id,entry_date,description,price,bill_no)")
    .order("created_at", { ascending: true });
  loadingData = false;
  if (error) {
    console.error(error);
    alert("โหลดข้อมูลจาก Supabase ไม่สำเร็จ: " + error.message);
    return;
  }

  rebuildData(rows || []);
  if (detailId) currentDetail = findCustomerById(detailId);
  initGlobalYears();
  renderStats();
  const activeView = document.querySelector(".view.active-view")?.id;
  if (activeView === "customers") renderCustomers();
  if (activeView === "jobs") renderJobs();
  if (activeView === "customerDetail" && currentDetail) renderDetail();
  if (activeView === "customerDetail" && !currentDetail) showView("customers");
}

function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimer = setInterval(loadData, 30000);
}

function stopAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = null;
}

saveCustomer = async function () {
  const province = document.getElementById("newProvince").value;
  const name = document.getElementById("newName").value.trim();
  const address = document.getElementById("newAddress").value.trim();
  const phone = document.getElementById("newPhone").value.trim();
  const jobType = document.getElementById("newType").value;
  if (!name) return alert("กรุณาใส่ชื่อลูกค้า");

  const prefix = jobType === "ขาย" ? "SC" : jobType === "ติดตั้ง" ? "IN" : "RP";
  const jobNo = `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const { error } = await dbClient.from("customers").insert({
    name, phone: phone || "-", job_type: jobType, job_no: jobNo,
    address: address || "-", province, created_year: new Date().getFullYear()
  });
  if (error) return alert("บันทึกลูกค้าไม่สำเร็จ: " + error.message);
  closeModal();
  await loadData();
  alert("เพิ่มลูกค้าเรียบร้อยแล้ว");
};

saveEditCustomer = async function () {
  if (!currentDetail) return;
  const customer = data[currentDetail.province][currentDetail.index];
  const name = document.getElementById("editName").value.trim();
  if (!name) return alert("กรุณาใส่ชื่อลูกค้า");
  const { error } = await dbClient.from("customers").update({
    name,
    phone: document.getElementById("editPhone").value.trim() || "-",
    job_type: document.getElementById("editType").value,
    address: document.getElementById("editAddress").value.trim() || "-"
  }).eq("id", customer[7]);
  if (error) return alert("แก้ไขข้อมูลไม่สำเร็จ: " + error.message);
  closeEditModal();
  await loadData();
  alert("แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว");
};

executeDeleteCustomer = async function () {
  if (!pendingDeleteCustomer) return;
  const customer = data[pendingDeleteCustomer.province][pendingDeleteCustomer.index];
  const { error } = await dbClient.from("customers").delete().eq("id", customer[7]);
  if (error) return alert("ลบลูกค้าไม่สำเร็จ: " + error.message);
  pendingDeleteCustomer = null;
  currentDetail = null;
  closeConfirm();
  closeEditModal();
  await loadData();
  showView("customers");
};

saveEntry = async function () {
  if (!currentDetail) return;
  const customer = data[currentDetail.province][currentDetail.index];
  const description = document.getElementById("entryDesc").value.trim();
  const price = document.getElementById("entryPrice").value;
  if (!description) return alert("กรุณาใส่รายละเอียด");
  if (!price) return alert("กรุณาใส่ราคา");
  const { error } = await dbClient.from("job_entries").insert({
    customer_id: customer[7],
    entry_date: document.getElementById("entryDate").value || new Date().toISOString().slice(0, 10),
    description,
    price: Number(price),
    bill_no: document.getElementById("entryBill").value.trim() || "-"
  });
  if (error) return alert("เพิ่มรายการไม่สำเร็จ: " + error.message);
  closeEntryModal();
  await loadData();
  alert("เพิ่มรายการเรียบร้อยแล้ว");
};

executeDeleteEntry = async function () {
  if (!currentDetail || pendingDeleteIdx === null) return;
  const customer = data[currentDetail.province][currentDetail.index];
  const entry = customer[4][pendingDeleteIdx];
  const { error } = await dbClient.from("job_entries").delete().eq("id", entry.id);
  if (error) return alert("ลบรายการไม่สำเร็จ: " + error.message);
  pendingDeleteIdx = null;
  closeConfirm();
  await loadData();
};

(async function initializeSupabase() {
  if (!window.SUPABASE_CONFIG?.publishableKey) {
    return showLogin("ยังไม่ได้ตั้งค่า Supabase Publishable key");
  }
  const { data: { session } } = await dbClient.auth.getSession();
  if (!session) return showLogin();
  showApp(session.user);
  await loadData();
  startAutoRefresh();
})();
