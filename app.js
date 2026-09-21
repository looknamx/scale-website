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
// Format: [Name, Phone, Type, JobNo, EntriesArray, Address, CreatedYear]
const data = {
  "กรุงเทพมหานคร": [
    ["บริษัท ไทยชั่ง จำกัด","081-234-5678","ขาย","SC-1001",
      [
        { date:"2025-09-15", desc:"ตราชั่งดิจิตอล 100 ตัน", price:350000, bill:"BL-0012" },
        { date:"2024-08-20", desc:"ตราชั่งพื้น 5 ตัน", price:45000, bill:"BL-0008" }
      ],
      "123/4 ถ.สุขุมวิท แขวงบางจาก เขตพระโขนง", "2024"
    ],
    ["ร้านสมชายการเกษตร","089-222-1122","ติดตั้ง","IN-1008",
      [
        { date:"2025-09-10", desc:"ติดตั้งเครื่องชั่งข้าว 20 ตัน", price:180000, bill:"BL-0015" }
      ],
      "55/1 ตลาดไท", "2025"
    ]
  ],
  "ชลบุรี": [
    ["โรงงาน ABC","086-333-4455","ซ่อม","RP-2012",
      [
        { date:"2025-09-01", desc:"ซ่อมเซ็นเซอร์โหลดเซลล์", price:12000, bill:"BL-0020" },
        { date:"2023-07-15", desc:"เปลี่ยนจอแสดงผล", price:8500, bill:"BL-0005" }
      ],
      "นิคมอุตสาหกรรมอมตะนคร", "2023"
    ],
    ["หจก.ชลบุรีชั่งตวง","081-555-6622","ขาย","SC-1018",
      [
        { date:"2025-09-18", desc:"ตราชั่งรถบรรทุก 60 ตัน", price:520000, bill:"BL-0022" }
      ],
      "99 ม.2 ต.ดอนหัวฬ่อ", "2025"
    ]
  ],
  "ระยอง": [
    ["บริษัท ระยองอุตสาหกรรม","082-111-2233","ติดตั้ง","IN-1020",
      [
        { date:"2024-09-05", desc:"ติดตั้งระบบชั่งน้ำหนักอัตโนมัติ", price:750000, bill:"BL-0025" }
      ],
      "นิคมอุตสาหกรรมมาบตาพุด", "2024"
    ]
  ],
  "ฉะเชิงเทรา": [
    ["ร้านเกษตรรุ่งเรือง","089-456-7788","ขาย","SC-1025",
      [
        { date:"2022-08-28", desc:"ตราชั่งตั้งพื้น 500 กก.", price:28000, bill:"BL-0018" }
      ],
      "ตัวเมืองฉะเชิงเทรา", "2022"
    ]
  ]
};

/* ===== State ===== */
let selectedProvince = null;
let currentDetail = null; // { province, index }
let pendingDeleteIdx = null; // For entry deletion
let globalYear = "all"; // "all" or "2025" etc.
let detailYear = "all"; // Year filter inside customer detail
let pendingDeleteCustomer = null; // For customer deletion { province, index }

const titles = {
  dashboard: "แดชบอร์ดงาน",
  provinces: "จังหวัด / พื้นที่",
  customers: "ลูกค้าทั้งหมด",
  sales: "งานขาย",
  install: "งานติดตั้ง",
  repair: "งานซ่อม",
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

// Convert CE (2025) to BE (2568)
function getThaiYear(yearStr) {
  if (yearStr === "all") return "ทุกปี";
  const y = parseInt(yearStr, 10);
  return isNaN(y) ? yearStr : (y + 543).toString();
}

// Extract year from date string (YYYY-MM-DD)
function getYearFromDate(dateStr) {
  if (!dateStr) return null;
  return dateStr.split("-")[0];
}

// Get all unique years from entries and customer creation dates
function getAvailableYears() {
  const years = new Set();
  allCustomers().forEach(c => {
    if (c.createdYear && c.createdYear !== "-") years.add(c.createdYear);
    c.entries.forEach(e => {
      const y = getYearFromDate(e.date);
      if (y) years.add(y);
    });
  });
  return Array.from(years).sort((a, b) => b - a); // Descending
}

function filterEntriesByYear(entries, year) {
  if (year === "all") return entries;
  return entries.filter(e => getYearFromDate(e.date) === year);
}

// Check if customer is active in the given year
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
}

function onGlobalYearChange() {
  globalYear = document.getElementById("globalYear").value;
  renderStats();
  // Refresh current view
  const activeView = document.querySelector(".view.active-view").id;
  if (activeView === "customers") renderCustomers();
  if (activeView === "sales") renderJobs("ขาย", "salesTable");
  if (activeView === "install") renderJobs("ติดตั้ง", "installTable");
  if (activeView === "repair") renderJobs("ซ่อม", "repairTable");
}

/* ===== Render Stats ===== */
function renderStats() {
  let cs = allCustomers();
  if (globalYear !== "all") {
    cs = cs.filter(c => isCustomerInYear(c, globalYear));
  }
  
  // Calculate revenue for the selected year
  let totalSalesRev = 0, totalInstallRev = 0, totalRepairRev = 0;
  
  cs.forEach(c => {
    const yearEntries = filterEntriesByYear(c.entries, globalYear);
    const rev = yearEntries.reduce((sum, e) => sum + (Number(e.price) || 0), 0);
    if (c.type === "ขาย") totalSalesRev += rev;
    else if (c.type === "ติดตั้ง") totalInstallRev += rev;
    else if (c.type === "ซ่อม") totalRepairRev += rev;
  });

  // Count active provinces based on filtered customers
  const activeProvinces = new Set(cs.map(c => c.province)).size;

  document.getElementById("provinceCount").textContent = activeProvinces;
  document.getElementById("customerCount").textContent = cs.length;
  document.getElementById("salesCount").textContent = cs.filter(x => x.type === "ขาย").length;
  document.getElementById("serviceCount").textContent = cs.filter(x => x.type !== "ขาย").length;
  
  // Update sidebar badges (always show all-time or based on global year? Let's use global year)
  document.getElementById("salesBadge").textContent = cs.filter(x => x.type === "ขาย").length;
  document.getElementById("installBadge").textContent = cs.filter(x => x.type === "ติดตั้ง").length;
  document.getElementById("repairBadge").textContent = cs.filter(x => x.type === "ซ่อม").length;

  // Render Yearly Summary Revenue (Dashboard only)
  document.getElementById("dashYearlySummary").innerHTML = `
    <div class="section-head" style="margin-top:10px;"><h2>สรุปรายได้ ${globalYear === 'all' ? 'รวมทุกปี' : 'ประจำปี ' + getThaiYear(globalYear)}</h2></div>
    <div class="revenue-cards">
      <div class="revenue-card"><small>ยอดขายตราชั่ง</small><h2>฿${formatPrice(totalSalesRev)}</h2></div>
      <div class="revenue-card"><small>ยอดงานติดตั้ง</small><h2>฿${formatPrice(totalInstallRev)}</h2></div>
      <div class="revenue-card"><small>ยอดงานซ่อม</small><h2>฿${formatPrice(totalRepairRev)}</h2></div>
    </div>
  `;
}

/* ===== Province Cards (Dashboard) ===== */
function provinceCard(p) {
  const n = data[p].length;
  return '<div class="province-card" onclick="openProvince(\'' + p + '\')">' +
    '<div class="pin">📍</div><b>' + p + '</b>' +
    '<small>พื้นที่รับผิดชอบ</small>' +
    '<strong>' + n + ' ลูกค้า →</strong></div>';
}

function renderHome() {
  const provinces = Object.keys(data).filter(k => data[k].length > 0);
  document.getElementById("provinceGrid").innerHTML = provinces.slice(0, 8).map(provinceCard).join("");
}

/* ===== Province List ===== */
function renderProvinces() {
  const q = (document.getElementById("provinceSearch").value || "").toLowerCase();
  const ps = Object.keys(data).filter(k => data[k].length > 0 && k.toLowerCase().includes(q));
  document.getElementById("provinceResult").textContent = ps.length + " จังหวัด";
  document.getElementById("provinceList").innerHTML = ps.map(p =>
    '<div class="province-row" onclick="openProvince(\'' + p + '\')">' +
    '<div class="pin">📍</div><div><b>' + p + '</b>' +
    '<small>ดูรายชื่อลูกค้าและงาน</small></div>' +
    '<strong>' + data[p].length + ' ลูกค้า →</strong></div>'
  ).join("") || '<div class="empty">ไม่พบจังหวัดที่ค้นหา</div>';
}

/* ===== Customer List ===== */
function renderCustomers() {
  let cs = allCustomers();
  
  if (globalYear !== "all") {
    cs = cs.filter(c => isCustomerInYear(c, globalYear));
  }

  const q = (document.getElementById("customerSearch").value || "").toLowerCase();
  if (q) cs = cs.filter(x => Object.values(x).some(v => String(v).toLowerCase().includes(q)));
  if (selectedProvince) cs = cs.filter(x => x.province === selectedProvince);

  document.getElementById("customerEyebrow").textContent = selectedProvince || "ลูกค้า";
  document.getElementById("customerTitle").textContent = selectedProvince
    ? "ลูกค้า • " + selectedProvince : "ลูกค้าทั้งหมด";

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

/* ===== Job Tables (Sales/Install/Repair) ===== */
function renderJobs(type, id) {
  let cs = allCustomers().filter(x => x.type === type);
  if (globalYear !== "all") {
    cs = cs.filter(c => isCustomerInYear(c, globalYear));
  }

  document.getElementById(id).innerHTML = cs.length
    ? '<table class="table"><thead><tr>' +
      '<th>เลขที่งาน</th><th>ลูกค้า</th><th>จังหวัด</th><th>โทรศัพท์</th><th>สถานะ</th><th>รายการ</th><th></th>' +
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
    : '<div class="empty">ไม่มีงานประเภทนี้ในเงื่อนไขที่เลือก</div>';
}

/* ===== Customer Detail View ===== */
function openDetail(province, idx) {
  currentDetail = { province, index: idx };
  detailYear = "all"; // Reset detail year filter
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

  // Year Tabs for Detail
  const cYears = new Set();
  entries.forEach(e => { const y = getYearFromDate(e.date); if(y) cYears.add(y); });
  const sortedCYears = Array.from(cYears).sort((a,b)=>b-a);
  
  let tabsHtml = `<button class="year-tab ${detailYear === 'all' ? 'active' : ''}" onclick="setDetailYear('all')">รวมทุกปี</button>`;
  sortedCYears.forEach(y => {
    tabsHtml += `<button class="year-tab ${detailYear === y ? 'active' : ''}" onclick="setDetailYear('${y}')">ปี ${getThaiYear(y)}</button>`;
  });
  document.getElementById("detailYearTabs").innerHTML = tabsHtml;

  // Filter entries
  const filteredEntries = filterEntriesByYear(entries, detailYear);
  const totalPrice = filteredEntries.reduce((s, e) => s + (Number(e.price) || 0), 0);

  // Summary cards
  document.getElementById("detailSummary").innerHTML = '<div class="detail-summary">' +
    '<div class="detail-card"><small>ประเภทงาน</small><strong>' + type + '</strong></div>' +
    '<div class="detail-card"><small>จำนวนรายการ (' + (detailYear==="all"?"รวม":"ปี "+getThaiYear(detailYear)) + ')</small><strong>' + filteredEntries.length + ' รายการ</strong></div>' +
    '<div class="detail-card"><small>ยอดรวม (' + (detailYear==="all"?"รวม":"ปี "+getThaiYear(detailYear)) + ')</small><strong class="price">฿' + formatPrice(totalPrice) + '</strong></div>' +
    '</div>';

  // Entries table
  let html = '';
  if (filteredEntries.length) {
    html += '<div class="table-wrap"><table class="table"><thead><tr>' +
      '<th>วันที่</th><th>รายละเอียด</th><th>ราคา (บาท)</th><th>เล่มบิล</th><th></th>' +
      '</tr></thead><tbody>';
    
    // We need original index for deletion
    entries.forEach((e, originalIdx) => {
      if (detailYear !== "all" && getYearFromDate(e.date) !== detailYear) return;
      
      html += '<tr>' +
        '<td>' + formatDate(e.date) + '</td>' +
        '<td><b>' + e.desc + '</b></td>' +
        '<td style="color:var(--primary);font-weight:700">฿' + formatPrice(e.price) + '</td>' +
        '<td>' + e.bill + '</td>' +
        '<td><button class="danger-btn" onclick="confirmDeleteEntry(' + originalIdx + ')">🗑️ ลบ</button></td>' +
        '</tr>';
    });
    html += '</tbody></table></div>';
  } else {
    html += '<div class="table-wrap"><div class="empty">ยังไม่มีรายการ — กด "+ เพิ่มรายการ" เพื่อเริ่มต้น</div></div>';
  }

  document.getElementById("detailTable").innerHTML = html;
}

function goBackFromDetail() {
  currentDetail = null;
  const activeViewObj = document.querySelector(".nav-item.active");
  const prevView = activeViewObj ? activeViewObj.dataset.view : "customers";
  showView(prevView);
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
    
    // Refresh UI
    currentDetail = null;
    renderStats();
    renderHome();
    initGlobalYears(); // Re-evaluate years just in case
    showView("customers");
  }
}


/* ===== Add Entry Modal ===== */
function openAddEntry() {
  if (!currentDetail) return;
  const cust = data[currentDetail.province][currentDetail.index];
  document.getElementById("entryModalSub").textContent = "เพิ่มรายการให้ " + cust[0];
  document.getElementById("entryDate").value = new Date().toISOString().split("T")[0];
  document.getElementById("entryDesc").value = "";
  document.getElementById("entryPrice").value = "";
  document.getElementById("entryBill").value = "";
  document.getElementById("entryModal").classList.add("open");
}

function closeEntryModal() {
  document.getElementById("entryModal").classList.remove("open");
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

  // Update global years if new year introduced
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
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === id));
  document.getElementById("pageTitle").textContent = titles[id] || "แดชบอร์ดงาน";

  if (id === "provinces") renderProvinces();
  if (id === "customers") renderCustomers();
  if (id === "sales") renderJobs("ขาย", "salesTable");
  if (id === "install") renderJobs("ติดตั้ง", "installTable");
  if (id === "repair") renderJobs("ซ่อม", "repairTable");
  if (id === "customerDetail") renderDetail();
  window.scrollTo(0, 0);
}

function openProvince(p) {
  selectedProvince = p;
  document.getElementById("customerSearch").value = "";
  showView("customers");
}

/* ===== Add Customer Modal ===== */
function openAddCustomer() {
  const s = document.getElementById("newProvince");
  s.innerHTML = ALL_PROVINCES.map(p => '<option>' + p + '</option>').join("");
  if (selectedProvince) s.value = selectedProvince;
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
  // [Name, Phone, Type, JobNo, Entries, Address, CreatedYear]
  data[p].push([n, phone || "-", type, prefix + "-" + num, [], address || "-", currentYear]);

  closeModal();
  initGlobalYears(); // Re-evaluate years just in case
  renderStats();
  renderHome();
  if (document.getElementById("provinces").classList.contains("active-view")) renderProvinces();
  if (selectedProvince === p && document.getElementById("customers").classList.contains("active-view")) renderCustomers();
  alert("เพิ่มลูกค้าเรียบร้อยแล้ว");
}

/* ===== Init ===== */
document.querySelectorAll(".nav-item").forEach(b =>
  b.addEventListener("click", () => {
    if (b.dataset.view) showView(b.dataset.view);
  })
);
initGlobalYears();
renderStats();
renderHome();