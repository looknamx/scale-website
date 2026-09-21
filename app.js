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
const data = {
  "กรุงเทพมหานคร": [
    ["บริษัท ไทยชั่ง จำกัด","081-234-5678","ขาย","SC-1001",
      [
        { date:"2025-09-15", desc:"ตราชั่งดิจิตอล 100 ตัน", price:350000, bill:"BL-0012" },
        { date:"2025-08-20", desc:"ตราชั่งพื้น 5 ตัน", price:45000, bill:"BL-0008" }
      ]
    ],
    ["ร้านสมชายการเกษตร","089-222-1122","ติดตั้ง","IN-1008",
      [
        { date:"2025-09-10", desc:"ติดตั้งเครื่องชั่งข้าว 20 ตัน", price:180000, bill:"BL-0015" }
      ]
    ]
  ],
  "ชลบุรี": [
    ["โรงงาน ABC","086-333-4455","ซ่อม","RP-2012",
      [
        { date:"2025-09-01", desc:"ซ่อมเซ็นเซอร์โหลดเซลล์", price:12000, bill:"BL-0020" },
        { date:"2025-07-15", desc:"เปลี่ยนจอแสดงผล", price:8500, bill:"BL-0005" }
      ]
    ],
    ["หจก.ชลบุรีชั่งตวง","081-555-6622","ขาย","SC-1018",
      [
        { date:"2025-09-18", desc:"ตราชั่งรถบรรทุก 60 ตัน", price:520000, bill:"BL-0022" }
      ]
    ]
  ],
  "ระยอง": [
    ["บริษัท ระยองอุตสาหกรรม","082-111-2233","ติดตั้ง","IN-1020",
      [
        { date:"2025-09-05", desc:"ติดตั้งระบบชั่งน้ำหนักอัตโนมัติ", price:750000, bill:"BL-0025" }
      ]
    ]
  ],
  "ฉะเชิงเทรา": [
    ["ร้านเกษตรรุ่งเรือง","089-456-7788","ขาย","SC-1025",
      [
        { date:"2025-08-28", desc:"ตราชั่งตั้งพื้น 500 กก.", price:28000, bill:"BL-0018" }
      ]
    ]
  ],
  "นครราชสีมา": [
    ["โรงสีโคราช","081-765-4321","ซ่อม","RP-2021",
      [
        { date:"2025-09-12", desc:"ซ่อมระบบชั่งข้าวเปลือก", price:35000, bill:"BL-0030" }
      ]
    ]
  ],
  "ขอนแก่น": [
    ["บริษัท ขอนแก่นฟู้ดส์","083-222-3344","ขาย","SC-1032",
      [
        { date:"2025-09-08", desc:"ตราชั่งดิจิตอลตั้งโต๊ะ 30 กก.", price:15000, bill:"BL-0028" }
      ]
    ]
  ],
  "เชียงใหม่": [
    ["หจก.เหนือชั่ง","089-876-5432","ติดตั้ง","IN-1037",
      [
        { date:"2025-08-25", desc:"ติดตั้งเครื่องชั่งลำไย", price:95000, bill:"BL-0016" }
      ]
    ]
  ],
  "นครปฐม": [
    ["โรงงานนครปฐม","082-444-5566","ซ่อม","RP-2030",
      [
        { date:"2025-09-20", desc:"ซ่อมตราชั่งสายพาน", price:42000, bill:"BL-0035" }
      ]
    ]
  ]
};

/* ===== Page Titles ===== */
const titles = {
  dashboard: "แดชบอร์ดงาน",
  provinces: "จังหวัด / พื้นที่",
  customers: "ลูกค้าทั้งหมด",
  sales: "งานขาย",
  install: "งานติดตั้ง",
  repair: "งานซ่อม",
  customerDetail: "รายละเอียดลูกค้า"
};

let selectedProvince = null;
let currentDetail = null; // { province, index }
let pendingDeleteIdx = null;

/* ===== Helpers ===== */
function allCustomers() {
  return Object.entries(data).flatMap(([province, rows]) =>
    rows.map((r, idx) => ({
      province, name: r[0], phone: r[1], type: r[2], job: r[3],
      entries: r[4] || [], _idx: idx
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

/* ===== Render Stats ===== */
function renderStats() {
  const cs = allCustomers();
  document.getElementById("provinceCount").textContent = Object.keys(data).filter(k => data[k].length > 0).length;
  document.getElementById("customerCount").textContent = cs.length;
  document.getElementById("salesCount").textContent = cs.filter(x => x.type === "ขาย").length;
  document.getElementById("serviceCount").textContent = cs.filter(x => x.type !== "ขาย").length;
  document.getElementById("salesBadge").textContent = cs.filter(x => x.type === "ขาย").length;
  document.getElementById("installBadge").textContent = cs.filter(x => x.type === "ติดตั้ง").length;
  document.getElementById("repairBadge").textContent = cs.filter(x => x.type === "ซ่อม").length;
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
  const q = (document.getElementById("customerSearch").value || "").toLowerCase();
  if (q) cs = cs.filter(x => Object.values(x).some(v => String(v).toLowerCase().includes(q)));
  if (selectedProvince) cs = cs.filter(x => x.province === selectedProvince);

  document.getElementById("customerEyebrow").textContent = selectedProvince || "ลูกค้า";
  document.getElementById("customerTitle").textContent = selectedProvince
    ? "ลูกค้า • " + selectedProvince : "ลูกค้าทั้งหมด";

  document.getElementById("customerTable").innerHTML = cs.length
    ? '<table class="table"><thead><tr>' +
      '<th>ลูกค้า</th><th>จังหวัด</th><th>โทรศัพท์</th><th>ประเภทงาน</th><th>เลขที่งาน</th><th>รายการ</th><th></th>' +
      '</tr></thead><tbody>' +
      cs.map(x =>
        '<tr class="clickable" onclick="openDetail(\'' + x.province + '\',' + x._idx + ')">' +
        '<td><b>' + x.name + '</b></td>' +
        '<td>' + x.province + '</td>' +
        '<td>' + x.phone + '</td>' +
        '<td>' + typeTag(x.type) + '</td>' +
        '<td>' + x.job + '</td>' +
        '<td><span class="tag sale">' + x.entries.length + ' รายการ</span></td>' +
        '<td><button class="text-btn" onclick="event.stopPropagation();openDetail(\'' + x.province + '\',' + x._idx + ')">ดูรายละเอียด →</button></td>' +
        '</tr>'
      ).join("") +
      '</tbody></table>'
    : '<div class="empty">ยังไม่มีข้อมูลลูกค้า</div>';
}

/* ===== Job Tables (Sales/Install/Repair) ===== */
function renderJobs(type, id) {
  const cs = allCustomers().filter(x => x.type === type);
  document.getElementById(id).innerHTML = cs.length
    ? '<table class="table"><thead><tr>' +
      '<th>เลขที่งาน</th><th>ลูกค้า</th><th>จังหวัด</th><th>โทรศัพท์</th><th>สถานะ</th><th>รายการ</th><th></th>' +
      '</tr></thead><tbody>' +
      cs.map(x =>
        '<tr class="clickable" onclick="openDetail(\'' + x.province + '\',' + x._idx + ')">' +
        '<td><b>' + x.job + '</b></td>' +
        '<td>' + x.name + '</td>' +
        '<td>' + x.province + '</td>' +
        '<td>' + x.phone + '</td>' +
        '<td>' + typeTag(x.type) + '</td>' +
        '<td><span class="tag sale">' + x.entries.length + ' รายการ</span></td>' +
        '<td><button class="text-btn" onclick="event.stopPropagation();openDetail(\'' + x.province + '\',' + x._idx + ')">ดูรายละเอียด →</button></td>' +
        '</tr>'
      ).join("") +
      '</tbody></table>'
    : '<div class="empty">ยังไม่มีงานประเภทนี้</div>';
}

/* ===== Customer Detail View ===== */
function openDetail(province, idx) {
  currentDetail = { province, index: idx };
  showView("customerDetail");
}

function renderDetail() {
  if (!currentDetail) return;
  const cust = data[currentDetail.province][currentDetail.index];
  if (!cust) return;

  const name = cust[0], phone = cust[1], type = cust[2], job = cust[3];
  const entries = cust[4] || [];

  document.getElementById("detailEyebrow").textContent = currentDetail.province + " • " + type;
  document.getElementById("detailTitle").textContent = name;
  document.getElementById("detailInfo").textContent = "โทร: " + phone + "  |  เลขที่งาน: " + job;

  // Summary cards
  const totalPrice = entries.reduce((s, e) => s + (Number(e.price) || 0), 0);

  let html = '<div class="detail-summary">' +
    '<div class="detail-card"><small>ประเภทงาน</small><strong>' + type + '</strong></div>' +
    '<div class="detail-card"><small>จำนวนรายการ</small><strong>' + entries.length + ' รายการ</strong></div>' +
    '<div class="detail-card"><small>ยอดรวมทั้งหมด</small><strong class="price">฿' + formatPrice(totalPrice) + '</strong></div>' +
    '</div>';

  // Entries table
  if (entries.length) {
    html += '<div class="table-wrap"><table class="table"><thead><tr>' +
      '<th>วันที่</th><th>รายละเอียด</th><th>ราคา (บาท)</th><th>เล่มบิล</th><th></th>' +
      '</tr></thead><tbody>';
    entries.forEach((e, i) => {
      html += '<tr>' +
        '<td>' + formatDate(e.date) + '</td>' +
        '<td><b>' + e.desc + '</b></td>' +
        '<td style="color:var(--primary);font-weight:700">฿' + formatPrice(e.price) + '</td>' +
        '<td>' + e.bill + '</td>' +
        '<td><button class="danger-btn" onclick="confirmDeleteEntry(' + i + ')">🗑️ ลบ</button></td>' +
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
  // Go back to previous view based on context
  if (selectedProvince) {
    showView("customers");
  } else {
    showView("customers");
  }
}

/* ===== Add Entry Modal ===== */
function openAddEntry() {
  if (!currentDetail) return;
  const cust = data[currentDetail.province][currentDetail.index];
  document.getElementById("entryModalSub").textContent = "เพิ่มรายการให้ " + cust[0];
  // Set default date to today
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
  cust[4].push({ date: date || new Date().toISOString().split("T")[0], desc, price: Number(price), bill: bill || "-" });

  closeEntryModal();
  renderDetail();
  renderStats();
  alert("เพิ่มรายการเรียบร้อยแล้ว");
}

/* ===== Delete Entry ===== */
function confirmDeleteEntry(entryIdx) {
  pendingDeleteIdx = entryIdx;
  // Create confirm overlay if not exists
  let overlay = document.getElementById("confirmOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "confirmOverlay";
    overlay.className = "confirm-overlay";
    overlay.innerHTML = '<div class="confirm-box">' +
      '<h3>ยืนยันการลบ</h3>' +
      '<p>ต้องการลบรายการนี้หรือไม่? ลบแล้วไม่สามารถกู้คืนได้</p>' +
      '<div class="confirm-actions">' +
      '<button class="secondary" onclick="cancelDelete()">ยกเลิก</button>' +
      '<button class="btn-delete" onclick="executeDelete()">ลบรายการ</button>' +
      '</div></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.add("open");
}

function cancelDelete() {
  pendingDeleteIdx = null;
  document.getElementById("confirmOverlay").classList.remove("open");
}

function executeDelete() {
  if (currentDetail && pendingDeleteIdx !== null) {
    const cust = data[currentDetail.province][currentDetail.index];
    if (cust[4]) {
      cust[4].splice(pendingDeleteIdx, 1);
    }
    pendingDeleteIdx = null;
    document.getElementById("confirmOverlay").classList.remove("open");
    renderDetail();
    renderStats();
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
  const phone = document.getElementById("newPhone").value.trim();
  const type = document.getElementById("newType").value;

  if (!n) return alert("กรุณาใส่ชื่อลูกค้า");

  const prefix = type === "ขาย" ? "SC" : type === "ติดตั้ง" ? "IN" : "RP";
  const num = 1000 + allCustomers().length + 1;
  if (!data[p]) data[p] = [];
  data[p].push([n, phone || "-", type, prefix + "-" + num, []]);

  closeModal();
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
renderStats();
renderHome();