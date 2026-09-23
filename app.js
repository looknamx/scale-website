/* ===== All 77 Thai Provinces ===== */
const ALL_PROVINCES = [
  "กรุงเทพมหานคร","กระบี่","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร",
  "ขอนแก่น","จันทบุรี","ฉะเชิงเทรา","ชลบุรี","ชัยนาท",
  "ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่","ตรัง",
  "ตราด","ตาก","นครนายก","นครปฐม","นครพนม",
  "นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี","นราธิวาส",
  "น่าน","บึงกาฬ","บุรีรัมย์","ปทุมธานี","ประจวบคีรีขันธ์",
  "ปราจีนบุรี","ปัตตานี","พระนครศรีอยุธยา","พะเยา","พังงา",
  "พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์",
  "แพร่","ภูเก็ต","มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน",
  "ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง","ระยอง",
  "ราชบุรี","ลพบุรี","ลำปาง","ลำพูน","เลย",
  "ศรีสะเกษ","สกลนคร","สงขลา","สตูล","สมุทรปราการ",
  "สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี",
  "สุโขทัย","สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์","หนองคาย",
  "หนองบัวลำภู","อ่างทอง","อำนาจเจริญ","อุดรธานี","อุตรดิตถ์",
  "อุทัยธานี","อุบลราชธานี"
];

/* ===== Data Store ===== */
// Loaded from Supabase after authentication.
// Format: [Name, Phone, Type, JobNo, EntriesArray, Address, CreatedYear, UUID]
const data = {};

/* ===== State ===== */
let currentDetail = null; // { province, index }
let pendingDeleteIdx = null; 
let globalYear = "all"; 
let detailYear = "all"; 
let pendingDeleteCustomer = null; 
let detailReturnView = "customers";
let editingEntryId = null;
let expandedBillKey = null;
let visibleBillKeys = [];

const titles = {
  dashboard: "แดชบอร์ดงาน",
  customers: "ลูกค้าทั้งหมด",
  jobs: "งานทั้งหมด",
  users: "ผู้ใช้งานระบบ",
  customerDetail: "รายละเอียดลูกค้า"
};

/* ===== Helpers ===== */
function allCustomers() {
  return Object.entries(data).flatMap(([province, rows]) =>
    rows.map((r, idx) => ({
      province, name: r[0], phone: r[1], type: r[2], job: r[3],
      entries: r[4] || [], address: r[5] || "-", createdYear: r[6] || "-", _idx: idx
    }))
  );
}

function typeTag(t) {
  const cls = t === "ขาย" ? "sale" : t === "ติดตั้ง" ? "green" : "orange";
  return '<span class="tag ' + cls + '">' + t + '</span>';
}

function formatPrice(p) {
  return Number(p).toLocaleString("th-TH", { minimumFractionDigits: 0 });
}

function formatDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

function getThaiYear(yearStr) {
  if (yearStr === "all") return "ทุกปี";
  const y = parseInt(yearStr, 10);
  return isNaN(y) ? yearStr : (y + 543).toString();
}

function getYearFromDate(dateStr) {
  if (!dateStr) return null;
  return dateStr.split("-")[0];
}

function getAvailableYears() {
  const yearsWithData = new Set();
  const currentYear = new Date().getFullYear();
  allCustomers().forEach(c => {
    if (c.createdYear && c.createdYear !== "-") yearsWithData.add(c.createdYear);
    c.entries.forEach(e => {
      const y = getYearFromDate(e.date);
      if (y) yearsWithData.add(y);
    });
  });
  const oldestDataYear = Math.min(currentYear, ...Array.from(yearsWithData, Number).filter(Number.isFinite));
  return Array.from({ length: currentYear - oldestDataYear + 1 }, (_, i) => String(currentYear - i));
}

function filterEntriesByYear(entries, year) {
  if (year === "all") return entries;
  return entries.filter(e => getYearFromDate(e.date) === year);
}

function isCustomerInYear(c, year) {
  if (year === "all") return true;
  if (c.createdYear === year) return true;
  return c.entries.some(e => getYearFromDate(e.date) === year);
}

/* ===== Init & Year Dropdown ===== */
function initGlobalYears() {
  const years = getAvailableYears();
  const select = document.getElementById("globalYear");
  select.innerHTML = '<option value="all">ทุกปี</option>' + 
    years.map(y => `<option value="${y}">ปี ${getThaiYear(y)}</option>`).join("");
  select.value = globalYear;
  renderSidebarYears(years);
  populateProvinceFilters();
}

function renderSidebarYears(years = getAvailableYears()) {
  const list = document.getElementById("sidebarYearList");
  list.innerHTML = years.map(y => `
    <button class="nav-item year-nav ${globalYear === y ? 'active' : ''}" data-year="${y}" onclick="selectSidebarYear('${y}')">
      📅 <span>ปี ${getThaiYear(y)}</span>
    </button>
  `).join("");
}

function selectSidebarYear(year) {
  globalYear = year;
  document.getElementById("globalYear").value = year;
  renderStats();
  showView("jobs");
  renderSidebarYears();
}

function populateProvinceFilters() {
  const activeProvinces = Object.keys(data).filter(k => data[k].length > 0).sort();
  const opts = '<option value="all">ทุกจังหวัด</option>' + 
    activeProvinces.map(p => `<option value="${p}">${p}</option>`).join('');
  
  ["filterProvCustomers", "filterProvJobs"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = opts;
  });
}

function onGlobalYearChange() {
  globalYear = document.getElementById("globalYear").value;
  renderSidebarYears();
  renderStats();
  
  const activeView = document.querySelector(".view.active-view").id;
  if (activeView === "customers") renderCustomers();
  if (activeView === "jobs") renderJobs();
}

/* ===== Render Stats ===== */
function renderStats() {
  let cs = allCustomers();
  if (globalYear !== "all") {
    cs = cs.filter(c => isCustomerInYear(c, globalYear));
  }
  
  let salesRev = 0, installRev = 0, repairRev = 0;
  let salesCount = 0, installCount = 0, repairCount = 0;
  let provCounts = {};
  
  cs.forEach(c => {
    const yearEntries = filterEntriesByYear(c.entries, globalYear);
    const rev = yearEntries.reduce((sum, e) => sum + (Number(e.price) || 0), 0);
    // Count jobs (using customer base type)
    if (c.type === "ขาย") { salesRev += rev; salesCount++; }
    else if (c.type === "ติดตั้ง") { installRev += rev; installCount++; }
    else if (c.type === "ซ่อม") { repairRev += rev; repairCount++; }

    // Count jobs per province
    if (!provCounts[c.province]) provCounts[c.province] = 0;
    provCounts[c.province]++;
  });

  // Sidebar Badges Update
  document.getElementById("customerBadge").textContent = cs.length;
  document.getElementById("jobsBadge").textContent = cs.length;

  // Yearly Summary (Dashboard)
  document.getElementById("dashYearlySummary").innerHTML = `
    <div class="revenue-cards">
      <div class="revenue-card"><small>งานขายตราชั่ง</small><h2>${salesCount} งาน</h2><span>ยอดรวม ฿${formatPrice(salesRev)}</span></div>
      <div class="revenue-card"><small>งานติดตั้ง</small><h2>${installCount} งาน</h2><span>ยอดรวม ฿${formatPrice(installRev)}</span></div>
      <div class="revenue-card"><small>งานซ่อม</small><h2>${repairCount} งาน</h2><span>ยอดรวม ฿${formatPrice(repairRev)}</span></div>
    </div>
  `;

  // Top Provinces Summary
  const sortedProvs = Object.entries(provCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const provHtml = sortedProvs.length ? sortedProvs.map((p, i) => `
    <div class="top-province-card" onclick="openProvinceFilter('${p[0]}')">
      <div class="rank">#${i+1}</div>
      <div><b>${p[0]}</b><small>จำนวน ${p[1]} งาน</small></div>
    </div>
  `).join("") : '<div class="empty" style="grid-column: 1/-1;">ไม่มีข้อมูลจังหวัดในปีนี้</div>';
  
  document.getElementById("dashTopProvinces").innerHTML = provHtml;
}

function openProvinceFilter(p) {
  document.getElementById("filterProvCustomers").value = p;
  document.getElementById("customerSearch").value = "";
  showView("customers");
}

/* ===== Customer List ===== */
function renderCustomers() {
  let cs = allCustomers();
  if (globalYear !== "all") {
    cs = cs.filter(c => isCustomerInYear(c, globalYear));
  }

  const q = (document.getElementById("customerSearch").value || "").toLowerCase();
  if (q) cs = cs.filter(x => Object.values(x).some(v => String(v).toLowerCase().includes(q)));
  
  const prov = document.getElementById("filterProvCustomers").value;
  if (prov !== "all") cs = cs.filter(x => x.province === prov);

  document.getElementById("customerTable").innerHTML = cs.length
    ? '<table class="table"><thead><tr>' +
      '<th>ลูกค้า</th><th>จังหวัด</th><th>โทรศัพท์</th><th>ประเภทงาน</th><th>เลขที่งาน</th><th>รายการ (' + (globalYear==="all"?"รวม":"ปี "+getThaiYear(globalYear)) + ')</th><th></th>' +
      '</tr></thead><tbody>' +
      cs.map(x => {
        const yEntries = filterEntriesByYear(x.entries, globalYear);
        return '<tr class="clickable" onclick="openDetail(\'' + x.province + '\',' + x._idx + ')">' +
        '<td><b>' + x.name + '</b></td>' +
        '<td>' + x.province + '</td>' +
        '<td>' + x.phone + '</td>' +
        '<td>' + typeTag(x.type) + '</td>' +
        '<td>' + x.job + '</td>' +
        '<td><span class="tag sale">' + yEntries.length + ' รายการ</span></td>' +
        '<td><button class="text-btn" onclick="event.stopPropagation();openDetail(\'' + x.province + '\',' + x._idx + ')">ดูรายละเอียด →</button></td>' +
        '</tr>';
      }).join("") +
      '</tbody></table>'
    : '<div class="empty">ไม่มีข้อมูลลูกค้าในเงื่อนไขที่เลือก</div>';
}

/* ===== Combined Job Table ===== */
function renderJobs() {
  let cs = allCustomers();
  if (globalYear !== "all") {
    cs = cs.filter(c => isCustomerInYear(c, globalYear));
  }

  const q = (document.getElementById("jobsSearch").value || "").toLowerCase();
  if (q) cs = cs.filter(x => Object.values(x).some(v => String(v).toLowerCase().includes(q)));
  
  const prov = document.getElementById("filterProvJobs").value;
  if (prov !== "all") cs = cs.filter(x => x.province === prov);

  document.getElementById("jobsTitle").textContent = globalYear === "all" ? "งานทั้งหมด" : "งานทั้งหมด ปี " + getThaiYear(globalYear);
  document.getElementById("jobsTable").innerHTML = cs.length
    ? '<table class="table"><thead><tr>' +
      '<th>เลขที่งาน</th><th>ลูกค้า</th><th>จังหวัด</th><th>โทรศัพท์</th><th>ประเภทงาน</th><th>รายการ</th><th></th>' +
      '</tr></thead><tbody>' +
      cs.map(x => {
        const yEntries = filterEntriesByYear(x.entries, globalYear);
        return '<tr class="clickable" onclick="openDetail(\'' + x.province + '\',' + x._idx + ')">' +
        '<td><b>' + x.job + '</b></td>' +
        '<td>' + x.name + '</td>' +
        '<td>' + x.province + '</td>' +
        '<td>' + x.phone + '</td>' +
        '<td>' + typeTag(x.type) + '</td>' +
        '<td><span class="tag sale">' + yEntries.length + ' รายการ</span></td>' +
        '<td><button class="text-btn" onclick="event.stopPropagation();openDetail(\'' + x.province + '\',' + x._idx + ')">ดูรายละเอียด →</button></td>' +
        '</tr>';
      }).join("") +
      '</tbody></table>'
    : '<div class="empty">ไม่มีงานในเงื่อนไขที่เลือก</div>';
}

/* ===== Customer Detail View ===== */
function openDetail(province, idx) {
  const activeView = document.querySelector(".view.active-view");
  if (activeView && activeView.id !== "customerDetail") detailReturnView = activeView.id;
  currentDetail = { province, index: idx };
  detailYear = "all"; 
  expandedBillKey = null;
  showView("customerDetail");
}

function setDetailYear(y) {
  detailYear = y;
  renderDetail();
}

function renderDetail() {
  if (!currentDetail) return;
  const cust = data[currentDetail.province][currentDetail.index];
  if (!cust) return;

  const name = cust[0], phone = cust[1], type = cust[2], job = cust[3];
  const entries = cust[4] || [];
  const address = cust[5] || "-";

  document.getElementById("detailEyebrow").textContent = currentDetail.province + " • " + type;
  document.getElementById("detailTitle").textContent = name;
  document.getElementById("detailInfo").textContent = "โทร: " + phone + "  |  เลขที่งาน: " + job;
  document.getElementById("detailAddress").textContent = address;

  const cYears = new Set();
  entries.forEach(e => { const y = getYearFromDate(e.date); if(y) cYears.add(y); });
  const sortedCYears = Array.from(cYears).sort((a,b)=>b-a);
  
  let tabsHtml = `<button class="year-tab ${detailYear === 'all' ? 'active' : ''}" onclick="setDetailYear('all')">รวมทุกปี</button>`;
  sortedCYears.forEach(y => {
    tabsHtml += `<button class="year-tab ${detailYear === y ? 'active' : ''}" onclick="setDetailYear('${y}')">ปี ${getThaiYear(y)}</button>`;
  });
  document.getElementById("detailYearTabs").innerHTML = tabsHtml;

  const filteredEntries = filterEntriesByYear(entries, detailYear);
  const totalPrice = filteredEntries.reduce((s, e) => s + (Number(e.price) || 0), 0);
  const billGroups = [];
  filteredEntries.forEach(entry => {
    const billKey = entry.bill || "-";
    let group = billGroups.find(item => item.key === billKey);
    if (!group) {
      group = { key: billKey, entries: [], total: 0 };
      billGroups.push(group);
    }
    group.entries.push({ entry, originalIdx: entries.indexOf(entry) });
    group.total += Number(entry.price) || 0;
  });
  visibleBillKeys = billGroups.map(group => group.key);

  document.getElementById("detailSummary").innerHTML = '<div class="detail-summary">' +
    '<div class="detail-card"><small>ประเภทงาน</small><strong>' + type + '</strong></div>' +
    '<div class="detail-card"><small>จำนวนเล่มบิล (' + (detailYear==="all"?"รวม":"ปี "+getThaiYear(detailYear)) + ')</small><strong>' + billGroups.length + ' เล่ม</strong></div>' +
    '<div class="detail-card"><small>ยอดรวม (' + (detailYear==="all"?"รวม":"ปี "+getThaiYear(detailYear)) + ')</small><strong class="price">฿' + formatPrice(totalPrice) + '</strong></div>' +
    '</div>';

  let html = '';
  if (filteredEntries.length) {
    html += '<div class="table-wrap"><table class="table bill-table"><thead><tr><th>เล่มบิล</th><th>ยอดรวมของบิล</th><th></th></tr></thead><tbody>';
    billGroups.forEach((group, groupIdx) => {
      const isOpen = expandedBillKey === group.key;
      html += '<tr class="bill-row" onclick="toggleBillGroup(' + groupIdx + ')">' +
        '<td><b>' + escapeHtml(group.key) + '</b><small>' + group.entries.length + ' รายการ</small></td>' +
        '<td class="bill-total">฿' + formatPrice(group.total) + '</td>' +
        '<td class="bill-toggle">' + (isOpen ? '▲' : '▼') + '</td></tr>';
      if (!isOpen) return;
      html += '<tr class="bill-detail-row"><td colspan="3"><div class="bill-items"><table><thead><tr><th>วันที่</th><th>รายละเอียด</th><th>จำนวน</th><th>ราคา</th><th>ภาษี</th><th></th></tr></thead><tbody>';
      group.entries.forEach(({ entry: e, originalIdx }) => {
        html += '<tr><td>' + formatDate(e.date) + '</td><td><b>' + escapeHtml(e.desc) + '</b></td>' +
          '<td>' + (e.quantity || 1) + '</td><td class="item-price">฿' + formatPrice(e.price) + '</td>' +
          '<td>' + (e.hasVat ? '<span class="tag orange">VAT 7%</span>' : '-') + '</td>' +
          '<td><div class="row-actions"><button class="edit-btn" onclick="event.stopPropagation();openEditEntry(' + originalIdx + ')">✏️ แก้ไข</button><button class="danger-btn" onclick="event.stopPropagation();confirmDeleteEntry(' + originalIdx + ')">🗑️ ลบ</button></div></td></tr>';
      });
      html += '</tbody></table></div></td></tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += '<div class="table-wrap"><div class="empty">ยังไม่มีรายการ — กด "+ เพิ่มรายการ" เพื่อเริ่มต้น</div></div>';
  }

  document.getElementById("detailTable").innerHTML = html;
}

function toggleBillGroup(groupIdx) {
  const key = visibleBillKeys[groupIdx];
  expandedBillKey = expandedBillKey === key ? null : key;
  renderDetail();
}

function goBackFromDetail() {
  currentDetail = null;
  showView(detailReturnView || "customers");
}

/* ===== Edit / Delete Customer ===== */
function openEditCustomer() {
  if (!currentDetail) return;
  const cust = data[currentDetail.province][currentDetail.index];
  document.getElementById("editName").value = cust[0];
  document.getElementById("editPhone").value = cust[1];
  document.getElementById("editType").value = cust[2];
  document.getElementById("editAddress").value = cust[5] || "";
  document.getElementById("editModal").classList.add("open");
}

function closeEditModal() {
  document.getElementById("editModal").classList.remove("open");
}

function saveEditCustomer() {
  if (!currentDetail) return;
  const cust = data[currentDetail.province][currentDetail.index];
  const name = document.getElementById("editName").value.trim();
  const phone = document.getElementById("editPhone").value.trim();
  const type = document.getElementById("editType").value;
  const address = document.getElementById("editAddress").value.trim();

  if (!name) return alert("กรุณาใส่ชื่อลูกค้า");

  cust[0] = name;
  cust[1] = phone || "-";
  cust[2] = type;
  cust[5] = address || "-";

  closeEditModal();
  renderDetail();
  renderStats();
  alert("แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว");
}

function confirmDeleteCustomer() {
  if (!currentDetail) return;
  pendingDeleteCustomer = currentDetail;
  showConfirm("ยืนยันการลบลูกค้า", "ต้องการลบลูกค้าและประวัติทั้งหมดหรือไม่? ลบแล้วไม่สามารถกู้คืนได้", executeDeleteCustomer);
}

function executeDeleteCustomer() {
  if (pendingDeleteCustomer) {
    const { province, index } = pendingDeleteCustomer;
    data[province].splice(index, 1);
    pendingDeleteCustomer = null;
    closeConfirm();
    closeEditModal();
    currentDetail = null;
    initGlobalYears(); 
    renderStats();
    showView("customers");
  }
}

/* ===== Add Entry Modal ===== */
function openAddEntry() {
  if (!currentDetail) return;
  editingEntryId = null;
  const cust = data[currentDetail.province][currentDetail.index];
  document.getElementById("entryModalTitle").textContent = "เพิ่มรายการ";
  document.getElementById("entryModalSub").textContent = "เพิ่มรายการให้ " + cust[0];
  document.getElementById("addEntryItemButton").classList.remove("hidden");
  document.getElementById("saveEntryButton").textContent = "บันทึกรายการ";
  document.getElementById("entryDate").value = new Date().toISOString().split("T")[0];
  document.getElementById("entryBill").value = "";
  document.getElementById("entryItems").innerHTML = "";
  addEntryItemRow();
  updateEntryTotals();
  document.getElementById("entryModal").classList.add("open");
}

function openEditEntry(entryIdx) {
  if (!currentDetail) return;
  const cust = data[currentDetail.province][currentDetail.index];
  const entry = cust[4]?.[entryIdx];
  if (!entry) return;
  editingEntryId = entry.id;
  document.getElementById("entryModalTitle").textContent = "แก้ไขรายการ";
  document.getElementById("entryModalSub").textContent = "แก้ไขรายการของ " + cust[0];
  document.getElementById("entryDate").value = entry.date || "";
  document.getElementById("entryBill").value = entry.bill === "-" ? "" : entry.bill;
  document.getElementById("entryItems").innerHTML = "";
  document.getElementById("addEntryItemButton").classList.add("hidden");
  document.getElementById("saveEntryButton").textContent = "บันทึกการแก้ไข";
  addEntryItemRow(entry);
  updateEntryTotals();
  document.getElementById("entryModal").classList.add("open");
}

function addEntryItemRow(item = null) {
  const row = document.createElement("div");
  row.className = "entry-item-row";
  row.innerHTML = `
    <div class="entry-item-top">
      <label>รายละเอียด<input class="entry-item-desc" placeholder="เช่น ตราชั่ง 100 ตัน" oninput="updateEntryTotals()"></label>
      <label>จำนวน<input class="entry-item-qty" type="number" min="1" value="1" oninput="updateEntryTotals()"></label>
      <button type="button" class="entry-remove" title="ลบรายการ" onclick="removeEntryItemRow(this)">×</button>
    </div>
    <div class="entry-item-bottom">
      <label>ราคาต่อหน่วย (บาท)<input class="entry-item-price" type="number" min="0" step="0.01" placeholder="0.00" oninput="updateEntryTotals()"></label>
      <label class="entry-vat"><input class="entry-item-vat" type="checkbox" onchange="updateEntryTotals()"> ภาษี 7%</label>
    </div>
    <div class="entry-line-total">รวมรายการ ฿0</div>
  `;
  document.getElementById("entryItems").appendChild(row);
  if (item) {
    row.querySelector(".entry-item-desc").value = item.desc || "";
    row.querySelector(".entry-item-qty").value = item.quantity || 1;
    row.querySelector(".entry-item-price").value = Number(item.unitPrice) || 0;
    row.querySelector(".entry-item-vat").checked = Boolean(item.hasVat);
    row.querySelector(".entry-remove").classList.add("hidden");
  }
}

function removeEntryItemRow(button) {
  const rows = document.querySelectorAll(".entry-item-row");
  if (rows.length === 1) return alert("ต้องมีอย่างน้อย 1 รายการ");
  button.closest(".entry-item-row").remove();
  updateEntryTotals();
}

function getEntryFormItems() {
  return Array.from(document.querySelectorAll(".entry-item-row")).map(row => {
    const quantity = Math.max(1, Number(row.querySelector(".entry-item-qty").value) || 1);
    const unitPrice = Math.max(0, Number(row.querySelector(".entry-item-price").value) || 0);
    const hasVat = row.querySelector(".entry-item-vat").checked;
    return {
      row,
      description: row.querySelector(".entry-item-desc").value.trim(),
      quantity,
      unitPrice,
      hasVat,
      total: quantity * unitPrice * (hasVat ? 1.07 : 1)
    };
  });
}

function updateEntryTotals() {
  const items = getEntryFormItems();
  items.forEach(item => {
    item.row.querySelector(".entry-line-total").textContent = "รวมรายการ ฿" + formatPrice(item.total);
  });
  document.getElementById("entryGrandTotal").textContent = "฿" + formatPrice(items.reduce((sum, item) => sum + item.total, 0));
}

function closeEntryModal() {
  document.getElementById("entryModal").classList.remove("open");
  editingEntryId = null;
}

function saveEntry() {
  if (!currentDetail) return;
  const date = document.getElementById("entryDate").value;
  const desc = document.getElementById("entryDesc").value.trim();
  const price = document.getElementById("entryPrice").value;
  const bill = document.getElementById("entryBill").value.trim();

  if (!desc) return alert("กรุณาใส่รายละเอียด");
  if (!price) return alert("กรุณาใส่ราคา");

  const cust = data[currentDetail.province][currentDetail.index];
  if (!cust[4]) cust[4] = [];
  
  const entryDate = date || new Date().toISOString().split("T")[0];
  cust[4].push({ date: entryDate, desc, price: Number(price), bill: bill || "-" });

  const y = getYearFromDate(entryDate);
  if (!Array.from(document.getElementById("globalYear").options).some(o => o.value === y)) {
    initGlobalYears();
  }

  closeEntryModal();
  renderDetail();
  renderStats();
  alert("เพิ่มรายการเรียบร้อยแล้ว");
}

/* ===== Delete Entry ===== */
function confirmDeleteEntry(entryIdx) {
  pendingDeleteIdx = entryIdx;
  showConfirm("ยืนยันการลบรายการ", "ต้องการลบรายการนี้หรือไม่? ลบแล้วไม่สามารถกู้คืนได้", executeDeleteEntry);
}

function executeDeleteEntry() {
  if (currentDetail && pendingDeleteIdx !== null) {
    const cust = data[currentDetail.province][currentDetail.index];
    if (cust[4]) {
      cust[4].splice(pendingDeleteIdx, 1);
    }
    pendingDeleteIdx = null;
    closeConfirm();
    renderDetail();
    renderStats();
  }
}

/* ===== Reusable Confirm Dialog ===== */
let confirmActionCallback = null;

function showConfirm(title, msg, callback) {
  document.getElementById("confirmTitle").textContent = title;
  document.getElementById("confirmMsg").textContent = msg;
  confirmActionCallback = callback;
  document.getElementById("confirmOverlay").classList.add("open");
}

function closeConfirm() {
  document.getElementById("confirmOverlay").classList.remove("open");
  confirmActionCallback = null;
}

function cancelConfirm() {
  pendingDeleteIdx = null;
  pendingDeleteCustomer = null;
  closeConfirm();
}

function executeConfirm() {
  if (confirmActionCallback) {
    confirmActionCallback();
  }
}

/* ===== Navigation ===== */
function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active-view"));
  document.getElementById(id).classList.add("active-view");
  document.querySelectorAll(".nav-item:not(.year-nav)").forEach(b =>
    b.classList.toggle("active", b.dataset.view === id && !(id === "jobs" && globalYear !== "all"))
  );
  document.querySelectorAll(".year-nav").forEach(b =>
    b.classList.toggle("active", id === "jobs" && b.dataset.year === globalYear)
  );
  document.getElementById("pageTitle").textContent = titles[id] || "แดชบอร์ดงาน";

  if (id === "customers") renderCustomers();
  if (id === "jobs") renderJobs();
  if (id === "customerDetail") renderDetail();
  if (id === "users" && typeof loadUsers === "function") loadUsers();
  window.scrollTo(0, 0);
}

/* ===== Add Customer Modal ===== */
function openAddCustomer() {
  const s = document.getElementById("newProvince");
  s.innerHTML = ALL_PROVINCES.map(p => '<option>' + p + '</option>').join("");
  
  const currentProvFilter = document.getElementById("filterProvCustomers").value;
  if (currentProvFilter && currentProvFilter !== "all") {
    s.value = currentProvFilter;
  }
  
  document.getElementById("newName").value = "";
  document.getElementById("newAddress").value = "";
  document.getElementById("newPhone").value = "";
  document.getElementById("newType").value = "ขาย";
  document.getElementById("modal").classList.add("open");
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

function saveCustomer() {
  const p = document.getElementById("newProvince").value;
  const n = document.getElementById("newName").value.trim();
  const address = document.getElementById("newAddress").value.trim();
  const phone = document.getElementById("newPhone").value.trim();
  const type = document.getElementById("newType").value;

  if (!n) return alert("กรุณาใส่ชื่อลูกค้า");

  const prefix = type === "ขาย" ? "SC" : type === "ติดตั้ง" ? "IN" : "RP";
  const num = 1000 + allCustomers().length + 1;
  const currentYear = new Date().getFullYear().toString();

  if (!data[p]) data[p] = [];
  data[p].push([n, phone || "-", type, prefix + "-" + num, [], address || "-", currentYear]);

  closeModal();
  initGlobalYears();
  renderStats();
  
  if (document.getElementById("customers").classList.contains("active-view")) renderCustomers();
  alert("เพิ่มลูกค้าเรียบร้อยแล้ว");
}

/* ===== Init ===== */
document.querySelectorAll(".nav-item").forEach(b =>
  b.addEventListener("click", () => {
    if (b.dataset.view === "jobs") {
      globalYear = "all";
      document.getElementById("globalYear").value = "all";
      renderSidebarYears();
      renderStats();
    }
    if (b.dataset.view) showView(b.dataset.view);
  })
);
initGlobalYears();
renderStats();
