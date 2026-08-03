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

document.getElementById("navInsight").onclick=()=>{

showPage("insightPage");

document.getElementById("navInsight").classList.add("active");

}

/*======================================
            DATABASE
======================================*/

let banks = JSON.parse(localStorage.getItem("banks")) || [

    {
        id: generateId(),
        name: "Cash",
        balance: 0,
        dailyChange:{}
    },

    {
        id: generateId(),
        name: "Jago",
        balance: 0,
        dailyChange:{}
    }

];

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let users =
JSON.parse(localStorage.getItem("users")) || [];

let currentUser =
JSON.parse(localStorage.getItem("currentUser"));

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
            INSIGHT
======================================*/

let insightFilter = "today";

let insightChartType = "line";

const chartTypeBtn =
document.getElementById("chartTypeBtn");

if(chartTypeBtn){

    chartTypeBtn.onclick=function(){

        insightChartType =
        insightChartType==="line"
        ? "candlestick"
        : "line";

        chartTypeBtn.innerHTML =

        insightChartType==="line"

        ?

        `
<i class="fa-solid fa-chart-line"></i>
<span>Line</span>
`

        :

        `
<i class="fa-solid fa-chart-column"></i>
<span>Candlestick</span>
`;

        renderInsight();

    };

}

let insightCustomStart = null;

let insightCustomEnd = null;

const insightCustomOverlay =
document.getElementById("insightCustomOverlay");

const insightStartDate =
document.getElementById("insightStartDate");

const insightEndDate =
document.getElementById("insightEndDate");

const saveInsightCustom =
document.getElementById("saveInsightCustom");

const cancelInsightCustom =
document.getElementById("cancelInsightCustom");

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
        balance: Number(balance),
        startOfDay: Number(balance)
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
        INSIGHT FILTER
======================================*/

function getInsightTransactions(){

    const now = new Date();

    return transactions.filter(tr=>{

        const date = new Date(tr.createdAt);

        switch(insightFilter){

            case "today":

                return date.toDateString()===now.toDateString();

            case "week":

                return (
                    (now-date)/(1000*60*60*24)
                )<=7;

            case "month":

                return (
                    date.getMonth()===now.getMonth()
                    &&
                    date.getFullYear()===now.getFullYear()
                );

            case "year":

                return (
                    date.getFullYear()===now.getFullYear()
                );

            case "custom":

                if(!insightCustomStart || !insightCustomEnd){

                    return true;

                }

                return (
                    date>=insightCustomStart &&
                    date<=insightCustomEnd
                );

            default:

                return true;

        }

    });

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

<small>
${percent.toFixed(1)}%
</small>

</small>

</div>

`;

    });

}

/*======================================
        INSIGHT SUMMARY
======================================*/

function renderInsightSummary(){

    const list=getInsightTransactions();

    let income=0;

    let expense=0;

    list.forEach(tr=>{

        if(tr.type==="income"){

            income+=tr.amount;

        }

        if(tr.type==="expense"){

            expense+=tr.amount;

        }

    });

    document.getElementById("insightIncome").textContent=
    formatRupiah(income);

    document.getElementById("insightExpense").textContent=
    formatRupiah(expense);

    document.getElementById("insightBalance").textContent =
formatRupiah(income-expense);

    document.getElementById("insightTransaction").textContent=
    list.length;

}

/*======================================
        INSIGHT CHART DATA
======================================*/

function getChartData(type){

    const list = getInsightTransactions();

    const result = {};

    list.forEach(tr=>{

        if(tr.type!==type) return;

        const date = new Date(tr.createdAt);

        let key="";

        switch(insightFilter){

            case "today":

                key = date.getHours()+":00";

                break;

            case "week":

                key = date.toLocaleDateString("id-ID",{

                    weekday:"short"

                });

                break;

            case "month":

                key = date.getDate();

                break;

            case "year":

                key = date.toLocaleDateString("id-ID",{

                    month:"short"

                });

                break;

            default:

                key =
                date.toLocaleDateString("id-ID");

        }

        if(!result[key]){

            result[key]=0;

        }

        result[key]+=tr.amount;

    });

    return result;

}

/*======================================
        TOP CATEGORY
======================================*/

function renderTopCategory(){

    const container =
    document.getElementById("topCategoryList");

    if(!container) return;

    container.innerHTML="";

    const data={};

    getInsightTransactions().forEach(tr=>{

        if(tr.type!=="expense") return;

        if(!data[tr.categoryId]){

            data[tr.categoryId]=0;

        }

        data[tr.categoryId]+=tr.amount;

    });

    const list =
    Object.entries(data)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

    if(list.length===0){

        container.innerHTML=
        "<div class='empty-box'>Belum ada data.</div>";

        return;

    }

    list.forEach(([id,total],index)=>{

        const cat=getCategory(Number(id));

        if(!cat) return;

        container.innerHTML+=`

<div class="insight-list-item">

<div>

<b>${index+1}. ${cat.name}</b>

<small>${formatRupiah(total)}</small>

</div>

<i class="${cat.icon}"></i>

</div>

`;

    });

}

/*======================================
        TOP BANK
======================================*/

function renderTopBank(){

    const container =
    document.getElementById("topBankList");

    if(!container) return;

    container.innerHTML="";

    const data={};

    getInsightTransactions().forEach(tr=>{

        if(tr.type==="transfer") return;

        if(!data[tr.bankId]){

            data[tr.bankId]=0;

        }

        data[tr.bankId]++;

    });

    const list=
    Object.entries(data)
    .sort((a,b)=>b[1]-a[1]);

    if(list.length===0){

        container.innerHTML=
        "<div class='empty-box'>Belum ada data.</div>";

        return;

    }

    list.forEach(([id,total],index)=>{

        const bank=
        banks.find(b=>b.id==id);

        if(!bank) return;

        container.innerHTML+=`

<div class="insight-list-item">

<div>

<b>${index+1}. ${bank.name}</b>

<small>${total} transaksi</small>

</div>

<i class="fa-solid fa-building-columns"></i>

</div>

`;

    });

}

/*======================================
        ACTIVITY
======================================*/

function renderActivity(){

    const container =
    document.getElementById("activityList");

    if(!container) return;

    container.innerHTML="";

    const hour={};

    const day={};

    getInsightTransactions().forEach(tr=>{

        const date=new Date(tr.createdAt);

        const h=date.getHours();

        const d=date.toLocaleDateString("id-ID",{

            weekday:"long"

        });

        hour[h]=(hour[h]||0)+1;

        day[d]=(day[d]||0)+1;

    });

    const topHour=

    Object.entries(hour)

    .sort((a,b)=>b[1]-a[1])[0];

    const topDay=

    Object.entries(day)

    .sort((a,b)=>b[1]-a[1])[0];

    container.innerHTML=`

<div class="insight-list-item">

<div>

<b>Jam Tersibuk</b>

<small>

${topHour ? topHour[0]+":00" : "-"}

</small>

</div>

<i class="fa-regular fa-clock"></i>

</div>

<div class="insight-list-item">

<div>

<b>Hari Tersibuk</b>

<small>

${topDay ? topDay[0] : "-"}

</small>

</div>

<i class="fa-regular fa-calendar"></i>

</div>

`;

}

/*======================================
        HISTORY
======================================*/

function renderHistory(){

    const container =
    document.getElementById("historyList");

    if(!container) return;

    container.innerHTML="";

    const data={};

    transactions.forEach(tr=>{

        const date=new Date(tr.createdAt);

        const key=date.toLocaleDateString("id-ID",{

            month:"long",

            year:"numeric"

        });

        if(!data[key]){

            data[key]={

                income:0,

                expense:0

            };

        }

        if(tr.type==="income"){

            data[key].income+=tr.amount;

        }

        if(tr.type==="expense"){

            data[key].expense+=tr.amount;

        }

    });

    Object.entries(data)

    .reverse()

    .forEach(([month,value])=>{

        container.innerHTML+=`

<div class="insight-list-item">

<div>

<b>${month}</b>

<small>

+ ${formatRupiah(value.income)}

&nbsp;&nbsp;

- ${formatRupiah(value.expense)}

</small>

</div>

<i class="fa-solid fa-calendar-days"></i>

</div>

`;

    });

}

/*======================================
        CHART
======================================*/

let incomeChart=null;
let expenseChart=null;
let balanceChart=null;

function destroyCharts(){

    if(incomeChart){

        incomeChart.destroy();

        incomeChart=null;

    }

    if(expenseChart){

        expenseChart.destroy();

        expenseChart=null;

    }

    if(balanceChart){

    balanceChart.destroy();

    balanceChart=null;

}

}

function createChartData(type){

    const labels = [];
    const values = [];

    getInsightTransactions()

    .filter(tr => tr.type === type)

    .sort((a,b)=>
        new Date(a.createdAt) - new Date(b.createdAt)
    )

    .forEach(tr=>{

        const date = new Date(tr.createdAt);

        let label = "";

        switch(insightFilter){

            case "today":

                label = date.toLocaleTimeString("id-ID",{
                    hour:"2-digit",
                    minute:"2-digit"
                });

                break;

            case "week":

                label = date.toLocaleDateString("id-ID",{
                    weekday:"short"
                }) + " " +
                date.toLocaleTimeString("id-ID",{
                    hour:"2-digit",
                    minute:"2-digit"
                });

                break;

            case "month":

                label =
                date.getDate() + "/" +
                (date.getMonth()+1) + " " +
                date.toLocaleTimeString("id-ID",{
                    hour:"2-digit",
                    minute:"2-digit"
                });

                break;

            case "year":

                label =
                date.toLocaleDateString("id-ID",{
                    day:"numeric",
                    month:"short"
                });

                break;

            default:

                label =
                date.toLocaleDateString("id-ID") +
                " " +
                date.toLocaleTimeString("id-ID",{
                    hour:"2-digit",
                    minute:"2-digit"
                });

        }

        labels.push(label);
        values.push(tr.amount);

    });

    return {
        labels,
        values
    };

}

/*======================================
        BALANCE HISTORY
======================================*/

function getRunningBalanceHistory(){

    const list = getInsightTransactions()

    .slice()

    .sort((a,b)=>
        new Date(a.createdAt) -
        new Date(b.createdAt)
    );

    let balance = 0;

    const history = [];

    list.forEach(tr=>{

        if(tr.type==="income"){

            balance += tr.amount;

        }else if(tr.type==="expense"){

            balance -= tr.amount;

        }else if(tr.type==="transfer"){

            return;
        }

        history.push({

            balance,

            createdAt:tr.createdAt

        });

    });

    return history;

}

/*======================================
        BALANCE CHART DATA
======================================*/

function createBalanceChartData(){

    const history = getRunningBalanceHistory();

    const labels = [];
    const values = [];

    if(
        insightFilter==="today" ||
        insightFilter==="week"
    ){

        history.forEach(item=>{

            labels.push(
                getBalanceLabel(
                    new Date(item.createdAt)
                )
            );

            values.push(item.balance);

        });

    }else{

        const grouped={};

        history.forEach(item=>{

            const date=new Date(item.createdAt);

            let key="";

            if(
                insightFilter==="month" ||
                insightFilter==="custom"
            ){

                key=date.toLocaleDateString("id-ID");

            }else{

                key=
                date.getFullYear()+
                "-"+
                (date.getMonth()+1);

            }

            grouped[key]={

                createdAt:item.createdAt,

                balance:item.balance

            };

        });

        Object.values(grouped).forEach(item=>{

            labels.push(
                getBalanceLabel(
                    new Date(item.createdAt)
                )
            );

            values.push(item.balance);

        });

    }

    return{

        labels,
        values

    };

}

/*======================================
        BALANCE LABEL
======================================*/

function getBalanceLabel(date){

    switch(insightFilter){

        case "today":

            return date.toLocaleTimeString("id-ID",{
                hour:"2-digit",
                minute:"2-digit"
            });

        case "week":

            return date.toLocaleDateString("id-ID",{
                weekday:"short"
            });

        case "month":

            return date.getDate().toString();

        case "year":

            return date.toLocaleDateString("id-ID",{
                month:"short"
            });

        case "custom":

            return date.toLocaleDateString("id-ID",{
                day:"numeric",
                month:"short"
            });

        default:

            return date.toLocaleDateString("id-ID");

    }

}

/*======================================
      BALANCE CANDLE DATA
======================================*/

function createBalanceCandleData(){

    const history = getRunningBalanceHistory();

    if(history.length===0) return [];

    // TODAY & WEEK
    if(
        insightFilter==="today" ||
        insightFilter==="week"
    ){

        return history.map((item,index)=>{

            const prev =
                index===0
                ? 0
                : history[index-1].balance;

            const open = prev;
            const close = item.balance;

            return{

                x:index,

                label:getBalanceLabel(
                    new Date(item.createdAt)
                ),

                o:open,
                h:Math.max(open,close),
                l:Math.min(open,close),
                c:close

            };

        });

    }

    // MONTH / YEAR / CUSTOM

    const groups={};

    history.forEach(item=>{

        const date=new Date(item.createdAt);

        let key="";

        if(
            insightFilter==="month" ||
            insightFilter==="custom"
        ){

            key=date.toLocaleDateString("id-ID");

        }else{

            key=
            date.getFullYear()+"-"+(date.getMonth()+1);

        }

        if(!groups[key]){

            groups[key]={

                createdAt:item.createdAt,

                values:[]

            };

        }

        groups[key].values.push(item.balance);

    });

    return Object.values(groups).map((group,index)=>{

        const values=group.values;

        return{

            x:index,

            label:getBalanceLabel(
                new Date(group.createdAt)
            ),

            o:values[0],

            h:Math.max(...values),

            l:Math.min(...values),

            c:values[values.length-1]

        };

    });

}

/*======================================
    RENDER BALANCE CANDLESTICK
======================================*/

function renderBalanceCandlestick(ctx){

    const candles=createBalanceCandleData();

    balanceChart=new Chart(ctx,{

        type:"candlestick",

        data:{

            datasets:[{

                label:"Saldo",

                data:candles,

                color:{

                    up:"#16c784",

                    down:"#ef4444",

                    unchanged:"#94a3b8"

                }

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{
                    display:false
                },

                tooltip:{

                    callbacks:{

                        title(items){

                            return candles[
                                items[0].parsed.x
                            ]?.label || "";

                        },

                        label(context){

                            const c=context.raw;

                            return[
                                "Open : "+formatRupiah(c.o),
                                "High : "+formatRupiah(c.h),
                                "Low : "+formatRupiah(c.l),
                                "Close : "+formatRupiah(c.c)
                            ];

                        }

                    }

                }

            },

            scales:{

    x:{

        type:"linear",

        offset:true,

        ticks:{

            callback(value){

                return candles[value]
                    ? candles[value].label
                    : "";

            }

        }

    },

    y:{

        ticks:{

            callback(value){

                return formatRupiah(value);

            }

        }

    }

}

        }

    });

}

/*======================================
        CANDLE DATA
======================================*/

function createCandleData(type){

    const list = getInsightTransactions()

    .filter(tr=>tr.type===type)

    .sort((a,b)=>

        new Date(a.createdAt)-new Date(b.createdAt)

    );

    return list.map((tr,index)=>{

        const prev=index===0

        ? tr.amount

        : list[index-1].amount;

        const date=new Date(tr.createdAt);

        return{

            label:

            date.toLocaleDateString("id-ID")+

            " "+

            date.toLocaleTimeString("id-ID",{

                hour:"2-digit",

                minute:"2-digit"

            }),

            x:index,

            o:prev,

            h:Math.max(prev,tr.amount),

            l:Math.min(prev,tr.amount),

            c:tr.amount

        };

    });

}

/*======================================
    RENDER INCOME CANDLESTICK
======================================*/

function renderIncomeCandlestick(ctx,data){

    const candles = data.values.map((value,index)=>{

        const prev =
        index===0
        ? value
        : data.values[index-1];

        return{

            x:index,

            o:prev,

            h:Math.max(prev,value),

            l:Math.min(prev,value),

            c:value

        };

    });

    incomeChart = new Chart(ctx,{

        type:"candlestick",

        data:{

            datasets:[{

                label:"Pemasukan",

                data:candles,

                color:{

                    up:"#16c784",

                    down:"#ef4444",

                    unchanged:"#94a3b8"

                }

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            animation:false,

            plugins:{

                legend:{
                    display:false
                }

            },

            scales:{

                x:{

                    type:"linear",

                    ticks:{

                        callback(value){

                            return data.labels[value] || "";

                        }

                    }

                },

                y:{

                    beginAtZero:true,

                    ticks:{

                        callback(value){

                            return formatRupiah(value);

                        }

                    }

                }

            }

        }

    });

}

/*======================================
    RENDER EXPENSE CANDLESTICK
======================================*/

function renderExpenseCandlestick(ctx){

    const candles=createCandleData("expense");

    expenseChart=new Chart(ctx,{

        type:"candlestick",

        data:{

            datasets:[{

                label:"Pengeluaran",

                data:candles,

                color:{

                    up:"#ef4444",

                    down:"#ef4444",

                    unchanged:"#ef4444"

                }

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    display:false

                }

            },

            scales:{

                x:{

                    type:"linear",

                    ticks:{

                        callback(value){

                            return candles[value]?.label||"";

                        }

                    }

                },

                y:{

                    beginAtZero:true,

                    ticks:{

                        callback(value){

                            return formatRupiah(value);

                        }

                    }

                }

            }

        }

    });

}

/*======================================
    RENDER COMPARE CANDLESTICK
======================================*/

function renderCompareCandlestick(ctx){

    const income=createChartData("income");

    const expense=createChartData("expense");

    const labels=[

        ...new Set([

            ...income.labels,

            ...expense.labels

        ])

    ];

    const incomeData=labels.map(label=>{

        const i=income.labels.indexOf(label);

        return i>-1

        ? income.values[i]

        : null;

    });

    const expenseData=labels.map(label=>{

        const i=expense.labels.indexOf(label);

        return i>-1

        ? expense.values[i]

        : null;

    });

    compareChart=new Chart(ctx,{

        type:"line",

        data:{

            labels,

            datasets:[

                {

                    label:"Income",

                    data:incomeData,

                    borderColor:"#16c784",

                    borderWidth:2,

                    tension:.35,

                    pointRadius:3

                },

                {

                    label:"Expense",

                    data:expenseData,

                    borderColor:"#ef4444",

                    borderWidth:2,

                    tension:.35,

                    pointRadius:3

                }

            ]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false

        }

    });

}

function renderIncomeChart(){

    const ctx =
    document.getElementById("incomeChart");

    if(!ctx) return;

    const data = createChartData("income");

    if(insightChartType==="candlestick"){

    renderIncomeCandlestick(ctx,data);

    return;

}

    incomeChart = new Chart(ctx,{

        type:"line",

        data:{

            labels:data.labels,

            datasets:[{

                label:"Pemasukan",

                data:data.values,

                borderColor:"#16c784",

                backgroundColor(context){

                    const chart = context.chart;
                    const area = chart.chartArea;

                    if(!area) return;

                    const gradient =
                    chart.ctx.createLinearGradient(
                        0,
                        area.top,
                        0,
                        area.bottom
                    );

                    gradient.addColorStop(
                        0,
                        "rgba(22,199,132,.28)"
                    );

                    gradient.addColorStop(
                        1,
                        "rgba(22,199,132,0)"
                    );

                    return gradient;

                },

                fill:true,

                tension:.28,
cubicInterpolationMode:"monotone",

                borderWidth:2,

                pointRadius:3,
pointHoverRadius:7,
pointHitRadius:18,
              
                pointHoverBorderWidth:2,

                pointHoverBackgroundColor:"#fff",

                pointHoverBorderColor:"#16c784"

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            animation:{

                duration:700,

                easing:"easeOutQuart"

            },

            interaction:{

                mode:"index",

                intersect:false

            },

            plugins:{

                legend:{

                    display:false

                },

                tooltip:{

                    backgroundColor:"#1f2937",

                    titleColor:"#fff",

                    bodyColor:"#fff",

                    displayColors:false,

                    padding:12,

                    cornerRadius:12,

                    callbacks:{

                        label(ctx){

                            return formatRupiah(
                                ctx.parsed.y
                            );

                        }

                    }

                }

            },

            scales:{

                x:{

                    grid:{
                        display:false
                    },

                    ticks:{

                        font:{
                            size:10
                        },

                        color:"#94a3b8"

                    }

                },

                y:{

                    beginAtZero:true,

                    grid:{

                        color:"rgba(148,163,184,.15)"

                    },

                    ticks:{

                        font:{
                            size:10
                        },

                        color:"#94a3b8",

                        callback(value){

                            if(value>=1000000){

                                return (
                                    value/1000000
                                )+"JT";

                            }

                            if(value>=1000){

                                return (
                                    value/1000
                                )+"RB";

                            }

                            return value;

                        }

                    }

                }

            }

        }

    });

}

function renderExpenseChart(){

    const ctx =
    document.getElementById("expenseChart");

    if(!ctx) return;

    const data = createChartData("expense");

    if(insightChartType==="candlestick"){

    renderExpenseCandlestick(ctx,data);

    return;

}

    expenseChart = new Chart(ctx,{

        type:"line",

        data:{

            labels:data.labels,

            datasets:[{

                label:"Pengeluaran",

                data:data.values,

                borderColor:"#ef4444",

                backgroundColor(context){

                    const chart = context.chart;
                    const area = chart.chartArea;

                    if(!area) return;

                    const gradient =
                    chart.ctx.createLinearGradient(
                        0,
                        area.top,
                        0,
                        area.bottom
                    );

                    gradient.addColorStop(
                        0,
                        "rgba(239,68,68,.28)"
                    );

                    gradient.addColorStop(
                        1,
                        "rgba(239,68,68,0)"
                    );

                    return gradient;

                },

                fill:true,

                tension:.28,
cubicInterpolationMode:"monotone",

                borderWidth:2,

                pointRadius:3,
pointHoverRadius:7,
pointHitRadius:18,

                pointHoverBackgroundColor:"#fff",

                pointHoverBorderColor:"#ef4444"

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            animation:{

                duration:700,

                easing:"easeOutQuart"

            },

            interaction:{

                mode:"index",

                intersect:false

            },

            plugins:{

                legend:{

                    display:false

                },

                tooltip:{

                    backgroundColor:"#1f2937",

                    titleColor:"#fff",

                    bodyColor:"#fff",

                    displayColors:false,

                    padding:12,

                    cornerRadius:12,

                    callbacks:{

                        label(ctx){

                            return formatRupiah(
                                ctx.parsed.y
                            );

                        }

                    }

                }

            },

            scales:{

                x:{

                    grid:{
                        display:false
                    },

                    ticks:{

                        font:{
                            size:10
                        },

                        color:"#94a3b8"

                    }

                },

                y:{

                    beginAtZero:true,

                    grid:{

                        color:"rgba(148,163,184,.15)"

                    },

                    ticks:{

                        font:{
                            size:10
                        },

                        color:"#94a3b8",

                        callback(value){

                            if(value>=1000000){

                                return (
                                    value/1000000
                                )+"JT";

                            }

                            if(value>=1000){

                                return (
                                    value/1000
                                )+"RB";

                            }

                            return value;

                        }

                    }

                }

            }

        }

    });

}

function renderBalanceChart(){

    const ctx = document.getElementById("compareChart");

    if(!ctx) return;

    const data = createBalanceChartData();

    if(insightChartType==="candlestick"){

        renderBalanceCandlestick(ctx);

        return;

    }

    balanceChart = new Chart(ctx,{

        type:"line",

        data:{

            labels:data.labels,

            datasets:[{

                label:"Saldo",

                data:data.values,

                borderColor:"#3b82f6",

                backgroundColor(context){

                    const chart=context.chart;

                    const area=chart.chartArea;

                    if(!area) return;

                    const gradient=

                    chart.ctx.createLinearGradient(

                        0,

                        area.top,

                        0,

                        area.bottom

                    );

                    gradient.addColorStop(
                        0,
                        "rgba(59,130,246,.28)"
                    );

                    gradient.addColorStop(
                        1,
                        "rgba(59,130,246,0)"
                    );

                    return gradient;

                },

                fill:true,

                tension:.35,

                borderWidth:2,

                pointRadius:3,

                pointHoverRadius:7

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            interaction:{

                mode:"index",

                intersect:false

            },

            plugins:{

                legend:{
                    display:false
                },

                tooltip:{

                    callbacks:{

                        label(ctx){

                            return "Saldo : " +

                            formatRupiah(ctx.parsed.y);

                        }

                    }

                }

            },

            scales:{

                y:{

                    ticks:{

                        callback(value){

                            return formatRupiah(value);

                        }

                    }

                }

            }

        }

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

  localStorage.setItem(
    "users",
    JSON.stringify(users)
);

localStorage.setItem(
    "currentUser",
    JSON.stringify(currentUser)
);

  if(currentUser){

    currentUser.banks = banks;

    currentUser.transactions = transactions;

    currentUser.categories = categories;

    const index = users.findIndex(
        user => user.id === currentUser.id
    );

    if(index > -1){

        users[index] = currentUser;

    }

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );

}

}

/*======================================
    RESET SALDO AWAL HARI
======================================*/

function resetStartOfDay(){

    const today =
    new Date().toDateString();

    const last =
    localStorage.getItem("startDay");

    if(last !== today){

        banks.forEach(bank=>{

            bank.startOfDay =
            bank.balance;

        });

        localStorage.setItem(
            "startDay",
            today
        );

        saveData();

    }

}

function createBankCard(bank, manage = false){

    const totalBalance = banks.reduce(
        (sum,b)=>sum+b.balance,
        0
    );

    const balancePercent =
        totalBalance>0
        ? bank.balance/totalBalance*100
        : 0;

    const change =
        bank.balance-bank.startOfDay;

    const changePercent =
        bank.startOfDay>0
        ? (change/bank.startOfDay)*100
        : 0;

    const card=document.createElement("div");

    card.className="bank-item";
    card.draggable = false;
card.dataset.id = bank.id;

    card.innerHTML=`

<div class="bank-top">

<div class="bank-info">

<h4>

<i class="fa-solid fa-building-columns"></i>

${bank.name}

</h4>

<div class="bank-balance-row">

<span class="bank-balance">

${balanceHidden ? "••••••" : formatRupiah(bank.balance)}

</span>

<span class="bank-change ${
change>0?"plus":change<0?"minus":"zero"
}">

${changePercent.toFixed(1)}%

</span>

</div>

</div>

<div class="bank-actions">

${
manage ?

`

<div class="manage-actions">

<button class="rename-bank">
    <i class="fa-solid fa-pen"></i>
</button>

<button class="delete-bank">
    <i class="fa-solid fa-trash"></i>
</button>

</div>

`

:

`

<button class="bank-action-btn">
    <i class="fa-solid fa-ellipsis"></i>
</button>

<div class="bank-action-menu">

    <button class="view-bank">
        <i class="fa-regular fa-file-lines"></i>
    </button>

    <button class="rename-bank">
        <i class="fa-solid fa-pen"></i>
    </button>

    <button class="delete-bank">
        <i class="fa-solid fa-trash"></i>
    </button>

</div>

`
}

</div>

</div>

<div class="bank-percent">

<div class="bank-progress">

<div class="bank-progress-fill"

style="width:${balancePercent}%">

</div>

</div>

<span>${balancePercent.toFixed(0)}%</span>

</div>

`;

    if(manage){

    card.querySelector(".rename-bank").onclick = ()=>renameBank(bank.id);

    card.querySelector(".delete-bank").onclick = ()=>deleteBank(bank.id);

}else{

    card.querySelector(".view-bank").onclick = ()=>viewBank(bank.id);

    card.querySelector(".rename-bank").onclick = ()=>renameBank(bank.id);

    card.querySelector(".delete-bank").onclick = ()=>deleteBank(bank.id);

    // hanya card di Home yang punya menu titik tiga
    setTimeout(initBankMenu,0);

}

    return card;

}

/*======================================
            RENDER BANK
======================================*/

function renderBanks(){

    const bankList = document.getElementById("bankList");

    bankList.innerHTML = "";

    banks.forEach(bank=>{

        const card = createBankCard(bank);

        card.draggable = false;
        card.dataset.id = bank.id;

        bankList.appendChild(card);

    });

    bankList.appendChild(createAddButton());

    initBankMenu();

    initBankDrag();

}

function renderManageBank(){

    manageList.innerHTML="";

    banks.forEach(bank=>{

        manageList.appendChild(
            createBankCard(bank,true)
        );

    });

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

const manageOverlay =
document.getElementById("manageBankOverlay");

const manageList =
document.getElementById("manageBankList");

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
renderManageBank();

updateTotalBalance();

renderSummary();
renderIncomeAnalysis();
renderAnalysis();
renderProfile();

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
        renderManageBank();
        updateTotalBalance();
        renderSummary();
        renderIncomeAnalysis();
        renderAnalysis();
        renderProfile();
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

document
.getElementById("openManageBank")
.onclick = function(){

    renderManageBank();

    manageOverlay.classList.add("show");

};

manageOverlay.onclick = function(e){

    if(e.target===manageOverlay){

        manageOverlay.classList.remove("show");

    }

};

document
.getElementById("manageAddBank")
.onclick=function(){

    manageOverlay.classList.remove("show");

    setTimeout(()=>{

        addBank();

    },300);

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
        INSIGHT FILTER BUTTON
======================================*/

document
.querySelectorAll(".insight-filter button")
.forEach(btn=>{

btn.onclick=function(){

const filter=this.dataset.filter;

if(filter==="custom"){

insightCustomOverlay.classList.add("show");

return;

}

document
.querySelectorAll(".insight-filter button")
.forEach(b=>b.classList.remove("active"));

this.classList.add("active");

insightFilter=filter;

renderInsight();

};

});

saveInsightCustom.onclick=function(){

if(
!insightStartDate.value ||
!insightEndDate.value
){

showToast(
"warning",
"Pilih tanggal."
);

return;

}

insightCustomStart=
new Date(insightStartDate.value);

insightCustomEnd=
new Date(insightEndDate.value);

insightCustomEnd.setHours(
23,
59,
59,
999
);

insightFilter="custom";

document
.querySelectorAll(".insight-filter button")
.forEach(btn=>{

btn.classList.remove("active");

if(btn.dataset.filter==="custom"){

btn.classList.add("active");

}

});

insightCustomOverlay.classList.remove("show");

renderInsight();

};

cancelInsightCustom.onclick=function(){

insightCustomOverlay.classList.remove("show");

};

insightCustomOverlay.onclick=function(e){

if(e.target===insightCustomOverlay){

insightCustomOverlay.classList.remove("show");

}

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

    pickerList.classList.remove("icon-mode");
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

    pickerList.classList.add("icon-mode");

    pickerList.innerHTML="";

    categoryIcons.forEach(icon=>{

        const item=document.createElement("button");

        item.type="button";

        item.className="icon-picker-item";

        item.innerHTML=`<i class="${icon}"></i>`;

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

    oldBank.balance -= old.amount;

}else{

    oldBank.balance += old.amount;

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
renderProfile();

renderTransactions();

updateLastUpdate();
renderInsight();

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
    renderProfile();

    renderTransactions();

    updateLastUpdate();
    renderInsight();

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

list.forEach((tr,index)=>{

    // Home hanya 5 transaksi terakhir
    const showHome = index < 3;

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

       card.innerHTML = `

<div class="transaction-main">

    <div class="transaction-left">

        <div class="transaction-icon ${tr.type}">
            <i class="${icon}"></i>
        </div>

        <div class="transaction-info">

            <h3>${title}</h3>

            <p>${bankText}</p>

            <small class="transaction-time">
                ${tr.time}
            </small>

        </div>

    </div>

    <div class="transaction-right">

        <b class="${amountClass}">
            ${amountText}
        </b>

        <div class="transaction-actions">

            <button class="edit-btn">
                <i class="fa-solid fa-pen"></i>
            </button>

            <button class="delete-btn">
                <i class="fa-solid fa-trash"></i>
            </button>

            <button class="menu-btn">
                <i class="fa-solid fa-ellipsis"></i>
            </button>

        </div>

    </div>

</div>

${`
<div class="transaction-note-card">
    <i class="fa-solid fa-note-sticky"></i>
    <span>${tr.note?.trim() || "-"}</span>
</div>
`}

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

if(showHome){
    homeList.appendChild(homeCard);
}

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
renderProfile();

renderTransactions();

updateLastUpdate();
renderInsight();

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
        RENDER INSIGHT
======================================*/

function renderInsight(){

    destroyCharts();

renderInsightSummary();

renderInsightAI();

renderFinancialHealth();

renderIncomeChart();

renderExpenseChart();

renderBalanceChart();

renderTopCategory();

renderTopBank();

renderActivity();

renderHistory();

}

/*======================================
        INSIGHT AI
======================================*/

function renderInsightAI(){

const box=document.getElementById("insightAiList");

if(!box) return;

box.innerHTML="";

const list=getInsightTransactions();

if(list.length===0){

box.innerHTML=`

<div class="empty-box">

Belum ada data transaksi.

</div>

`;

return;

}

let income=0;

let expense=0;

const category={};

const bank={};

list.forEach(tr=>{

if(tr.type==="income") income+=tr.amount;

if(tr.type==="expense") expense+=tr.amount;

if(tr.type!=="transfer"){

category[tr.categoryId]=(category[tr.categoryId]||0)+tr.amount;

bank[tr.bankId]=(bank[tr.bankId]||0)+1;

}

});

const topCategoryId=

Object.keys(category)

.sort((a,b)=>category[b]-category[a])[0];

const topBankId=

Object.keys(bank)

.sort((a,b)=>bank[b]-bank[a])[0];

const topCategory=getCategory(Number(topCategoryId));

const topBank=banks.find(b=>b.id==topBankId);

box.innerHTML+=`

<div class="insight-ai-item">

<i class="fa-solid fa-chart-line"></i>

<div>

<b>Keuangan</b>

<p>

Selisih keuangan Anda

<strong>

${formatRupiah(income-expense)}

</strong>

pada periode ini.

</p>

</div>

</div>

`;

if(topCategory){

box.innerHTML+=`

<div class="insight-ai-item">

<i class="${topCategory.icon}"></i>

<div>

<b>Kategori Terbesar</b>

<p>

Kategori

<strong>

${topCategory.name}

</strong>

menjadi transaksi terbesar.

</p>

</div>

</div>

`;

}

if(topBank){

box.innerHTML+=`

<div class="insight-ai-item">

<i class="fa-solid fa-building-columns"></i>

<div>

<b>Bank Favorit</b>

<p>

Bank

<strong>

${topBank.name}

</strong>

paling sering digunakan.

</p>

</div>

</div>

`;

}

}

/*======================================
    FINANCIAL HEALTH
======================================*/

function renderFinancialHealth(){

    const list = getInsightTransactions();

    let income = 0;
    let expense = 0;

    list.forEach(tr=>{

        if(tr.type==="income") income += tr.amount;
        if(tr.type==="expense") expense += tr.amount;

    });

    const savingRate =
        income > 0
        ? ((income - expense) / income) * 100
        : 0;

    const expenseRatio =
        income > 0
        ? (expense / income) * 100
        : 0;

    let score = 100;

    // =========================
    // Expense Ratio
    // =========================
    if(expenseRatio <= 30){

        score = 100;

    }else if(expenseRatio <= 40){

        score = 95;

    }else if(expenseRatio <= 50){

        score = 85;

    }else if(expenseRatio <= 60){

        score = 75;

    }else if(expenseRatio <= 70){

        score = 60;

    }else if(expenseRatio <= 80){

        score = 45;

    }else if(expenseRatio <= 100){

        score = 25;

    }else{

        score = 5;

    }

    // =========================
    // Bonus / Penalti Saving
    // =========================
    if(savingRate >= 40){

        score += 5;

    }else if(savingRate >= 20){

        score += 2;

    }else if(savingRate < 0){

        score -= 10;

    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let status = "";

    if(score >= 95){

        status = "Sangat Sehat";

    }else if(score >= 85){

        status = "Sehat";

    }else if(score >= 75){

        status = "Baik";

    }else if(score >= 60){

        status = "Cukup";

    }else if(score >= 40){

        status = "Buruk";

    }else{

        status = "Sangat Buruk";

    }

    // =========================
    // Warna Status
    // =========================

    const healthStatus =
    document.getElementById("healthStatus");

    healthStatus.className = "health-status";

    if(score >= 95){

        healthStatus.classList.add("excellent");

    }else if(score >= 85){

        healthStatus.classList.add("good");

    }else if(score >= 75){

        healthStatus.classList.add("good");

    }else if(score >= 60){

        healthStatus.classList.add("fair");

    }else if(score >= 40){

        healthStatus.classList.add("bad");

    }else{

        healthStatus.classList.add("danger");

    }

    document.getElementById("healthScore").textContent = score;

    healthStatus.textContent = status;

    document.getElementById("savingRate").textContent =
        savingRate.toFixed(1) + "%";

    document.getElementById("expenseRatio").textContent =
        expenseRatio.toFixed(1) + "%";

    document.getElementById("cashFlowStatus").textContent =
        income >= expense
        ? "Positif"
        : "Negatif";

}

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
        PROFILE
======================================*/

function renderProfile(){

  const profileHeaderLeft =
document.getElementById("profileHeaderLeft");

const profileHeaderRight =
document.getElementById("profileHeaderRight");

if(currentUser){

    profileHeaderLeft.innerHTML = `

        <h2>${currentUser.name}</h2>

        <small>@${currentUser.username}</small>

    `;

    profileHeaderRight.innerHTML = `

        <button
        id="logoutButton"
        class="profile-setting">

            <i class="fa-solid fa-right-from-bracket"></i>

        </button>

    `;

    document
    .getElementById("logoutButton")
    .onclick = function(){

        currentUser = null;

banks = [];

transactions = [];

categories = JSON.parse(localStorage.getItem("categories")) || {
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

localStorage.removeItem("currentUser");

renderBanks();
updateTotalBalance();
renderSummary();
renderIncomeAnalysis();
renderAnalysis();
renderTransactions();
renderInsight();
renderProfile();

    };

}else{

    profileHeaderLeft.innerHTML = `
        <h2>Profil</h2>
    `;

    profileHeaderRight.innerHTML = "";

    const authBtn = document.getElementById("authButton");

if (authBtn) {
    authBtn.onclick = openAuth;
}

}

    // Total saldo semua bank
    const saldo = banks.reduce(
        (sum, bank) => sum + bank.balance,
        0
    );

    // Sementara
    const investasi = 0;

    const now = new Date();

let growth = 0;

transactions.forEach(tr=>{

    if(tr.type==="transfer") return;

    const date = new Date(tr.createdAt);

    if(
        date.getMonth()===now.getMonth() &&
        date.getFullYear()===now.getFullYear()
    ){

        if(tr.type==="income"){

            growth += tr.amount;

        }else{

            growth -= tr.amount;

        }

    }

});
  
    const piutang = 0;
    const hutang = 0;

    const totalAsset =
        saldo +
        investasi +
        piutang -
        hutang;

    // Total Kekayaan
    document.getElementById("totalAsset").textContent =
        formatRupiah(totalAsset);

    document.getElementById("assetBalance").textContent =
        formatRupiah(saldo);

    document.getElementById("assetInvestment").textContent =
        formatRupiah(investasi);

    document.getElementById("assetReceivable").textContent =
        formatRupiah(piutang);

    document.getElementById("assetDebt").textContent =
        formatRupiah(hutang);

const growthText = document.getElementById("assetGrowth");

if(growthText){

    growthText.textContent =
        (growth >= 0 ? "▲ " : "▼ ") +
        formatRupiah(Math.abs(growth)) +
        " Bulan Ini";

}

    // Statistik
    const today = new Date();

    let todayCash = 0;
    let monthCash = 0;

    transactions.forEach(tr=>{

        if(tr.type==="transfer") return;

        const date = new Date(tr.createdAt);

        const value =
            tr.type==="income"
            ? tr.amount
            : -tr.amount;

        if(date.toDateString()===today.toDateString()){

            todayCash += value;

        }

        if(
            date.getMonth()===today.getMonth() &&
            date.getFullYear()===today.getFullYear()
        ){

            monthCash += value;

        }

    });

    document.getElementById("todayCashflow").textContent =
        formatRupiah(todayCash);

    document.getElementById("monthCashflow").textContent =
        formatRupiah(monthCash);

    document.getElementById("profileTransaction").textContent =
        transactions.length;

    document.getElementById("profileBank").textContent =
        banks.length;

  const profileName =
document.getElementById("profileName");

const profileStatus =
document.getElementById("profileStatus");

const authButton =
document.getElementById("authButton");

if(currentUser){

    profileName.textContent =
    currentUser.name;

    profileStatus.textContent =
    "Data tersinkron dengan perangkat.";

    authButton.style.display = "none";

}else{

    profileName.textContent =
    "Belum Login";

    profileStatus.textContent =
    "Sinkronkan data agar tidak hilang.";

    authButton.style.display = "block";

}

  const insightBox =
document.getElementById("profileInsightList");

if(insightBox){

    let income = 0;
    let expense = 0;

    transactions.forEach(tr=>{

        if(tr.type==="income") income += tr.amount;

        if(tr.type==="expense") expense += tr.amount;

    });

    let title = "";
    let desc = "";
    let icon = "";

    if(transactions.length===0){

        title = "Belum ada data";

        desc =
        "Tambahkan transaksi pertama untuk mendapatkan analisis.";

        icon = "fa-solid fa-sparkles";

    }else if(income > expense){

        title = "Keuangan Sehat";

        desc =
        "Pemasukan lebih besar dari pengeluaran.";

        icon = "fa-solid fa-arrow-trend-up";

    }else if(expense > income){

        title = "Pengeluaran Tinggi";

        desc =
        "Pengeluaran melebihi pemasukan.";

        icon = "fa-solid fa-triangle-exclamation";

    }else{

        title = "Cashflow Stabil";

        desc =
        "Pemasukan dan pengeluaran seimbang.";

        icon = "fa-solid fa-scale-balanced";

    }

    insightBox.innerHTML = `
    <div class="profile-insight">
        <i class="${icon}"></i>
        <div>
            <b>${title}</b>
            <span>${desc}</span>
        </div>
    </div>`;
}

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

/*======================================
            AUTH
======================================*/

const authOverlay =
document.getElementById("authOverlay");

const loginTab =
document.getElementById("loginTab");

const registerTab =
document.getElementById("registerTab");

const loginForm =
document.getElementById("loginForm");

const registerForm =
document.getElementById("registerForm");

const loginBtn =
document.getElementById("loginButton");

const registerBtn =
document.getElementById("registerButton");

const authButton =
document.getElementById("authButton");

function openAuth(){

    authOverlay.classList.add("show");

}

function closeAuth(){

    authOverlay.classList.remove("show");

}

authOverlay.onclick=function(e){

    if(e.target===authOverlay){

        closeAuth();

    }

};

if(loginBtn){

    loginBtn.onclick=openAuth;

}

if(registerBtn){

    registerBtn.onclick=function(){

        openAuth();

        registerTab.click();

    };

}

if(authButton){

    authButton.onclick = function(){

        openAuth();

    };

}

loginTab.onclick=function(){

    loginTab.classList.add("active");

    registerTab.classList.remove("active");

    loginForm.style.display="block";

    registerForm.style.display="none";

};

registerTab.onclick=function(){

    registerTab.classList.add("active");

    loginTab.classList.remove("active");

    registerForm.style.display="block";

    loginForm.style.display="none";

};

/*======================================
        REGISTER ACCOUNT
======================================*/

const registerName =
document.getElementById("registerName");

const registerUsername =
document.getElementById("registerUsername");

const registerPassword =
document.getElementById("registerPassword");

const registerSubmit =
document.getElementById("registerSubmit");

const loginUsername =
document.getElementById("loginUsername");

const loginPassword =
document.getElementById("loginPassword");

const loginSubmit =
document.getElementById("loginSubmit");

registerSubmit.onclick=function(){

    const name =
    registerName.value.trim();

    const username =
    registerUsername.value.trim().toLowerCase();

    const password =
    registerPassword.value;

    if(!name || !username || !password){

        showToast(
            "warning",
            "Lengkapi semua data."
        );

        return;

    }

if(users.find(u=>u.username===username)){

        showToast(
            "error",
            "Username sudah digunakan."
        );

        return;

    }

    users.push({

    id: generateId(),

    name,

    username,

    password,

    banks: [

        {
            id: generateId(),
            name: "Cash",
            balance: 0,
            startOfDay: 0
        },

        {
            id: generateId(),
            name: "Jago",
            balance: 0,
            startOfDay: 0
        }

    ],

    transactions: [],

    categories: {

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

    }

});

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

    showToast(
        "success",
        "Akun berhasil dibuat."
    );

  currentUser = users.at(-1);

localStorage.setItem(
    "currentUser",
    JSON.stringify(currentUser)
);

banks = currentUser.banks;

transactions = currentUser.transactions;

categories = currentUser.categories;

saveData();

resetStartOfDay();

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

renderInsight();

renderProfile();

closeAuth();

    registerName.value="";
    registerUsername.value="";
    registerPassword.value="";

    loginTab.click();

};

loginSubmit.onclick = function(){

    const username =
    loginUsername.value.trim().toLowerCase();

    const password =
    loginPassword.value;

    const user = users.find(u =>

        u.username === username &&

        u.password === password

    );

    if(!user){

        showToast(
            "error",
            "Username atau password salah."
        );

        return;

    }

    currentUser = user;

    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );

    banks = currentUser.banks ?? [];

transactions = currentUser.transactions ?? [];

categories = currentUser.categories ?? {

    income: [],

    expense: []

};

    resetStartOfDay();

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

    renderInsight();

    renderProfile();

    closeAuth();

    showToast(
        "success",
        "Login berhasil."
    );

};

resetStartOfDay();

if(currentUser){

    banks = currentUser.banks || [];

    transactions = currentUser.transactions || [];

    categories = currentUser.categories || {

        income: [],

        expense: []

    };

}

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

renderInsight();

renderProfile();
