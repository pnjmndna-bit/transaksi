const pages = document.querySelectorAll(".page");
const navs = document.querySelectorAll(".bottom-nav a:not(.fab)");

let dragBankId = null;

let dragElement = null;

let longPressTimer = null;

let isDraggingBank = false;

let dragStartX = 0;

let dragOffsetX = 0;

let currentIndex = -1;

let autoScrollFrame = null;

let autoScrollSpeed = 0;

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

const summaryDate =
document.getElementById("summaryDate");

function updateSummaryDate(){

    if(!summaryDate) return;

    const now = new Date();

    summaryDate.textContent =
    now.toLocaleDateString("id-ID",{

        weekday:"long",

        day:"numeric",

        month:"long",

        year:"numeric"

    });

}

/*======================================
        DEFAULT ICON LIST
======================================*/

const categoryIcons = [

/* Keuangan */
"fa-solid fa-wallet",
"fa-solid fa-money-bill-wave",
"fa-solid fa-money-bill",
"fa-solid fa-sack-dollar",
"fa-solid fa-piggy-bank",
"fa-solid fa-coins",
"fa-solid fa-credit-card",
"fa-solid fa-building-columns",
"fa-solid fa-landmark",
"fa-solid fa-chart-line",

/* Makanan */
"fa-solid fa-utensils",
"fa-solid fa-burger",
"fa-solid fa-pizza-slice",
"fa-solid fa-bowl-rice",
"fa-solid fa-mug-hot",
"fa-solid fa-ice-cream",
"fa-solid fa-cake-candles",
"fa-solid fa-fish",
"fa-solid fa-drumstick-bite",
"fa-solid fa-pepper-hot",

/* Belanja */
"fa-solid fa-cart-shopping",
"fa-solid fa-bag-shopping",
"fa-solid fa-basket-shopping",
"fa-solid fa-shirt",
"fa-solid fa-gem",
"fa-solid fa-gift",

/* Transport */
"fa-solid fa-car",
"fa-solid fa-motorcycle",
"fa-solid fa-taxi",
"fa-solid fa-bus",
"fa-solid fa-train",
"fa-solid fa-plane",
"fa-solid fa-ship",
"fa-solid fa-gas-pump",

/* Rumah */
"fa-solid fa-house",
"fa-solid fa-house-chimney",
"fa-solid fa-bed",
"fa-solid fa-couch",
"fa-solid fa-fan",
"fa-solid fa-lightbulb",
"fa-solid fa-sink",

/* Teknologi */
"fa-solid fa-mobile-screen",
"fa-solid fa-laptop",
"fa-solid fa-desktop",
"fa-solid fa-headphones",
"fa-solid fa-camera",
"fa-solid fa-gamepad",
"fa-solid fa-wifi",

/* Kesehatan */
"fa-solid fa-heart",
"fa-solid fa-heart-pulse",
"fa-solid fa-hospital",
"fa-solid fa-stethoscope",
"fa-solid fa-pills",
"fa-solid fa-syringe",

/* Pendidikan */
"fa-solid fa-book",
"fa-solid fa-book-open",
"fa-solid fa-graduation-cap",
"fa-solid fa-school",
"fa-solid fa-pencil",

/* Hiburan */
"fa-solid fa-film",
"fa-solid fa-music",
"fa-solid fa-guitar",
"fa-solid fa-football",
"fa-solid fa-volleyball",
"fa-solid fa-dumbbell",

/* Lainnya */
"fa-solid fa-star",
"fa-solid fa-fire",
"fa-solid fa-bolt",
"fa-solid fa-leaf",
"fa-solid fa-tree",
"fa-solid fa-paw",
"fa-solid fa-dog",
"fa-solid fa-cat",
"fa-solid fa-baby",
"fa-solid fa-briefcase",
"fa-solid fa-toolbox",
"fa-solid fa-wrench",
"fa-solid fa-location-dot",
"fa-solid fa-globe",
"fa-solid fa-calendar-days"

];

/*======================================
            ID GENERATOR
======================================*/

function generateId(){

    return Date.now() + Math.floor(Math.random()*100000);

}

/*======================================
        BANK DRAG
======================================*/

function initBankDrag(){

    document.querySelectorAll(".bank-item").forEach(card=>{

        card.onpointerdown=function(e){

            if(e.target.closest(".bank-actions")) return;

            clearTimeout(longPressTimer);

            longPressTimer=setTimeout(()=>{

                dragElement=card;

                dragBankId=Number(card.dataset.id);

                currentIndex=[
                    ...document.querySelectorAll(".bank-item")
                ].indexOf(card);

                isDraggingBank=true;

                const rect=card.getBoundingClientRect();

                dragStartX=e.clientX;

                dragOffsetX=e.clientX-rect.left;

                card.style.width=rect.width+"px";

                card.style.position="fixed";

                card.style.left=rect.left+"px";

                card.style.top=rect.top+"px";

                card.style.zIndex="9999";

                card.style.transition="none";

                card.classList.add("dragging");

              card.style.transform="scale(1.04)";

card.style.boxShadow=
"0 18px 45px rgba(0,0,0,.28)";

                if(navigator.vibrate){

                    navigator.vibrate(30);

                }

                card.setPointerCapture(e.pointerId);

            },500);

        };

        card.onpointermove=function(e){

            if(!isDraggingBank) return;

            if(dragElement!==card) return;

            const list=document.getElementById("bankList");

            const x=e.clientX-dragOffsetX;

            card.style.left=x+"px";

            const listRect=list.getBoundingClientRect();

            autoScrollSpeed=0;

if(e.clientX>listRect.right-80){

    autoScrollSpeed=8;

}else if(e.clientX<listRect.left+80){

    autoScrollSpeed=-8;

}

if(!autoScrollFrame){

    const scrollLoop=()=>{

        if(!isDraggingBank){

            cancelAnimationFrame(autoScrollFrame);

            autoScrollFrame=null;

            return;

        }

        if(autoScrollSpeed!==0){

            list.scrollLeft+=autoScrollSpeed;

        }

        autoScrollFrame=requestAnimationFrame(scrollLoop);

    };

    autoScrollFrame=requestAnimationFrame(scrollLoop);

}

            const cards=[
                ...document.querySelectorAll(".bank-item")
            ];

            const center=e.clientX;

let targetIndex=currentIndex;

const dragRect=card.getBoundingClientRect();

cards.forEach((item,index)=>{

    if(item===card) return;

    const rect=item.getBoundingClientRect();

    const itemCenter=rect.left+rect.width/2;

    if(
        center>itemCenter &&
        dragRect.left<rect.left
    ){

        targetIndex=index;

    }

    if(
        center<itemCenter &&
        dragRect.left>rect.left
    ){

        targetIndex=index;

    }

});

            if(targetIndex!==currentIndex){

    // ===== FLIP START =====

    const oldRects={};

    document.querySelectorAll(".bank-item").forEach(item=>{

        oldRects[item.dataset.id]=
        item.getBoundingClientRect();

    });

    // ===== FLIP END =====

    const moved=banks.splice(currentIndex,1)[0];

    banks.splice(targetIndex,0,moved);

    currentIndex=targetIndex;

    renderBanks();

    requestAnimationFrame(()=>{

        // ===== FLIP ANIMATION =====

        document.querySelectorAll(".bank-item").forEach(item=>{

            const oldRect=oldRects[item.dataset.id];

            if(!oldRect) return;

            const newRect=item.getBoundingClientRect();

            const dx=oldRect.left-newRect.left;

            item.style.transition="none";

            item.style.transform=
            `translateX(${dx}px)`;

            requestAnimationFrame(()=>{

                item.style.transition=
                "transform .25s ease";

                item.style.transform="";

            });

        });

        // ===== DRAG ELEMENT =====

        dragElement=document.querySelector(
'.bank-item[data-id="'+dragBankId+'"]'
);

        if(dragElement){

            dragElement.classList.add("dragging");

            dragElement.style.position="fixed";

            dragElement.style.zIndex="9999";

        }

    });

}

        };

        card.onpointerup=function(){

            clearTimeout(longPressTimer);

            if(!isDraggingBank) return;

            finishBankDrag();

        };

        card.onpointercancel=function(){

            clearTimeout(longPressTimer);

            if(!isDraggingBank) return;

            finishBankDrag();

        };

        card.onpointerleave=function(){

            clearTimeout(longPressTimer);

        };

    });

}

function finishBankDrag(){

    if(!dragElement) return;

    dragElement.classList.remove("dragging");

    
dragElement.style.transition=
"all .25s ease";

dragElement.style.transform="";

dragElement.style.boxShadow="";

dragElement.style.left="";

dragElement.style.top="";

dragElement.style.position="";

dragElement.style.width="";

dragElement.style.zIndex="";

    saveData();

isDraggingBank=false;

renderBanks();

if(autoScrollFrame){

    cancelAnimationFrame(autoScrollFrame);

    autoScrollFrame=null;

}

autoScrollSpeed=0;

dragElement=null;

dragBankId=null;

currentIndex=-1;

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

    const now = selectedTransactionDate;

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
    RENDER INCOME ANALYSIS
======================================*/

function renderIncomeAnalysis(){

    const container =
    document.getElementById("incomeAnalysisList");

    if(!container) return;

    container.innerHTML="";

    const data={};

    transactions.forEach(tr=>{

        if(tr.type!=="income") return;

        if(!data[tr.categoryId]){

            data[tr.categoryId]=0;

        }

        data[tr.categoryId]+=tr.amount;

    });

    const total=
    Object.values(data)
    .reduce((a,b)=>a+b,0);

    if(total===0){

        container.innerHTML=`
<div class="empty-box">
Belum ada data pemasukan.
</div>
`;

        return;

    }

    Object.entries(data)

    .sort((a,b)=>b[1]-a[1])

    .forEach(([id,amount])=>{

        const category=
        categories.income.find(c=>c.id==id);

        if(!category) return;

        const percent=
        amount/total*100;

        container.innerHTML+=`

<div class="analysis-item">

<div class="top">

<span>

<i class="${category.icon}"></i>

${category.name}

</span>

<b>

${formatRupiah(amount)}

</b>

</div>

<div class="progress">

<div
class="bar"
style="width:${percent}%">
</div>

</div>

<small>

${percent.toFixed(1)}%

</small>

</div>

`;

    });

}

/*======================================
        RENDER ANALYSIS
======================================*/

function renderAnalysis(){

    const container =
    document.getElementById("analysisList");

    if(!container) return;

    container.innerHTML="";

    const data={};

    transactions.forEach(tr=>{

        if(tr.type!=="expense") return;

        if(!data[tr.categoryId]){

            data[tr.categoryId]=0;

        }

        data[tr.categoryId]+=tr.amount;

    });

    const total=
    Object.values(data)
    .reduce((a,b)=>a+b,0);

    if(total===0){

        container.innerHTML=`
<div class="empty-box">
Belum ada data analisis.
</div>
`;

        return;

    }

    Object.entries(data)

    .sort((a,b)=>b[1]-a[1])

    .forEach(([id,amount])=>{

        const category=
        categories.expense.find(c=>c.id==id);

        if(!category) return;

        const percent=
        amount/total*100;

        container.innerHTML+=`

<div class="analysis-item">

<div class="top">

<span>

<i class="${category.icon}"></i>

${category.name}

</span>

<b>

${formatRupiah(amount)}

</b>

</div>

<div class="progress">

<div
class="bar"
style="width:${percent}%">
</div>

</div>

<small>

${percent.toFixed(1)}%

</small>

</div>

`;

    });

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
        LAST UPDATE
======================================*/

function updateLastUpdate(){

    const text =
    document.getElementById("lastUpdate");

    if(!text) return;

    if(transactions.length===0){

        text.innerHTML=`
Belum ada transaksi<br>
Hari ini ${new Date().toLocaleTimeString("id-ID",{
hour:"2-digit",
minute:"2-digit"
})}
`;

        return;

    }

    const last=transactions[0];

    const date=new Date(last.createdAt);

    text.innerHTML=`

Terakhir diperbarui<br>

${date.toLocaleDateString("id-ID",{

weekday:"long",

day:"numeric",

month:"long",

year:"numeric"

})}

•

${date.toLocaleTimeString("id-ID",{

hour:"2-digit",

minute:"2-digit"

})}

`;

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

card.draggable = false;

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

initBankDrag();

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

    const list = transactions.filter(tr=>

    tr.bankId===id ||

    tr.fromBank===id ||

    tr.toBank===id

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
renderIncomeAnalysis();
renderAnalysis();

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
        renderIncomeAnalysis();
        renderAnalysis();
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
    renderIncomeAnalysis();
    renderAnalysis();

}

/*======================================
      SUMMARY FILTER BUTTON
======================================*/

const todayBtn = document.getElementById("todayBtn");

const monthBtn = document.getElementById("monthBtn");

todayBtn.onclick=function(){

    summaryFilter="today";

    todayBtn.classList.add("active");

    monthBtn.classList.remove("active");

    renderSummary();
    renderIncomeAnalysis();
    renderAnalysis();

};

monthBtn.onclick=function(){

    summaryFilter="month";

    monthBtn.classList.add("active");

    todayBtn.classList.remove("active");

    renderSummary();
    renderIncomeAnalysis();
    renderAnalysis();

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

    renderCategoryList();

};

tabTransfer.onclick=function(){

    showAddTab("transfer");

};

/*======================================
        CATEGORY MANAGER
======================================*/

let selectedCategoryIcon = "fa-solid fa-wallet";

let editingCategoryId = null;

let editingCategoryType = "income";

const incomeType =
document.getElementById("incomeType");

const expenseType =
document.getElementById("expenseType");

incomeType.onclick=function(){

    editingCategoryType="income";

    incomeType.classList.add("active");

    expenseType.classList.remove("active");

  editingCategoryId = null;

document.getElementById(
"categoryNameInput"
).value = "";

document.getElementById(
"saveCategory"
).textContent =
"Tambah Kategori";

    renderCategoryList();

};

expenseType.onclick=function(){

    editingCategoryType="expense";

    expenseType.classList.add("active");

    incomeType.classList.remove("active");

  editingCategoryId = null;

document.getElementById(
"categoryNameInput"
).value = "";

document.getElementById(
"saveCategory"
).textContent =
"Tambah Kategori";

    renderCategoryList();

};

function createCategory(name, icon){

    return{

        id: generateId(),

        name: name.trim(),

        icon

    };

}

function getCategoryList(){

    return categories[editingCategoryType];

}

function saveCategory(){

    const input =
    document.getElementById("categoryNameInput");

    const name = input.value.trim();

    if(name===""){

        showToast(
            "warning",
            "Masukkan nama kategori."
        );

        return;

    }

    const list = getCategoryList();

    if(editingCategoryId===null){

        list.push(

            createCategory(
                name,
                selectedCategoryIcon
            )

        );

    }else{

        const cat =
        list.find(c=>c.id===editingCategoryId);

        if(cat){

            cat.name = name;

            cat.icon = selectedCategoryIcon;

        }

    }

    saveData();

    renderCategoryList();

    input.value="";

    document

.getElementById("saveCategory")

.textContent="Tambah Kategori";

    editingCategoryId=null;

    selectedCategoryIcon="fa-solid fa-wallet";

    document.getElementById("categoryIconPreview").className=
    selectedCategoryIcon;

    showToast(
        "success",
        "Kategori berhasil disimpan."
    );

}

/*======================================
        CATEGORY ICON PICKER
======================================*/

function openIconPicker(){

    openPicker("Pilih Icon");

    pickerList.innerHTML="";

    categoryIcons.forEach(icon=>{

        const item=document.createElement("button");

        item.type="button";

        item.className="icon-picker-item";

        item.innerHTML=`
            <i class="${icon}"></i>
        `;

        item.onclick=function(){

            selectedCategoryIcon=icon;

            document
            .getElementById("categoryIconPreview")
            .className=icon;

            closePicker();

        };

        pickerList.appendChild(item);

    });

}

function filterCategoryIcons(keyword){

    pickerList.innerHTML="";

    categoryIcons

    .filter(icon=>

        icon

        .toLowerCase()

        .includes(

            keyword.toLowerCase()

        )

    )

    .forEach(icon=>{

        const item=document.createElement("button");

        item.type="button";

        item.className="icon-picker-item";

        item.innerHTML=`
            <i class="${icon}"></i>
        `;

        item.onclick=function(){

            selectedCategoryIcon=icon;

            document
            .getElementById("categoryIconPreview")
            .className=icon;

            closePicker();

        };

        pickerList.appendChild(item);

    });

}

const categoryIconButton =
document.getElementById("categoryIconButton");

if(categoryIconButton){

    categoryIconButton.onclick=function(){

        openIconPicker();

    };

}

/*======================================
        CATEGORY RENDER
======================================*/

function renderCategoryList(){

    const container =
    document.getElementById("categoryList");

    if(!container) return;

    container.innerHTML="";

    categories[editingCategoryType].forEach(cat=>{

        const item=document.createElement("div");

        item.className="category-item";

        item.innerHTML=`

<div class="category-left">

<i class="${cat.icon}"></i>

<span>${cat.name}</span>

</div>

<div class="category-right">

<button
class="edit-category">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="delete-category">

<i class="fa-solid fa-trash"></i>

</button>

</div>

`;

        item.querySelector(".edit-category")
        .onclick=function(){

            editCategory(cat.id);

        };

        item.querySelector(".delete-category")
        .onclick=function(){

            deleteCategory(cat.id);

        };

        container.appendChild(item);

    });

}

/*======================================
        EDIT CATEGORY
======================================*/

function editCategory(id){

    const list =
    getCategoryList();

    const cat =
    list.find(c=>c.id===id);

    if(!cat) return;

    editingCategoryId=id;

    document.getElementById("saveCategory")
.textContent = "Update Kategori";

    document.getElementById(
        "categoryNameInput"
    ).value=cat.name;

    selectedCategoryIcon=cat.icon;

    document.getElementById(
        "categoryIconPreview"
    ).className=cat.icon;

}

/*======================================
        DELETE CATEGORY
======================================*/

function deleteCategory(id){

    categories[editingCategoryType]=
    categories[editingCategoryType]
    .filter(c=>c.id!==id);

    saveData();

    renderCategoryList();

editingCategoryId = null;

document.getElementById(
"categoryNameInput"
).value = "";

selectedCategoryIcon =
"fa-solid fa-wallet";

document.getElementById(
"categoryIconPreview"
).className =
selectedCategoryIcon;

document.getElementById(
"saveCategory"
).textContent =
"Tambah Kategori";

showToast(
"success",
"Kategori dihapus."
);

}

document

.getElementById("saveCategory")

.onclick=function(){

    saveCategory();

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
renderIncomeAnalysis();
renderAnalysis();

renderTransactions();

updateLastUpdate();

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

selectedTransactionType="income";

incomeTransaction.classList.add("active");

expenseTransaction.classList.remove("active");

selectedTransactionDate = new Date();

updateDateUI(
    selectedTransactionDate,
    transactionDateText,
    transactionTimeText
);

showToast(
    "success",
    "Transaksi berhasil disimpan."
);

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

    selectedTransactionDate = new Date(tr.createdAt);

updateDateUI(
    selectedTransactionDate,
    transactionDateText,
    transactionTimeText
);

    if(tr.type==="income"){

        incomeTransaction.classList.add("active");

        expenseTransaction.classList.remove("active");

    }else{

        expenseTransaction.classList.add("active");

        incomeTransaction.classList.remove("active");

    }

    saveTransaction.textContent="Update Transaksi";

showPage("addPage");

document
.querySelectorAll(".bottom-nav a")
.forEach(nav=>nav.classList.remove("active"));

document
.getElementById("navAdd")
.classList.add("active");

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
    renderIncomeAnalysis();
    renderAnalysis();

    renderTransactions();

    updateLastUpdate();

}

/*======================================
    TRANSACTION SEARCH & FILTER
======================================*/

let transactionKeyword="";

const transactionSearch=
document.getElementById("transactionSearch");

transactionSearch.oninput=function(){

    transactionKeyword=
    this.value.toLowerCase().trim();

    renderTransactions();
updateTransactionFilterUI();

};

let transactionTypeFilter="all";

document
.querySelectorAll(".transaction-filter button")
.forEach(btn=>{

    btn.onclick=function(){

        document
        .querySelectorAll(".transaction-filter button")
        .forEach(b=>b.classList.remove("active"));

        this.classList.add("active");

        transactionTypeFilter=this.dataset.filter;

        renderTransactions();
updateTransactionFilterUI();

    };

});

/*======================================
      FILTER TRANSACTION
======================================*/

const transactionFilterBtn =
document.getElementById("transactionFilterBtn");

const filterOverlay =
document.getElementById("filterOverlay");

let transactionDateFilter="all";

transactionFilterBtn.onclick=function(){

    filterOverlay.classList.add("show");

};

filterOverlay.onclick=function(e){

    if(e.target===filterOverlay){

        filterOverlay.classList.remove("show");

    }

};

document

.querySelectorAll(".filter-time")

.forEach(btn=>{

btn.onclick=function(){

transactionDateFilter=

this.dataset.filter;

filterOverlay.classList.remove("show");

renderTransactions();
updateTransactionFilterUI();
  
};

});
const activeFilterBar =
document.getElementById("activeTransactionFilter");

const activeFilterText =
document.getElementById("activeFilterText");

const clearTransactionFilter =
document.getElementById("clearTransactionFilter");

function updateTransactionFilterUI(){

    let text=[];

    if(transactionTypeFilter!=="all"){

        text.push(
            "🏷️ "+{
                income:"Pemasukan",
                expense:"Pengeluaran",
                transfer:"Transfer"
            }[transactionTypeFilter]
        );

    }

    if(transactionDateFilter!=="all"){

        text.push(
            "📅 "+{

                today:"Hari Ini",

                yesterday:"Kemarin",

                week:"7 Hari",

                month:"Bulan Ini",

                lastmonth:"Bulan Lalu",

                year:"Tahun Ini"

            }[transactionDateFilter]
        );

    }

    if(text.length===0){

        activeFilterBar.style.display="none";

        return;

    }

    activeFilterBar.style.display="flex";

    activeFilterText.textContent=
    text.join(" • ");

}

clearTransactionFilter.onclick=function(){

    transactionTypeFilter="all";

    transactionDateFilter="all";

    transactionKeyword="";

    transactionSearch.value="";

    document
    .querySelectorAll(".transaction-filter button")
    .forEach(btn=>{

        btn.classList.remove("active");

        if(btn.dataset.filter==="all"){

            btn.classList.add("active");

        }

    });

    updateTransactionFilterUI();

    renderTransactions();

};


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

   const list=[...transactions]

.filter(tr=>{

    if(
        transactionTypeFilter!=="all"
        &&
        tr.type!==transactionTypeFilter
    ){

        return false;

    }

    const date=new Date(tr.createdAt);

const today=new Date();

const yesterday=new Date();

yesterday.setDate(today.getDate()-1);

if(transactionDateFilter==="today"){

    if(date.toDateString()!==today.toDateString()){

        return false;

    }

}

if(transactionDateFilter==="yesterday"){

    if(date.toDateString()!==yesterday.toDateString()){

        return false;

    }

}

if(transactionDateFilter==="week"){

    const diff=
    (today-date)/(1000*60*60*24);

    if(diff>7){

        return false;

    }

}

if(transactionDateFilter==="month"){

    if(
        date.getMonth()!==today.getMonth()
        ||
        date.getFullYear()!==today.getFullYear()
    ){

        return false;

    }

}

if(transactionDateFilter==="lastmonth"){

    const last=new Date();

    last.setMonth(last.getMonth()-1);

    if(
        date.getMonth()!==last.getMonth()
        ||
        date.getFullYear()!==last.getFullYear()
    ){

        return false;

    }

}

if(transactionDateFilter==="year"){

    if(
        date.getFullYear()!==today.getFullYear()
    ){

        return false;

    }

}

    if(transactionKeyword){

        let bankName="";

        if(tr.type==="transfer"){

            const from=
            banks.find(b=>b.id===tr.fromBank);

            const to=
            banks.find(b=>b.id===tr.toBank);

            bankName=
            (from?.name||"")+" "+
            (to?.name||"");

        }else{

            bankName=
            banks.find(b=>b.id===tr.bankId)?.name||"";

        }

        const categoryName=
        getCategory(tr.categoryId)?.name||"";

        const keyword=[

            bankName,

            categoryName,

            tr.note,

            tr.amount,

            tr.type,

            tr.date,

            tr.time

        ]

        .join(" ")

        .toLowerCase();

        if(!keyword.includes(transactionKeyword)){

            return false;

        }

    }

    return true;

})

.sort((a,b)=>

new Date(b.createdAt)-new Date(a.createdAt)

);

list.forEach(tr=>{

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
        CUSTOM DATE TIME
======================================*/

const dateTimeOverlay =
document.getElementById("dateTimeOverlay");

const customDate =
document.getElementById("customDate");

const customTime =
document.getElementById("customTime");

const dateSave =
document.getElementById("dateSave");

const dateCancel =
document.getElementById("dateCancel");

let currentPicker = "";

customDate.value =
new Date().toISOString().slice(0,10);

customTime.value =
new Date().toTimeString().slice(0,5);

/*======================================
        DATE / TIME PICKER
======================================*/

const transactionDatePicker=document.getElementById("transactionDatePicker");
const transactionDateText=document.getElementById("transactionDateText");
const transactionTimeText=document.getElementById("transactionTimeText");

const transferDatePicker=document.getElementById("transferDatePicker");
const transferDateText=document.getElementById("transferDateText");
const transferTimeText=document.getElementById("transferTimeText");

let selectedTransactionDate=new Date();
let selectedTransferDate=new Date();

function updateDateUI(date,title,time){

    const today=new Date();

    title.textContent=
        date.toDateString()===today.toDateString()
        ?"Hari Ini"
        :date.toLocaleDateString("id-ID",{
            day:"numeric",
            month:"long",
            year:"numeric"
        });

    time.textContent=
    date.toLocaleTimeString("id-ID",{
        hour:"2-digit",
        minute:"2-digit"
    });

}

updateDateUI(
selectedTransactionDate,
transactionDateText,
transactionTimeText
);

updateDateUI(
selectedTransferDate,
transferDateText,
transferTimeText
);

transactionDatePicker.onclick=function(){

    currentPicker="transaction";

    customDate.value=selectedTransactionDate.toISOString().slice(0,10);

    customTime.value=selectedTransactionDate.toTimeString().slice(0,5);

    dateTimeOverlay.classList.add("show");

};

transferDatePicker.onclick=function(){

    currentPicker="transfer";

    customDate.value=selectedTransferDate.toISOString().slice(0,10);

    customTime.value=selectedTransferDate.toTimeString().slice(0,5);

    dateTimeOverlay.classList.add("show");

};

dateCancel.onclick=function(){

    dateTimeOverlay.classList.remove("show");

};

dateSave.onclick=function(){

    const value=new Date(
        customDate.value+"T"+customTime.value
    );

    if(currentPicker==="transaction"){

        selectedTransactionDate=value;

        updateDateUI(
            selectedTransactionDate,
            transactionDateText,
            transactionTimeText
        );

    }else{

        selectedTransferDate=value;

        updateDateUI(
            selectedTransferDate,
            transferDateText,
            transferTimeText
        );

    }

    dateTimeOverlay.classList.remove("show");

};

dateTimeOverlay.onclick=function(e){

    if(e.target===dateTimeOverlay){

        dateTimeOverlay.classList.remove("show");

    }

};

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

    createdAt:selectedTransferDate.toISOString(),

    date:selectedTransferDate.toLocaleDateString("id-ID"),

    time:selectedTransferDate.toLocaleTimeString("id-ID",{

        hour:"2-digit",

        minute:"2-digit"

    })

});

    saveData();

renderBanks();

updateTotalBalance();

renderSummary();
renderIncomeAnalysis();
renderAnalysis();

renderTransactions();

updateLastUpdate();

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

selectedTransferDate = new Date();

updateDateUI(
    selectedTransferDate,
    transferDateText,
    transferTimeText
);

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

document.getElementById("seeAllTransaction").onclick = function(){

    showPage("transactionPage");

    navs.forEach(nav=>{
        nav.classList.remove("active");
    });

    document.getElementById("navTransaction")
    .classList.add("active");

};

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

renderIncomeAnalysis();

renderAnalysis();

renderTransactions();

updateTransactionFilterUI();

renderCategoryList();

updateSummaryDate();

updateLastUpdate();
