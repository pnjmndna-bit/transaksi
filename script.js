const pages = document.querySelectorAll(".page");
const navs = document.querySelectorAll(".bottom-nav a:not(.fab)");

function showPage(id){

pages.forEach(page=>{

page.classList.remove("active");

});

document.getElementById(id).classList.add("active");

navs.forEach(nav=>{

nav.classList.remove("active");

});

}

document.getElementById("navHome").onclick=()=>{

showPage("homePage");

document.getElementById("navHome").classList.add("active");

}

document.getElementById("navTransaction").onclick=()=>{

showPage("transactionPage");

document.getElementById("navTransaction").classList.add("active");

}

document.getElementById("navProfile").onclick=()=>{

showPage("profilePage");

document.getElementById("navProfile").classList.add("active");

}

document.getElementById("navAdd").onclick=()=>{

showPage("addPage");

document.getElementById("navAdd").classList.add("active");

}

document.getElementById("navBudget").onclick=()=>{

showPage("budgetPage");

document.getElementById("navBudget").classList.add("active");

}

/*======================================
            DATABASE
======================================*/

let banks = JSON.parse(localStorage.getItem("banks")) || [

    {
        id: generateId(),
        name: "Cash",
        balance: 0
    },

    {
        id: generateId(),
        name: "Jago",
        balance: 0
    }

];

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let balanceHidden = false;

let categories = JSON.parse(localStorage.getItem("categories")) || {

    income: [

        {
            id: generateId(),
            name: "Gaji",
            icon: "fa-solid fa-wallet"
        },

        {
            id: generateId(),
            name: "Tarik Tunai",
            icon: "fa-solid fa-money-bill-wave"
        }

    ],

    expense: [

        {
            id: generateId(),
            name: "Makan",
            icon: "fa-solid fa-utensils"
        },

        {
            id: generateId(),
            name: "Belanja",
            icon: "fa-solid fa-cart-shopping"
        }

    ]

};

/*======================================
        SUMMARY FILTER
======================================*/

let summaryFilter = "today";

let incomeCategoryFilter = "all";

let expenseCategoryFilter = "all";

const balanceText = document.getElementById("totalBalance");
const balanceIcon = document.getElementById("toggleBalance");

/*======================================
            ID GENERATOR
======================================*/

function generateId(){

    return Date.now() + Math.floor(Math.random()*100000);

}

/*======================================
            BANK
======================================*/

function createBank(name, balance = 0){

    return{

        id: generateId(),

        name: name.trim(),

        balance: Number(balance)

    };

}

/*======================================
            TRANSACTION
======================================*/

function createTransaction({

    bankId,

    type,

    categoryId,

    amount,

    note=""

}){

    const now=new Date();

    return{

    id:generateId(),

    bankId,

    type,

    categoryId,

    amount:Number(amount),

    note,

    createdAt:now.toISOString(),

    date:now.toLocaleDateString("id-ID"),

    time:now.toLocaleTimeString("id-ID",{

        hour:"2-digit",

        minute:"2-digit"

    })

};

}

function getCategory(id){

    return [

        ...categories.income,

        ...categories.expense

    ].find(item=>item.id===id);

}

function formatRupiah(number){

    return "Rp" + Number(number).toLocaleString("id-ID");

}

/*======================================
        RENDER SUMMARY
======================================*/

function renderSummary(){

    let income = 0;

    let expense = 0;

    const now = new Date();

    const list = transactions.filter(tr=>{

        const date = new Date(tr.createdAt || tr.date);

        if(summaryFilter==="today"){

            return date.toDateString()===now.toDateString();

        }

        if(summaryFilter==="month"){

            return date.getMonth()===now.getMonth()
            && date.getFullYear()===now.getFullYear();

        }

        return true;

    });

    list.forEach(tr=>{

      if(tr.type==="transfer"){

    return;

}

        if(

            tr.type==="income"

            &&

            (
                incomeCategoryFilter==="all"

                ||

                tr.categoryId===incomeCategoryFilter
            )

        ){

            income+=tr.amount;

        }

        if(

            tr.type==="expense"

            &&

            (
                expenseCategoryFilter==="all"

                ||

                tr.categoryId===expenseCategoryFilter
            )

        ){

            expense+=tr.amount;

        }

    });

    document.getElementById("incomeTotal").textContent =
    formatRupiah(income);

document.getElementById("expenseTotal").textContent =
    formatRupiah(expense);

}

/*======================================
    UPDATE TOTAL BALANCE
======================================*/

function updateTotalBalance(){

    const total = banks.reduce((sum, bank)=>{

        return sum + bank.balance;

    },0);

    balanceText.textContent = balanceHidden
        ? "••••••"
        : formatRupiah(total);

}

/*======================================
        SAVE DATABASE
======================================*/

function saveData(){

    localStorage.setItem(
        "banks",
        JSON.stringify(banks)
    );

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "categories",
        JSON.stringify(categories)
    );

}

/*======================================
            RENDER BANK
======================================*/

function renderBanks(){

    const bankList = document.getElementById("bankList");

    bankList.innerHTML = "";

    banks.forEach(bank=>{

    // ===== TAMBAH DARI SINI =====
    const totalBalance = banks.reduce(
        (sum, b) => sum + b.balance,
        0
    );

    const percent = totalBalance > 0
        ? (bank.balance / totalBalance) * 100
        : 0;
    // ===== SAMPAI SINI =====

    const card=document.createElement("div");

        card.className="bank-item";

        card.dataset.id=bank.id;

        card.innerHTML=`

<div class="bank-top">

<div class="bank-info">

<h4>

<i class="fa-solid fa-building-columns"></i>

${bank.name}

</h4>

<span class="bank-balance">
    ${balanceHidden ? "••••••" : formatRupiah(bank.balance)}
</span>

</div>

<div class="bank-actions">

<button class="bank-action-btn">

<i class="fa-solid fa-ellipsis"></i>

</button>

<div class="bank-action-menu">

<button
class="view-bank">

<i class="fa-regular fa-file-lines"></i>

</button>

<button
class="rename-bank">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="delete-bank">

<i class="fa-solid fa-trash"></i>

</button>

</div>

</div>

</div>

<div class="bank-percent">

<div class="bank-progress">

<div class="bank-progress-fill" style="width:${percent}%"></div>

</div>

<span>${percent.toFixed(0)}%</span>

</div>

`;
        bankList.appendChild(card);

      card.querySelector(".view-bank").onclick = () => viewBank(bank.id);

card.querySelector(".rename-bank").onclick = () => renameBank(bank.id);

card.querySelector(".delete-bank").onclick = () => deleteBank(bank.id);

    });

    bankList.appendChild(createAddButton());

    initBankMenu();

}

/*======================================
        ADD BUTTON
======================================*/

function createAddButton(){

    const btn=document.createElement("button");

    btn.className="add-bank";

    btn.innerHTML=`

<i class="fa-solid fa-plus"></i>

Tambah

`;

    btn.onclick=addBank;

    return btn;

}

/*======================================
        BANK MENU
======================================*/

function initBankMenu(){

    document.querySelectorAll(".bank-action-btn").forEach(btn=>{

        btn.onclick=(e)=>{

            e.stopPropagation();

            document.querySelectorAll(".bank-actions").forEach(a=>{

                if(a!==btn.parentElement){

                    a.classList.remove("open");

                }

            });

            btn.parentElement.classList.toggle("open");

        };

    });

}

document.addEventListener("click",()=>{

    document.querySelectorAll(".bank-actions").forEach(a=>{

        a.classList.remove("open");

    });

});

/*======================================
            ADD BANK
======================================*/

function addBank(){

    editingBankId = null;

    modalTitle.textContent = "Tambah Bank";

    balanceGroup.style.display = "block";

    bankNameInput.value = "";

    bankBalanceInput.value = "";

    openModal();

}

/*======================================
        RENAME BANK
======================================*/

function renameBank(id){

    const bank = banks.find(item=>item.id==id);

    if(!bank) return;

    editingBankId = id;

    modalTitle.textContent = "Ubah Bank";

    bankNameInput.value = bank.name;

    balanceGroup.style.display = "none";

    openModal();

}

/*======================================
        DELETE BANK
======================================*/

function deleteBank(id){

    const bank = banks.find(item=>item.id===id);

    if(!bank) return;

    openDeleteModal(bank);

}

/*======================================
        VIEW BANK
======================================*/

function viewBank(id){

    const bank = banks.find(b=>b.id===id);

    if(!bank) return;

    const list = transactions.filter(
        tr=>tr.bankId===id
    );

    let income = 0;

    let expense = 0;

    list.forEach(tr=>{

    if(tr.type==="income"){

        income += tr.amount;

    }else if(tr.type==="expense"){

        expense += tr.amount;

    }

});

    viewBankName.textContent = bank.name;

    viewBankBalance.textContent =
        formatRupiah(bank.balance);

    viewIncome.textContent =
        formatRupiah(income);

    viewExpense.textContent =
        formatRupiah(expense);

    viewTotalTransaction.textContent =
        list.length;

    viewOverlay.classList.add("show");

}

/*======================================
        PREMIUM MODAL
======================================*/

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");

const bankNameInput = document.getElementById("bankNameInput");
const bankBalanceInput = document.getElementById("bankBalanceInput");
const balanceGroup = document.getElementById("balanceGroup");

const modalSave = document.getElementById("modalSave");
const modalCancel = document.getElementById("modalCancel");

const deleteOverlay = document.getElementById("deleteOverlay");
const deleteCancel = document.getElementById("deleteCancel");
const deleteConfirm = document.getElementById("deleteConfirm");
const deleteText = document.getElementById("deleteText");

const viewOverlay = document.getElementById("viewOverlay");

const closeView = document.getElementById("closeView");

const viewBankName = document.getElementById("viewBankName");

const viewBankBalance = document.getElementById("viewBankBalance");

const viewIncome = document.getElementById("viewIncome");

const viewExpense = document.getElementById("viewExpense");

const viewTotalTransaction = document.getElementById("viewTotalTransaction");

let deleteBankId = null;

let editingBankId = null;

function openModal(){

    modalOverlay.classList.add("show");

}

function closeModal(){

    modalOverlay.classList.remove("show");

    bankNameInput.value = "";
    bankBalanceInput.value = "";

    editingBankId = null;

}

modalCancel.onclick = closeModal;

modalOverlay.onclick = function(e){

    if(e.target===modalOverlay){

        closeModal();

    }

};

modalSave.onclick = function(){

    const name = bankNameInput.value.trim();

    if(name==="") return;

    if(editingBankId===null){

        const balance = Number(
            bankBalanceInput.value.replace(/\D/g,"")
        );

        banks.push(createBank(name,balance));

    }else{

        const bank = banks.find(b=>b.id===editingBankId);

        if(bank){

            bank.name = name;

        }

    }

    saveData();

renderBanks();

updateTotalBalance();

renderSummary();

closeModal();
  
};

deleteConfirm.onclick = function(){

    if(deleteBankId !== null){

        banks = banks.filter(bank=>bank.id!==deleteBankId);

        transactions = transactions.filter(
            tr=>tr.bankId!==deleteBankId
        );

        saveData();
        renderBanks();
        updateTotalBalance();
        renderSummary();
        renderTransactions();

    }else if(deleteTransactionId !== null){

        deleteTransaction(deleteTransactionId);

    }

    closeDeleteModal();

};

closeView.onclick=function(){

    viewOverlay.classList.remove("show");

}

viewOverlay.onclick=function(e){

    if(e.target===viewOverlay){

        viewOverlay.classList.remove("show");

    }

}

function openDeleteModal(bank){

    deleteBankId = bank.id;

    deleteText.textContent =
        'Hapus bank "' + bank.name + '" ?';

    deleteOverlay.classList.add("show");

}

function closeDeleteModal(){

    deleteOverlay.classList.remove("show");

    deleteBankId = null;

    deleteTransactionId = null;

}

deleteCancel.onclick = closeDeleteModal;

deleteOverlay.onclick = function(e){

    if(e.target===deleteOverlay){

        closeDeleteModal();

    }

};

/*======================================
        HIDE / SHOW SALDO
======================================*/

balanceIcon.onclick = function(){

    balanceHidden = !balanceHidden;

    renderBanks();

    updateTotalBalance();

    if(balanceHidden){

        balanceIcon.classList.remove("fa-eye");
        balanceIcon.classList.add("fa-eye-slash");

    }else{

        balanceIcon.classList.remove("fa-eye-slash");
        balanceIcon.classList.add("fa-eye");

    }

};

/*======================================
      SUMMARY CATEGORY POPUP
======================================*/

const incomeCategoryBtn =
document.getElementById("incomeCategoryBtn");

const expenseCategoryBtn =
document.getElementById("expenseCategoryBtn");

let currentSummaryType="";

incomeCategoryBtn.onclick=function(){

    openCategoryPopup("income");

};

expenseCategoryBtn.onclick=function(){

    openCategoryPopup("expense");

};

function openCategoryPopup(type){

    currentSummaryType=type;

    openPicker("Pilih Kategori");

    addPickerItem("Semua",function(){

        selectSummaryCategory("all","Semua");

    });

    categories[type].forEach(cat=>{

        addPickerItem(cat.name,function(){

            selectSummaryCategory(cat.id,cat.name);

        });

    });

}

function selectSummaryCategory(id,name){

    if(currentSummaryType==="income"){

        incomeCategoryFilter=id;

        incomeCategoryBtn.innerHTML=

        name+

        '<i class="fa-solid fa-chevron-down"></i>';

    }else{

        expenseCategoryFilter=id;

        expenseCategoryBtn.innerHTML=

        name+

        '<i class="fa-solid fa-chevron-down"></i>';

    }

    renderSummary();

}

/*======================================
      SUMMARY FILTER BUTTON
======================================*/

const todayBtn = document.getElementById("todayBtn");

const monthBtn = document.getElementById("monthBtn");

todayBtn.onclick = function(){

    summaryFilter = "today";

    todayBtn.classList.add("active");
    monthBtn.classList.remove("active");

    renderSummary();

};

monthBtn.onclick = function(){

    summaryFilter = "month";

    monthBtn.classList.add("active");
    todayBtn.classList.remove("active");

    renderSummary();

};

/*======================================
        ADD PAGE PICKER
======================================*/

const pickerOverlay =
document.getElementById("pickerOverlay");

const pickerTitle =
document.getElementById("pickerTitle");

const pickerList =
document.getElementById("pickerList");

function openPicker(title){

    pickerTitle.textContent = title;

    pickerList.innerHTML = "";

    pickerOverlay.classList.add("show");

}

function closePicker(){

    pickerOverlay.classList.remove("show");

}

pickerOverlay.onclick=function(e){

    if(e.target===pickerOverlay){

        closePicker();

    }

};

function addPickerItem(title,callback){

    const item=document.createElement("button");

    item.className="picker-item";

    item.type="button";

    item.innerHTML=`
        <span>${title}</span>
        <i class="fa-solid fa-chevron-right"></i>
    `;

    item.onclick=function(){

        callback();

        closePicker();

    };

    pickerList.appendChild(item);

}

const transactionBankPicker =
document.getElementById("transactionBankPicker");

const transferFromPicker =
document.getElementById("transferFromPicker");

const transferToPicker =
document.getElementById("transferToPicker");

let selectedTransferFrom = null;

let selectedTransferTo = null;

transactionBankPicker.onclick=function(){

    openPicker("Pilih Bank");

    banks.forEach(bank=>{

        addPickerItem(bank.name,function(){

    selectedBankId=bank.id;

    transactionBankPicker
    .querySelector("span")
    .textContent=bank.name;

});

    });

};

transferFromPicker.onclick=function(){

    openPicker("Bank Asal");

    banks.forEach(bank=>{

        addPickerItem(bank.name,function(){

    selectedTransferFrom = bank.id;

    transferFromPicker
    .querySelector("span")
    .textContent = bank.name;

});

    });

};

transferToPicker.onclick=function(){

    openPicker("Bank Tujuan");

    banks.forEach(bank=>{

        addPickerItem(bank.name,function(){

    selectedTransferTo = bank.id;

    transferToPicker
    .querySelector("span")
    .textContent = bank.name;

});

    });

};

const transactionCategoryPicker =
document.getElementById("transactionCategoryPicker");

let selectedTransactionType="income";

let selectedCategoryId=null;

const incomeTransaction =
document.getElementById("incomeTransaction");

const expenseTransaction =
document.getElementById("expenseTransaction");

incomeTransaction.onclick=function(){

    selectedTransactionType="income";

    incomeTransaction.classList.add("active");
    expenseTransaction.classList.remove("active");

};

expenseTransaction.onclick=function(){

    selectedTransactionType="expense";

    expenseTransaction.classList.add("active");
    incomeTransaction.classList.remove("active");

};

transactionCategoryPicker.onclick=function(){

    openPicker("Pilih Kategori");

    const list = categories[selectedTransactionType];

    list.forEach(cat=>{

        addPickerItem(cat.name,function(){

            selectedCategoryId = cat.id;

            const text =
            document.getElementById("transactionCategoryText");

            if(text){

                text.textContent = cat.name;

            }

        });

    });

};

/*======================================
        ADD PAGE TAB
======================================*/

const tabTransaction =
document.getElementById("tabTransaction");

const tabCategory =
document.getElementById("tabCategory");

const tabTransfer =
document.getElementById("tabTransfer");

const transactionTab =
document.getElementById("transactionTab");

const categoryTab =
document.getElementById("categoryTab");

const transferTab =
document.getElementById("transferTab");

function showAddTab(tab){

    transactionTab.classList.remove("active");

    categoryTab.classList.remove("active");

    transferTab.classList.remove("active");

    tabTransaction.classList.remove("active");

    tabCategory.classList.remove("active");

    tabTransfer.classList.remove("active");

    if(tab==="transaction"){

        transactionTab.classList.add("active");

        tabTransaction.classList.add("active");

    }

    if(tab==="category"){

        categoryTab.classList.add("active");

        tabCategory.classList.add("active");

    }

    if(tab==="transfer"){

        transferTab.classList.add("active");

        tabTransfer.classList.add("active");

    }

}

tabTransaction.onclick=function(){

    showAddTab("transaction");

};

tabCategory.onclick=function(){

    showAddTab("category");

};

tabTransfer.onclick=function(){

    showAddTab("transfer");

};

/*======================================
        SAVE TRANSACTION
======================================*/

const saveTransaction =
document.getElementById("saveTransaction");

const transactionAmount =
document.getElementById("transactionAmount");

const transactionNote =
document.getElementById("transactionNote");

let selectedBankId=null;

/*======================================
        EDIT TRANSACTION
======================================*/

let editingTransactionId = null;

saveTransaction.onclick=function(){

    if(!selectedBankId){

        showToast("warning","Pilih bank.");

        return;

    }

    if(!selectedCategoryId){

        showToast("warning","Pilih kategori.");

        return;

    }

    const amount=
    Number(
        transactionAmount.value.replace(/\D/g,"")
    );

    if(amount<=0){

        showToast("warning","Masukkan nominal.");

        return;

    }

    if(editingTransactionId===null){

    const bank =
    banks.find(b=>b.id===selectedBankId);

    if(!bank) return;

    if(
        selectedTransactionType==="expense"
        &&
        bank.balance<amount
    ){
        showToast("error","Saldo tidak mencukupi.");
        return;
    }

    if(selectedTransactionType==="income"){

        bank.balance += amount;

    }else{

        bank.balance -= amount;

    }

}else{

    const old =
    transactions.find(t=>t.id===editingTransactionId);

    if(!old) return;

    const oldBank =
    banks.find(b=>b.id===old.bankId);

    if(old.type==="income"){

        oldBank.balance -= old.amount;

    }else{

        oldBank.balance += old.amount;

    }

    const newBank =
    banks.find(b=>b.id===selectedBankId);

    if(
        selectedTransactionType==="expense"
        &&
        newBank.balance<amount
    ){
        showToast("error","Saldo tidak mencukupi.");

        if(old.type==="income"){

            oldBank.balance += old.amount;

        }else{

            oldBank.balance -= old.amount;

        }

        return;
    }

    if(selectedTransactionType==="income"){

        newBank.balance += amount;

    }else{

        newBank.balance -= amount;

    }

}

if(editingTransactionId===null){

    transactions.unshift(

        createTransaction({

            bankId:selectedBankId,

            type:selectedTransactionType,

            categoryId:selectedCategoryId,

            amount,

            note:transactionNote.value.trim()

        })

    );

}else{

    const tr =
    transactions.find(t=>t.id===editingTransactionId);

    tr.bankId = selectedBankId;
    tr.type = selectedTransactionType;
    tr.categoryId = selectedCategoryId;
    tr.amount = amount;
    tr.note = transactionNote.value.trim();

    editingTransactionId = null;

    saveTransaction.textContent = "Simpan Transaksi";

}

    saveData();

    renderBanks();

updateTotalBalance();

renderSummary();

renderTransactions();

    transactionAmount.value="";

    transactionNote.value="";

    selectedBankId=null;

    selectedCategoryId=null;

    editingTransactionId = null;

saveTransaction.textContent = "Simpan Transaksi";

    transactionBankPicker
    .querySelector("span")
    .textContent="Pilih Bank";

    document.getElementById(
        "transactionCategoryText"
    ).textContent="Belum dipilih";

    showToast("success","Transaksi berhasil disimpan.");

};

/*======================================
        EDIT TRANSACTION
======================================*/

function editTransaction(id){

    const tr = transactions.find(item=>item.id===id);

    if(!tr || tr.type==="transfer") return;

    editingTransactionId = id;

    selectedBankId = tr.bankId;

    selectedTransactionType = tr.type;

    selectedCategoryId = tr.categoryId;

    transactionBankPicker
    .querySelector("span")
    .textContent =
    banks.find(b=>b.id===tr.bankId)?.name || "Pilih Bank";

    document.getElementById("transactionCategoryText")
    .textContent =
    getCategory(tr.categoryId)?.name || "Belum dipilih";

    transactionAmount.value =
    formatRupiah(tr.amount);

    transactionNote.value =
    tr.note;

    if(tr.type==="income"){

        incomeTransaction.classList.add("active");

        expenseTransaction.classList.remove("active");

    }else{

        expenseTransaction.classList.add("active");

        incomeTransaction.classList.remove("active");

    }

    saveTransaction.textContent="Update Transaksi";

    showPage("addPage");

    showAddTab("transaction");

}

/*======================================
    DELETE TRANSACTION MODAL
======================================*/

let deleteTransactionId = null;

function openTransactionDeleteModal(id){

    deleteTransactionId = id;

    deleteText.textContent = "Hapus transaksi ini?";

    deleteOverlay.classList.add("show");

}

/*======================================
        DELETE TRANSACTION
======================================*/

function deleteTransaction(id){

    const index =
    transactions.findIndex(t=>t.id===id);

    if(index===-1) return;

    const tr = transactions[index];

    if(tr.type==="transfer"){

        const from =
        banks.find(b=>b.id===tr.fromBank);

        const to =
        banks.find(b=>b.id===tr.toBank);

        if(from) from.balance += tr.amount + tr.fee;

        if(to) to.balance -= tr.amount;

    }else{

        const bank =
        banks.find(b=>b.id===tr.bankId);

        if(bank){

            if(tr.type==="income"){

                bank.balance -= tr.amount;

            }else{

                bank.balance += tr.amount;

            }

        }

    }

    transactions.splice(index,1);

    saveData();

    renderBanks();

    updateTotalBalance();

    renderSummary();

    renderTransactions();

}

/*======================================
        RENDER TRANSACTION
======================================*/

function renderTransactions(){

    const homeList =
    document.getElementById("homeTransactionList");

    const allList =
    document.getElementById("transactionContainer");

    homeList.innerHTML="";

    allList.innerHTML="";

    if(transactions.length===0){

        homeList.innerHTML=`
<div class="empty-box">
Belum ada transaksi.
</div>`;

        allList.innerHTML=`
<div class="empty-box">
Belum ada transaksi.
</div>`;

        return;

    }

   let lastDate = "";

    transactions.forEach(tr=>{

      const date = new Date(tr.createdAt);

let dateTitle = tr.date;

const today = new Date();

const yesterday = new Date();

yesterday.setDate(today.getDate()-1);

if(date.toDateString()===today.toDateString()){

    dateTitle="Hari Ini";

}else if(
    date.toDateString()===yesterday.toDateString()
){

    dateTitle="Kemarin";

}

        let title="";
        let icon="";
        let bankText="";
        let amountText="";
        let amountClass="";

        if(tr.type==="transfer"){

            const from =
            banks.find(b=>b.id===tr.fromBank);

            const to =
            banks.find(b=>b.id===tr.toBank);

            title="Transfer";

            icon="fa-solid fa-right-left";

            bankText=
            (from?.name||"-")
            +" → "+
            (to?.name||"-");

            amountText=
            formatRupiah(tr.amount);

            amountClass="transfer-text";

        }else{

            const bank =
            banks.find(b=>b.id===tr.bankId);

            const category =
            getCategory(tr.categoryId);

            title=
            category?.name||"-";

            icon=
            category?.icon||
            "fa-solid fa-wallet";

            bankText=
            bank?.name||"-";

            amountText=
            (tr.type==="income"?"+ ":"- ")
            +formatRupiah(tr.amount);

            amountClass=
            tr.type==="income"
            ?"income-text"
            :"expense-text";

        }

        const card=document.createElement("div");

card.className="transaction-card";

        card.innerHTML=`

<div class="transaction-left">

<div class="transaction-icon ${tr.type}">

<i class="${icon}"></i>

</div>

<div>

<h3>${title}</h3>

<p>${bankText}</p>

<small>${tr.time}</small>

</div>

</div>

<div class="transaction-right">

<b class="${amountClass}">

${amountText}

</b>

<div class="transaction-actions">

<button
class="edit-btn">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="delete-btn">

<i class="fa-solid fa-trash"></i>

</button>

<button
class="menu-btn">

<i class="fa-solid fa-ellipsis"></i>

</button>

</div>

</div>

`;

      // ===== TAMBAH DARI SINI =====
if(tr.type==="transfer"){

    card.querySelector(".edit-btn").style.display="none";

}
// ===== SAMPAI SINI =====

        if(lastDate!==dateTitle){

    lastDate=dateTitle;

    const header=document.createElement("div");

    header.className="transaction-date";

    header.innerHTML=`

<h4>${dateTitle}</h4>

<span>${tr.date}</span>

`;

    allList.appendChild(header);

}

      const actions =
card.querySelector(".transaction-actions");

      card.querySelector(".edit-btn").onclick=function(e){

    e.stopPropagation();

    editTransaction(tr.id);

};

card.querySelector(".delete-btn").onclick=function(e){

    e.stopPropagation();

    openTransactionDeleteModal(tr.id);

};

const menuBtn =
card.querySelector(".menu-btn");

menuBtn.onclick=function(e){

    e.stopPropagation();

    document
    .querySelectorAll(".transaction-actions")
    .forEach(item=>{

        if(item!==actions){

            item.classList.remove("active");

        }

    });

    actions.classList.toggle("active");

};

        allList.appendChild(card);

        const homeCard = card.cloneNode(true);

      // ===== TAMBAH DARI SINI =====
if(tr.type==="transfer"){

    homeCard.querySelector(".edit-btn").style.display="none";

}
// ===== SAMPAI SINI =====

const homeActions =
homeCard.querySelector(".transaction-actions");

homeCard.querySelector(".delete-btn").onclick=function(e){

    e.stopPropagation();

    openTransactionDeleteModal(tr.id);

};
      homeCard.querySelector(".edit-btn").onclick=function(e){

    e.stopPropagation();

    editTransaction(tr.id);

};

const homeMenu =
homeCard.querySelector(".menu-btn");

homeMenu.onclick=function(e){

    e.stopPropagation();

    document
    .querySelectorAll(".transaction-actions")
    .forEach(item=>{

        item.classList.remove("active");

    });

    homeActions.classList.toggle("active");

};

homeList.appendChild(homeCard);

    });

}

/*======================================
        SAVE TRANSFER
======================================*/

const saveTransfer =
document.getElementById("saveTransfer");

const transferAmount =
document.getElementById("transferAmount");

const transferFee =
document.getElementById("transferFee");

const transferNote =
document.getElementById("transferNote");

saveTransfer.onclick=function(){

    if(!selectedTransferFrom){

        showToast("warning","Pilih bank asal.");

        return;

    }

    if(!selectedTransferTo){

        showToast("warning","Pilih bank tujuan.");

        return;

    }

    if(selectedTransferFrom===selectedTransferTo){

        showToast("warning","Bank asal dan tujuan tidak boleh sama.");

        return;

    }

    const amount = Number(
        transferAmount.value.replace(/\D/g,"")
    );

    const fee = Number(
        transferFee.value.replace(/\D/g,"") || 0
    );

    if(amount<=0){

        showToast("warning","Masukan Nominal");

        return;

    }

    const from =
    banks.find(b=>b.id===selectedTransferFrom);

    const to =
    banks.find(b=>b.id===selectedTransferTo);

    if(!from || !to) return;

    if(from.balance < amount + fee){

        showToast("warning","Saldo bank asal tidak cukup.");

        return;

    }

    from.balance -= (amount + fee);

    to.balance += amount;

    transactions.unshift({

        id:generateId(),

        type:"transfer",

        fromBank:selectedTransferFrom,

        toBank:selectedTransferTo,

        amount,

        fee,

        note:transferNote.value.trim(),

        createdAt:new Date().toISOString(),

        date:new Date().toLocaleDateString("id-ID"),

        time:new Date().toLocaleTimeString("id-ID",{

            hour:"2-digit",

            minute:"2-digit"

        })

    });

    saveData();

renderBanks();

updateTotalBalance();

renderSummary();

renderTransactions();

transferAmount.value="";

transferFee.value="";

transferNote.value="";

selectedTransferFrom=null;

selectedTransferTo=null;

transferFromPicker
.querySelector("span")
.textContent="Bank Asal";

transferToPicker
.querySelector("span")
.textContent="Bank Tujuan";

showToast("success","Transfer berhasil.");

};

document.addEventListener("click",function(){

    document
    .querySelectorAll(".transaction-actions")
    .forEach(item=>{

        item.classList.remove("active");

    });

});

/*======================================
        PREMIUM TOAST
======================================*/

let toastTimeout;

function showToast(type, message){

    const toast = document.getElementById("toast");
    const toastIcon = document.getElementById("toastIcon");
    const toastTitle = document.getElementById("toastTitle");
    const toastMessage = document.getElementById("toastMessage");

    clearTimeout(toastTimeout);

    toast.className = "toast";

    if(type==="success"){

        toast.classList.add("success");
        toastIcon.className = "fa-solid fa-circle-check";
        toastTitle.textContent = "Berhasil";

    }else if(type==="error"){

        toast.classList.add("error");
        toastIcon.className = "fa-solid fa-circle-xmark";
        toastTitle.textContent = "Gagal";

    }else{

        toast.classList.add("warning");
        toastIcon.className = "fa-solid fa-triangle-exclamation";
        toastTitle.textContent = "Peringatan";

    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    toastTimeout = setTimeout(function(){

        toast.classList.remove("show");

    },3000);

}

/*======================================
            INIT APP
======================================*/

// ===== TEMPEL MULAI DARI SINI =====

function formatInputRupiah(input){

    input.setAttribute("inputmode","numeric");

    input.addEventListener("input", function(){

        const angka = this.value.replace(/\D/g,"");

        if(!angka){

            this.value = "";

            return;

        }

        const posisiAkhir = this.selectionStart;

        this.value =
        "Rp" + Number(angka).toLocaleString("id-ID");

        requestAnimationFrame(()=>{

            this.setSelectionRange(
                this.value.length,
                this.value.length
            );

        });

    });

}

formatInputRupiah(bankBalanceInput);
formatInputRupiah(transactionAmount);
formatInputRupiah(transferAmount);
formatInputRupiah(transferFee);

// ===== SAMPAI SINI =====

renderBanks();

updateTotalBalance();

renderSummary();

renderTransactions();
