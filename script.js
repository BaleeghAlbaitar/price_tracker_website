// Database Configuration using LocalStorage
let _db = {
  units: ["كيلو", "جرام", "ربطة", "حبة"],
  categories: [
    { name: "طماط", unit: "كيلو" },
    { name: "بطاط", unit: "كيلو" },
    { name: "بصل احمر", unit: "كيلو" },
    { name: "خيار", unit: "كيلو" },
    { name: "جزر", unit: "كيلو" },
    { name: "بيبار", unit: "كيلو" },
    { name: "كوسه", unit: "كيلو" },
    { name: "باذنجان", unit: "كيلو" },
    { name: "باميه", unit: "كيلو" },
    { name: "كبزرة", unit: "ربطة" },
    { name: "بقدونس", unit: "ربطة" },
    { name: "بصل اخضر", unit: "ربطة" },
    { name: "ثومة خضراء", unit: "ربطة" },
    { name: "خوعة", unit: "ربطة" },
  ],
  oldPrices: [],
};

let catModalObj, unitModalObj;

window.onload = function () {
  initDB();
  catModalObj = new bootstrap.Modal(document.getElementById("categoriesModal"));
  unitModalObj = new bootstrap.Modal(document.getElementById("unitsModal"));

  refreshDatalist();
  addRow("currentTable");
  addRow("oldTable");
};

// منع الحوسبة العشوائية لحقول الأرقام بالعجلة
document.addEventListener(
  "wheel",
  function (e) {
    if (e.target.type === "number") e.preventDefault();
  },
  { passive: false },
);

// Database Initialization
function initDB() {
  let savedDb = localStorage.getItem("priceAnalyzerApp_v2");
  if (savedDb) {
    _db = JSON.parse(savedDb);

    // Compatibility for old structures if any
    if (!_db.units) _db.units = ["كيلو", "جرام", "ربطة"];
    if (!_db.categories) _db.categories = [];
    if (!_db.oldPrices) _db.oldPrices = [];
  } else {
    saveDB();
  }
}

function saveDB() {
  localStorage.setItem("priceAnalyzerApp_v2", JSON.stringify(_db));
  refreshDatalist();
}

function refreshDatalist() {
  const datalist = document.getElementById("repeatedItemsList");
  datalist.innerHTML = "";
  _db.categories.forEach((cat) => {
    let option = document.createElement("option");
    option.value = cat.name;
    datalist.appendChild(option);
  });
}

/* ----- Management Modals Logic ----- */

// Categories Modal Logic
function openCategoriesModal() {
  populateCategoriesTable();
  populateUnitSelects();
  catModalObj.show();
}

function populateCategoriesTable() {
  const tbody = document.querySelector("#categoriesConfigTable tbody");
  tbody.innerHTML = "";
  _db.categories.forEach((cat, index) => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
                    <td class="fw-bold align-middle">${cat.name}</td>
                    <td class="align-middle text-muted">${cat.unit}</td>
                    <td class="align-middle">
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${index})"><i class="bi bi-trash"></i></button>
                    </td>
                `;
    tbody.appendChild(tr);
  });
}

function populateUnitSelects() {
  let select = document.getElementById("newCatUnit");
  select.innerHTML = "";
  _db.units.forEach((u) => {
    select.appendChild(new Option(u, u));
  });
}

function addNewCategory() {
  let name = document.getElementById("newCatName").value.trim();
  let unit = document.getElementById("newCatUnit").value;
  if (name === "") return;

  if (_db.categories.some((c) => c.name === name)) {
    Swal.fire({
      toast: true,
      position: "top",
      icon: "error",
      title: "هذا الصنف موجود مسبقاً",
      showConfirmButton: false,
      timer: 2000,
    });
    return;
  }

  _db.categories.unshift({ name, unit });
  saveDB();
  document.getElementById("newCatName").value = "";
  populateCategoriesTable();
  Swal.fire({
    toast: true,
    position: "top",
    icon: "success",
    title: "تم الاضافة",
    showConfirmButton: false,
    timer: 1500,
  });
}

function deleteCategory(index) {
  _db.categories.splice(index, 1);
  saveDB();
  populateCategoriesTable();
}

// Units Modal Logic
function openUnitsModal() {
  catModalObj.hide();
  populateUnitsList();
  unitModalObj.show();
}

function configModalsBack() {
  unitModalObj.hide();
  openCategoriesModal();
}

function populateUnitsList() {
  const list = document.getElementById("unitsListContainer");
  list.innerHTML = "";
  _db.units.forEach((u, index) => {
    let div = document.createElement("div");
    div.className =
      "list-group-item d-flex justify-content-between align-items-center py-3";
    div.innerHTML = `
                    <span class="fw-bold fs-6">${u}</span>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUnit(${index})" title="حذف الوحدة"><i class="bi bi-x-lg"></i></button>
                `;
    list.appendChild(div);
  });
}

function addNewUnit() {
  let name = document.getElementById("newUnitName").value.trim();
  if (name === "") return;
  if (_db.units.includes(name)) {
    Swal.fire({
      toast: true,
      position: "top",
      icon: "error",
      title: "الوحدة موجودة مسبقاً",
      showConfirmButton: false,
      timer: 2000,
    });
    return;
  }
  _db.units.push(name);
  saveDB();
  document.getElementById("newUnitName").value = "";
  populateUnitsList();
}

function deleteUnit(index) {
  let unitName = _db.units[index];
  // تحذير إذا كانت مرتبطة بأصناف
  let inUse = _db.categories.some((c) => c.unit === unitName);
  if (inUse) {
    Swal.fire(
      "خطأ!",
      "لا يمكنك حذف هذه الوحدة لوجود أصناف مرتبطة بها. قم بتعديل الأصناف أولاً.",
      "error",
    );
    return;
  }
  if (_db.units.length <= 1) {
    Swal.fire("خطأ!", "يجب ترك وحدة واحدة على الأقل بالبرنامج.", "error");
    return;
  }
  _db.units.splice(index, 1);
  saveDB();
  populateUnitsList();
}

/* ----- Main Table Handlers ----- */

function autoSelectUnit(input) {
  let val = input.value.trim();
  let matchedCat = _db.categories.find((c) => c.name === val);
  if (matchedCat) {
    let select = input.closest("tr").querySelector(".item-unit");
    if (select) select.value = matchedCat.unit;
  }
}

function addRow(tableId, data = null) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  const tr = document.createElement("tr");
  tr.className = "animated-row";

  let nameVal = data ? data.name : "";
  let qtyVal = data ? data.qty : "";
  let unitVal = data ? data.unit : _db.units.length > 0 ? _db.units[0] : "";
  let totalVal = data ? data.total : "";
  let unitPriceVal =
    data && data.qty && data.total
      ? (data.total / data.qty).toFixed(2)
      : "0.00";

  // إنشاء خيارات الوحدات من الداتابيز
  let optionsHTML = _db.units
    .map(
      (u) =>
        `<option value="${u}" ${unitVal === u ? "selected" : ""}>${u}</option>`,
    )
    .join("");

  tr.innerHTML = `
            <td>
                <input type="text" list="repeatedItemsList" class="form-control item-name" placeholder="أدخل الصنف..." value="${nameVal}" 
                       oninput="autoSelectUnit(this)" onkeydown="focusNext(event, this, 'item-qty')">
            </td>
            <td>
                <input type="number" class="form-control item-qty" placeholder="مثال: 5.5" value="${qtyVal}" 
                       oninput="calcUnitPrice(this)" min="0.1" step="0.1" onkeydown="focusNext(event, this, 'item-total')">
            </td>
            <td>
                <select class="form-select item-unit">${optionsHTML}</select>
            </td>
            <td>
                <input type="number" class="form-control item-total" placeholder="المبلغ" value="${totalVal}" 
                       oninput="calcUnitPrice(this)" onkeydown="handleEnterNewRow(event, this, '${tableId}')" min="0">
            </td>
            <td class="text-center"><span class="unit-price-display">${unitPriceVal}</span></td>
            <td><button class="btn-delete-row" onclick="removeRow(this)"><i class="bi bi-trash-fill fs-5"></i></button></td>
            `;
  tbody.appendChild(tr);
  return tr;
}

function removeRow(btn) {
  let tr = btn.closest("tr");
  tr.classList.add("row-removing");
  setTimeout(() => tr.remove(), 300);
}

function focusNext(event, currentElement, nextClass) {
  if (event.key === "Enter") {
    event.preventDefault();
    let nextElement = currentElement
      .closest("tr")
      .querySelector("." + nextClass);
    if (nextElement) {
      nextElement.focus();
      nextElement.select();
    }
  }
}

function handleEnterNewRow(event, inputElement, tableId) {
  if (event.key === "Enter") {
    event.preventDefault();
    let newRow = addRow(tableId);
    newRow.querySelector(".item-name").focus();
  }
}

function calcUnitPrice(element) {
  let tr = element.closest("tr");
  let qty = parseFloat(tr.querySelector(".item-qty").value);
  let total = parseFloat(tr.querySelector(".item-total").value);
  let display = tr.querySelector(".unit-price-display");
  display.innerText = qty > 0 && total >= 0 ? (total / qty).toFixed(2) : "0.00";
}

/* ----- Core Data Operations (Serverless Mode) ----- */

function loadOldPricesDirectly() {
  if (!_db.oldPrices || _db.oldPrices.length === 0) {
    Swal.fire(
      "لا توجد بيانات",
      "لا توجد أسعار محفوظة مسبقاً لجلبها في قاعدة البيانات المحلية.",
      "info",
    );
    return;
  }

  document.querySelector(`#oldTable tbody`).innerHTML = "";
  _db.oldPrices.forEach((item, index) => {
    setTimeout(() => addRow("oldTable", item), index * 50);
  });

  Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
  }).fire({ icon: "success", title: "تم جلب الأسعار بنجاح!" });
}

function saveCurrentPricesLocally() {
  const currentRows = document.querySelectorAll("#currentTable tbody tr");
  let newData = [];

  currentRows.forEach((row) => {
    let name = row.querySelector(".item-name").value.trim();
    let qty = parseFloat(row.querySelector(".item-qty").value);
    let unit = row.querySelector(".item-unit").value;
    let total = parseFloat(row.querySelector(".item-total").value);

    if (name && !isNaN(qty) && !isNaN(total)) {
      newData.push({ name, qty, unit, total });
      // التعلق التلقائي بالـ Categories بحال لم يكن الصنف مضاف واختياره وحدة معينة
      if (!_db.categories.some((c) => c.name === name)) {
        _db.categories.push({ name, unit });
      }
    }
  });

  if (newData.length === 0) {
    Swal.fire("خطأ!", "لا توجد بيانات صالحة في فاتورة اليوم لحفظها.", "error");
    return;
  }

  _db.oldPrices = newData; // استبدال البيانات القديمة
  saveDB(); // الحفظ باللوكال ستورج

  Swal.fire({
    title: "عملية ناجحة!",
    text: "✅ تم حفظ الإيصالات الجديدة بنجاح في قاعدة بيانات المتصفح المحلي.",
    icon: "success",
    confirmButtonColor: "var(--accent-green)",
  });
}

/* ----- Export / Import Backup ----- */
function exportDataBackup() {
  const jsonString = JSON.stringify(_db, null, 4);
  const blob = new Blob([jsonString], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  // Generating Backup Name Based on Date
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;

  a.href = url;
  a.download = `Prices_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importDataBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedDB = JSON.parse(e.target.result);
      if (importedDB && importedDB.units && importedDB.categories) {
        _db = importedDB;
        saveDB();
        document.querySelector(`#oldTable tbody`).innerHTML = "";
        document.querySelector(`#currentTable tbody`).innerHTML = "";
        addRow("currentTable");
        addRow("oldTable");
        Swal.fire(
          "نجاح",
          "تم استعادة البيانات والنسخة الاحتياطية بنجاح!",
          "success",
        );
      } else {
        throw new Error("Invalid structure");
      }
    } catch (error) {
      Swal.fire(
        "حدث خطأ",
        "ملف النسخة الاحتياطية غير متوافق أو تالف.",
        "error",
      );
    }
  };
  reader.readAsText(file);
  event.target.value = ""; // Reset
}

/* ----- Comparison Logic ----- */
function copyValue(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    let icon = btnElement.querySelector("i");
    let originalClass = icon.className;
    icon.className = "bi bi-check2-all text-success fw-bold";
    setTimeout(() => {
      icon.className = originalClass;
    }, 1500);
  });
}

function compareData() {
  const currentRows = document.querySelectorAll("#currentTable tbody tr");
  const oldRows = Array.from(document.querySelectorAll("#oldTable tbody tr"));
  const resultsBody = document.querySelector("#resultsTable tbody");
  resultsBody.innerHTML = "";

  let hasData = false;

  currentRows.forEach((row) => {
    let name = row.querySelector(".item-name").value.trim();
    let currentQty = parseFloat(row.querySelector(".item-qty").value);
    let currentTotal = parseFloat(row.querySelector(".item-total").value);
    if (!name || isNaN(currentQty) || isNaN(currentTotal)) return;

    let currentUnitPrice = currentTotal / currentQty;
    let matchedOldRow = oldRows.find(
      (r) => r.querySelector(".item-name").value.trim() === name,
    );

    if (matchedOldRow) {
      hasData = true;
      let oldQty = parseFloat(matchedOldRow.querySelector(".item-qty").value);
      let oldTotal = parseFloat(
        matchedOldRow.querySelector(".item-total").value,
      );
      let oldUnitPrice = oldTotal / oldQty;

      let unitDiff = currentUnitPrice - oldUnitPrice;
      let totalDiff = unitDiff * currentQty;

      let statusBadge = "";
      let diffClass = "";

      if (unitDiff > 0.009) {
        // استخدام هامش بسيط
        statusBadge =
          '<span class="status-badge badge-up"><i class="bi bi-arrow-up-right-circle-fill"></i> زيادة (غلاء)</span>';
        diffClass = "var(--accent-red)";
      } else if (unitDiff < -0.009) {
        statusBadge =
          '<span class="status-badge badge-down"><i class="bi bi-arrow-down-right-circle-fill"></i> نقصان (رخص)</span>';
        diffClass = "var(--accent-green)";
      } else {
        statusBadge =
          '<span class="status-badge badge-stable"><i class="bi bi-dash-circle-fill"></i> استقرار</span>';
        diffClass = "var(--text-muted)";
      }

      let absUnitDiff = Math.abs(unitDiff).toFixed(2);
      let absTotalDiff = Math.abs(totalDiff).toFixed(2);

      const tr = document.createElement("tr");
      tr.className = "animated-row";
      tr.innerHTML = `
                    <td class="fw-bold align-middle">${name}</td>
                    <td class="align-middle">${oldUnitPrice.toFixed(2)}</td>
                    <td class="align-middle fw-bold">${currentUnitPrice.toFixed(2)}</td>
                    
                    <td dir="ltr" class="align-middle">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="copy-btn fs-5" onclick="copyValue('${absUnitDiff}', this)" title="نسخ الرقم"><i class="bi bi-copy"></i></span>
                            <span class="diff-text" style="color: ${diffClass}">${unitDiff > 0.009 ? "+" : ""}${absUnitDiff}</span>
                        </div>
                    </td>
                    
                    <td dir="ltr" class="align-middle">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="copy-btn fs-5" onclick="copyValue('${absTotalDiff}', this)" title="نسخ الرقم"><i class="bi bi-copy"></i></span>
                            <span class="diff-text" style="color: ${diffClass}">${totalDiff > 0.009 ? "+" : ""}${absTotalDiff}</span>
                        </div>
                    </td>
                    
                    <td class="text-center align-middle">${statusBadge}</td>
                `;
      resultsBody.appendChild(tr);
    }
  });

  if (hasData) {
    document.getElementById("resultsSection").style.display = "flex";
    document
      .getElementById("resultsSection")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    Swal.fire({
      icon: "info",
      title: "تنبيه",
      text: "لم يتم العثور على أصناف متطابقة لاستخراج تقرير المقارنة. تأكد من وجود نفس الأسماء في الفاتورتين.",
      confirmButtonColor: "var(--primary-accent)",
    });
  }
}
