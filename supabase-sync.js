/* Supabase persistence and authentication layer. */
const dbClient = window.supabase.createClient(
  window.SUPABASE_CONFIG.url,
  window.SUPABASE_CONFIG.publishableKey
);

let refreshTimer = null;
let loadingData = false;
let currentProfile = null;
let systemUsers = [];

async function callUserAdmin(action, payload = {}, requireAuth = true) {
  const headers = {
    "Content-Type": "application/json",
    "apikey": window.SUPABASE_CONFIG.publishableKey
  };
  if (requireAuth) {
    const { data: { session } } = await dbClient.auth.getSession();
    if (!session) throw new Error("กรุณาเข้าสู่ระบบอีกครั้ง");
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  const response = await fetch(`${window.SUPABASE_CONFIG.url}/functions/v1/user-admin`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...payload })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "ดำเนินการไม่สำเร็จ");
  return result;
}

function showLogin(message = "") {
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("appShell").classList.add("auth-hidden");
  document.getElementById("loginError").textContent = message;
}

async function showApp(user) {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("auth-hidden");
  const { data: profile } = await dbClient
    .from("user_profiles")
    .select("user_id,username,display_name,role,active")
    .eq("user_id", user.id)
    .maybeSingle();
  currentProfile = profile || null;
  const label = profile?.display_name || profile?.username || user?.email || "B";
  const initial = label.charAt(0).toUpperCase();
  document.getElementById("userButton").textContent = initial;
  document.getElementById("userButton").title = `${label} • คลิกเพื่อออกจากระบบ`;
  document.querySelectorAll(".admin-only").forEach(el =>
    el.classList.toggle("hidden", profile?.role !== "admin")
  );
}

async function login(event) {
  event.preventDefault();
  const button = document.getElementById("loginButton");
  const username = document.getElementById("loginUsername").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  button.disabled = true;
  button.textContent = "กำลังเข้าสู่ระบบ...";
  document.getElementById("loginError").textContent = "";

  let authData;
  let error;
  try {
    if (username.includes("@")) {
      ({ data: authData, error } = await dbClient.auth.signInWithPassword({ email: username, password }));
    } else {
      const result = await callUserAdmin("login", { username, password }, false);
      ({ data: authData, error } = await dbClient.auth.setSession(result.session));
    }
  } catch (loginError) {
    error = loginError;
  }
  button.disabled = false;
  button.textContent = "เข้าสู่ระบบ";
  if (error) return showLogin("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");

  await showApp(authData.user);
  await loadData();
  startAutoRefresh();
}

async function logout() {
  await dbClient.auth.signOut();
  stopAutoRefresh();
  currentProfile = null;
  showLogin();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[char]));
}

async function loadUsers() {
  if (currentProfile?.role !== "admin") return showView("dashboard");
  const container = document.getElementById("usersTable");
  container.innerHTML = '<div class="empty">กำลังโหลด...</div>';
  try {
    const result = await callUserAdmin("list");
    systemUsers = result.users || [];
    container.innerHTML = `<table class="table"><thead><tr><th>ชื่อผู้ใช้</th><th>ชื่อที่แสดง</th><th>สิทธิ์</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>${systemUsers.map(user => `
      <tr>
        <td><b>${escapeHtml(user.username)}</b></td>
        <td>${escapeHtml(user.display_name || "-")}</td>
        <td>${user.role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน"}</td>
        <td class="${user.active ? "status-active" : "status-inactive"}">${user.active ? "ใช้งาน" : "ปิดใช้งาน"}</td>
        <td><div class="user-actions">
          <button onclick="openPasswordModal('${user.user_id}')">ตั้งรหัสผ่าน</button>
          ${user.user_id === currentProfile.user_id ? "" : `<button onclick="changeUserRole('${user.user_id}','${user.role === "admin" ? "staff" : "admin"}')">เปลี่ยนเป็น${user.role === "admin" ? "พนักงาน" : " Admin"}</button><button class="danger" onclick="toggleUserActive('${user.user_id}',${!user.active})">${user.active ? "ปิดบัญชี" : "เปิดบัญชี"}</button>`}
        </div></td>
      </tr>`).join("")}</tbody></table>`;
  } catch (error) {
    container.innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`;
  }
}

function openAddUser() {
  document.getElementById("newUsername").value = "";
  document.getElementById("newDisplayName").value = "";
  document.getElementById("newUserRole").value = "staff";
  document.getElementById("newUserPassword").value = "";
  document.getElementById("userFormError").textContent = "";
  document.getElementById("userModal").classList.add("open");
}

function closeUserModal() { document.getElementById("userModal").classList.remove("open"); }

async function createUser(event) {
  event.preventDefault();
  const button = document.getElementById("createUserButton");
  button.disabled = true;
  document.getElementById("userFormError").textContent = "";
  try {
    await callUserAdmin("create", {
      username: document.getElementById("newUsername").value.trim(),
      displayName: document.getElementById("newDisplayName").value.trim(),
      role: document.getElementById("newUserRole").value,
      password: document.getElementById("newUserPassword").value
    });
    closeUserModal();
    await loadUsers();
  } catch (error) {
    document.getElementById("userFormError").textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

async function changeUserRole(userId, role) {
  if (!confirm(`ยืนยันการเปลี่ยนสิทธิ์เป็น ${role === "admin" ? "ผู้ดูแลระบบ" : "พนักงาน"}?`)) return;
  try { await callUserAdmin("update", { userId, role }); await loadUsers(); }
  catch (error) { alert(error.message); }
}

async function toggleUserActive(userId, active) {
  if (!confirm(`ยืนยันการ${active ? "เปิด" : "ปิด"}บัญชีนี้?`)) return;
  try { await callUserAdmin("update", { userId, active }); await loadUsers(); }
  catch (error) { alert(error.message); }
}

function openPasswordModal(userId) {
  const user = systemUsers.find(item => item.user_id === userId);
  document.getElementById("passwordUserId").value = userId;
  document.getElementById("passwordModalSub").textContent = `ชื่อผู้ใช้: ${user?.username || ""}`;
  document.getElementById("resetPassword").value = "";
  document.getElementById("passwordFormError").textContent = "";
  document.getElementById("passwordModal").classList.add("open");
}

function closePasswordModal() { document.getElementById("passwordModal").classList.remove("open"); }

async function resetUserPassword(event) {
  event.preventDefault();
  const button = document.getElementById("resetPasswordButton");
  button.disabled = true;
  try {
    await callUserAdmin("reset-password", {
      userId: document.getElementById("passwordUserId").value,
      password: document.getElementById("resetPassword").value
    });
    closePasswordModal();
    alert("ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว");
  } catch (error) {
    document.getElementById("passwordFormError").textContent = error.message;
  } finally {
    button.disabled = false;
  }
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
        unitPrice: Number(entry.price),
        quantity: Number(entry.quantity) || 1,
        hasVat: Boolean(entry.has_vat),
        price: Number(entry.price) * (Number(entry.quantity) || 1) * (entry.has_vat ? 1.07 : 1),
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
    .select("id,name,phone,job_type,job_no,address,province,created_year,created_at,job_entries(id,entry_date,description,price,quantity,has_vat,bill_no)")
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
  const items = getEntryFormItems();
  if (items.some(item => !item.description)) return alert("กรุณาใส่รายละเอียดให้ครบทุกรายการ");
  if (items.some(item => item.unitPrice <= 0)) return alert("กรุณาใส่ราคาให้ครบทุกรายการ");
  const entryDate = buddhistInputToIso(document.getElementById("entryDate").value);
  if (!entryDate) return alert("กรุณาใส่วันที่เป็น วัน/เดือน/พ.ศ. เช่น 23/09/2569");
  const billNo = document.getElementById("entryBill").value.trim() || "-";

  if (editingEntryId !== null) {
    const item = items[0];
    const { error } = await dbClient.from("job_entries").update({
      entry_date: entryDate,
      description: item.description,
      price: item.unitPrice,
      quantity: item.quantity,
      has_vat: item.hasVat,
      bill_no: billNo
    }).eq("id", editingEntryId);
    if (error) return alert("แก้ไขรายการไม่สำเร็จ: " + error.message);
    closeEntryModal();
    await loadData();
    alert("แก้ไขรายการเรียบร้อยแล้ว");
    return;
  }

  const payload = items.map(item => ({
    customer_id: customer[7],
    entry_date: entryDate,
    description: item.description,
    price: item.unitPrice,
    quantity: item.quantity,
    has_vat: item.hasVat,
    bill_no: billNo
  }));
  const { error } = await dbClient.from("job_entries").insert(payload);
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
  await showApp(session.user);
  await loadData();
  startAutoRefresh();
})();
