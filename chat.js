
"use strict";

const banks = JSON.parse(
localStorage.getItem("banks") || "[]"
);

const categories = JSON.parse(
localStorage.getItem("categories") || "{}"
);

const transactions = JSON.parse(
localStorage.getItem("transactions") || "[]"
);

const allCategories = [
...(categories.income || []),
...(categories.expense || [])
];

let pendingTransactions = [];

let isTyping = false;

const chatContainer =
document.getElementById("chatContainer");

const input =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

const backBtn =
document.getElementById("backBtn");

backBtn.onclick = () => {

    window.location.href = "index.html";

};

function scrollBottom(){

chatContainer.scrollTop =  
chatContainer.scrollHeight;

}

function escapeHtml(text){

return String(text)  
.replace(/&/g,"&amp;")  
.replace(/</g,"&lt;")  
.replace(/>/g,"&gt;");

}

function formatRupiah(number){

if(!number) return "";  

return Number(number)  
.toLocaleString("id-ID");

}

function nowTime(){

return new Date().toLocaleTimeString(  
    "id-ID",  
    {  
        hour:"2-digit",  
        minute:"2-digit"  
    }  
);

}

function generateId(){

return Date.now() +  
Math.floor(Math.random()*99999);

}

function addUserMessage(text){

const wrapper =  
document.createElement("div");  

wrapper.className = "message user";  

wrapper.innerHTML = `  

<div class="bubble">  

    ${escapeHtml(text)}  

    <div class="message-time">  

        ${nowTime()}  

    </div>  

</div>  

`;  

chatContainer.appendChild(wrapper);  

scrollBottom();

}

function addAIMessage(html){

const wrapper =  
document.createElement("div");  

wrapper.className = "message ai";  

wrapper.innerHTML = `  

<div class="avatar">  

    <img src="assets/apxx-ai.png">  

</div>  

<div class="bubble">  

    <div class="ai-name">  

        Apxx AI  

    </div>  

    ${html}  

    <div class="message-time">  

        ${nowTime()}  

    </div>  

</div>  

`;  

chatContainer.appendChild(wrapper);  

scrollBottom();

}

let typingBox = null;

function showTyping(){

if(typingBox) return;  

typingBox =  
document.createElement("div");  

typingBox.className =  
"message ai";  

typingBox.innerHTML = `  

<div class="avatar">  

    <img src="assets/apxx-ai.png">  

</div>  

<div class="typing">  

    <span></span>  
    <span></span>  
    <span></span>  

</div>  

`;  

chatContainer.appendChild(  
    typingBox  
);  

scrollBottom();

}

function hideTyping(){

if(!typingBox) return;  

typingBox.remove();  

typingBox = null;

}

window.onload = ()=>{

showTyping();  

setTimeout(()=>{  

    hideTyping();  

    addAIMessage(`

Halo Bestie! 🤗

<br><br>

Apa kabar hari ini?

Semoga semuanya berjalan lancar ya. ✨

<br><br>

Hari ini mau catat pemasukan, pengeluaran, atau mau lihat kondisi keuangan dulu?

Tinggal chat aja seperti ngobrol biasa, aku siap bantu. 💙

`);

},1500);

}

function sendMessage(){

const text = input.value.trim();  

if(!text) return;  

addUserMessage(text);  

input.value = "";  

showTyping();  

setTimeout(()=>{  

    hideTyping();  

    processMessage(text);  

},800);

}

sendBtn.onclick = sendMessage;

input.onkeydown = e=>{

if(e.key==="Enter"){  

    sendMessage();  

}

};

let aiState = {

waiting:false,  

field:null,  

data:null

};

let aiContext = {

waiting:false,  

transaction:null,  

field:null

};

let draftTransaction = {

type:null,  

amount:null,  

bank:null,  

category:null,  

note:"",  

date:new Date()

};

let lastTransactionCard = null;

let lastTransactionData = null;

let chatState = null;

function processMessage(text){

if(aiContext.waiting){

return processContextReply(text);

}

/*=========================  
    MASIH ADA PERTANYAAN  
=========================*/  

if(aiState.waiting){  

    return processWaitingAnswer(text);  

}  

const msg =  
text.toLowerCase();

if(
["halo","hai","hi","pagi","siang","sore","malam","assalamualaikum"]
.includes(msg)
){

chatState = "greeting";  

return addAIMessage(`  
Halo juga Bestie 👋😊  

<br><br>  

Apa kabar hari ini?  

<br><br>  

Mau catat transaksi atau lihat laporan keuangan?  
`);

}

if(chatState=="greeting"){

chatState = null;  

if(  
    msg.includes("baik") ||  
    msg.includes("alhamdulillah") ||  
    msg.includes("sehat")  
){  

    return addAIMessage(`  
    Syukurlah 😊  

    <br><br>  

    Semoga harimu lancar ya.  

    <br><br>  

    Ada transaksi yang mau dicatat hari ini Bestie?  
    `);  

}  

if(  
    msg.includes("capek") ||  
    msg.includes("lelah") ||  
    msg.includes("pusing")  
){  

    return addAIMessage(`  
    Semoga setelah istirahat badanmu lebih enak ya 😊  

    <br><br>  

    Kalau ada transaksi tinggal chat aja ya Bestie.  
    `);  

}

}

if(

msg=="kopi" ||  

msg=="makan" ||  

msg=="bakso" ||  

msg=="ayam" ||  

msg=="bensin"

){

draftTransaction={  

    type:"expense",  

    amount:null,  

    bank:null,  

    category:detectSmartCategory(msg),  

    note:text,  

    date:new Date()  

};  

aiContext.waiting=true;  

aiContext.field="amount";  

aiContext.transaction=draftTransaction;  

return addAIMessage(  

    "💰 Nominalnya berapa Bestie?"  

);

}

if(

msg=="gaji" ||  

msg=="bonus"

){

draftTransaction={  

    type:"income",  

    amount:null,  

    bank:null,  

    category:detectSmartCategory(msg),  

    note:text,  

    date:new Date()  

};  

aiContext.waiting=true;  

aiContext.field="amount";  

aiContext.transaction=draftTransaction;  

return addAIMessage(  

    "💰 Berapa nominal pemasukannya?"  

);

}

if(

lastTransactionData &&  

(  
    msg.includes("yang tadi") ||  

    msg.includes("ubah") ||  

    msg.includes("ganti") ||  

    msg.includes("harusnya")  
)

){

return editLastTransaction(text);

}

if(  

    msg.includes("saldo")  

){  

    return showBalance();  

}

if(

msg.includes("insight")

){

return monthInsight();

}

if(msg.includes("hari ini")){

return showPeriodReport("today",msg);

}

if(msg.includes("minggu ini")){

return showPeriodReport("week",msg);

}

if(msg.includes("bulan ini")){

return showPeriodReport("month",msg);

}

if(  

    msg.includes("pengeluaran") &&  
    msg.includes("hari ini")  

){  

    return todayExpense();  

}  

if(  

    msg.includes("pemasukan") &&  
    msg.includes("hari ini")  

){  

    return todayIncome();  

}

if(processCommand(text)){

return;

}

parseTransactions(text);

}

function processContextReply(text){

const trx = aiContext.transaction;  

switch(aiContext.field){  

    case "bank":  

        trx.bank = banks.find(b=>  

            b.name.toLowerCase()==  
            text.toLowerCase()  

        );  

    break;  

    case "category":  

        trx.category = allCategories.find(c=>  

            c.name.toLowerCase()==  
            text.toLowerCase()  

        );  

    break;  

    case "amount":  

        trx.amount = Number(  

            text.replace(/\D/g,"")  

        );  

    break;  

}  

aiContext.waiting = false;

if(

aiContext.field=="amount"

){

aiContext.field="bank";  

aiContext.waiting=true;  

return addAIMessage(  

    "🏦 Pakai bank apa Bestie?"  

);

}

if(

aiContext.field=="bank"

){

aiContext.waiting=false;  

return showTransactionCard(trx);

}

showTransactionCard(trx);

}

function editLastTransaction(text){

const msg = text.toLowerCase();  

const data = lastTransactionData;  

const nominal = msg.match(  

    /(\d+[.,]?\d*)\s*(rb|ribu|jt|juta)?/  

);  

if(nominal){  

    let amount = parseFloat(nominal[1]);  

    if(nominal[2]){  

        const s = nominal[2];  

        if(s=="rb" || s=="ribu"){  

            amount *= 1000;  

        }  

        if(s=="jt" || s=="juta"){  

            amount *= 1000000;  

        }  

    }  

    data.amount = amount;  

}  

const bank = banks.find(b=>  

    msg.includes(  

        b.name.toLowerCase()  

    )  

);  

if(bank){  

    data.bank = bank;  

}  

const category = allCategories.find(c=>  

    msg.includes(  

        c.name.toLowerCase()  

    )  

);  

if(category){  

    data.category = category;  

}  

lastTransactionCard.remove();  

showTransactionCard(data);

}

function processWaitingAnswer(text){

const data =  
aiState.data;  

switch(aiState.field){  

    case "amount":  

        const angka =  
        text.replace(/\D/g,"");  

        data.amount =  
        Number(angka);  

        break;  

    case "bank":  

        data.bank =  
        banks.find(b=>  

            b.name  
            .toLowerCase()==  
            text.toLowerCase()  

        );  

        break;  

    case "category":  

        data.category =  
        allCategories.find(c=>  

            c.name  
            .toLowerCase()==  
            text.toLowerCase()  

        );  

        break;  

}  

aiState.waiting = false;  

aiState.field = null;  

showTransactionCard(data);

}

function processCommand(text){

const msg = text.toLowerCase();  

if(msg.includes("undo")){  

    undoLastTransaction();  

    return true;  

}  

if(msg.includes("hapus transaksi terakhir")){  

    undoLastTransaction();  

    return true;  

}  

if(msg.includes("transaksi terakhir")){  

    showLastTransaction();  

    return true;  

}  

if(msg.includes("jumlah transaksi")){  

    showTransactionCount();  

    return true;  

}

if(

msg.startsWith("cari") ||  

msg.startsWith("search")

){

searchTransaction(msg);  

return true;

}

return false;

}

function showWeekExpense(){

const transactions = JSON.parse(  

    localStorage.getItem("transactions")  

    || "[]"  

);  

const now = new Date();  

const weekAgo = new Date();  

weekAgo.setDate(now.getDate()-7);  

let total=0;  

let count=0;  

transactions.forEach(t=>{  

    const d = new Date(t.createdAt);  

    if(  

        t.type=="expense" &&  

        d>=weekAgo  

    ){  

        total += Number(t.amount);  

        count++;  

    }  

});  

addAIMessage(`

📅 <b>Pengeluaran 7 Hari Terakhir</b>

<br><br>

Jumlah transaksi

<b>${count}</b>

<br>  Total

<b>Rp ${formatRupiah(total)}</b>

`);

}

function showLastTransaction(){

const data = JSON.parse(  

    localStorage.getItem("transactions")  

    ||"[]"  

);  

if(!data.length){  

    return addAIMessage(  

        "Belum ada transaksi."  

    );  

}  

const trx = data[0];  

const bank =  

banks.find(  

    b=>b.id==trx.bankId  

);  

const category =  

allCategories.find(  

    c=>c.id==trx.categoryId  

);  

addAIMessage(`

📄 <b>Transaksi Terakhir</b>

<br><br>

💰 Rp ${formatRupiah(trx.amount)}

<br>  🏦 ${bank?.name || "-"}

<br>  📂 ${category?.name || "-"}

<br>  📝 ${trx.note}

`);

}

function undoLastTransaction(){

let data = JSON.parse(  

    localStorage.getItem("transactions")  

    ||"[]"  

);  

if(!data.length){  

    return addAIMessage(  

        "Tidak ada transaksi untuk dihapus."  

    );  

}  

const trx = data.shift();  

localStorage.setItem(  

    "transactions",  

    JSON.stringify(data)  

);  

addAIMessage(`

🗑 Berhasil menghapus transaksi

<b>${trx.note}</b>

`);

}

function showTransactionCount(){

const data = JSON.parse(  

    localStorage.getItem("transactions")  

    ||"[]"  

);  

addAIMessage(`

📊 Saat ini terdapat

<b>${data.length}</b>

transaksi yang tersimpan.

`);

}

function searchTransaction(keyword){

keyword = keyword  
    .replace("cari","")  
    .replace("search","")  
    .trim();  

const transactions = JSON.parse(  

    localStorage.getItem("transactions")  

    || "[]"  

);  

let result = transactions.filter(t=>{  

    return(  

        t.note  
        .toLowerCase()  
        .includes(  

            keyword.toLowerCase()  

        )  

    );  

});

if(!result.length){

const bank = banks.find(b=>  

    b.name  
    .toLowerCase()  

    .includes(keyword)  

);  

if(bank){  

    result = transactions.filter(  

        t=>t.bankId==bank.id  

    );  

}

}

const angka =

keyword.match(/\d+/);

if(

angka &&  

!result.length

){

const nominal =  

Number(angka[0]);  

result = transactions.filter(  

    t=>Number(t.amount)>=nominal  

);

}

if(!result.length){  

    return addAIMessage(  

        `🔍 Tidak ditemukan transaksi <b>${keyword}</b>.`  

    );  

}  

let html = `  

🔍 <b>Ditemukan ${result.length} transaksi</b>  

<br><br>  

`;  

let total = 0;  

result.forEach(tr=>{  

    total += Number(tr.amount);  

    html += `  

    💰 Rp ${formatRupiah(tr.amount)}  

    <br>  

    📝 ${tr.note}  

    <br><br>  

    `;  

});  

html += `  

<hr>  

Total  

<b>Rp ${formatRupiah(total)}</b>  

`;  

addAIMessage(html);

}

function parseTransactions(text){

pendingTransactions = [];

const globalDate =
detectSmartDate(text);

const globalBank =
banks.find(b=>

text  
.toLowerCase()  

.includes(  

    b.name.toLowerCase()  

)

);

const globalType =
detectTransactionType(text);

const list = text  
    .split(/\n|,| lalu | terus | kemudian | dan /i)  
    .map(v=>v.trim())  
    .filter(v=>v);  

list.forEach(item=>{  

const trx = parseTransaction(  

    item,  

    globalDate,  

    globalBank,  

    globalType  

);  

if(trx){  

    pendingTransactions.push(trx);  

}

});

if(!pendingTransactions.length){  

return addAIMessage(`

Aduh Bestie 🥹

<br><br>

Maaf ya, aku masih dalam tahap pengembangan jadi belum bisa memahami pesan itu.

<br><br>

Aku paling jago bantu mencatat transaksi, mencari transaksi, dan memberikan laporan keuangan.

<br><br>

Yuk coba kirim transaksi seperti:

<br>  • Makan bakso 20rb Cash

<br>  • Gaji 5 juta BCA

<br>  • Bensin 50rb Jago 😊

`);

}

pendingTransactions.forEach(trx=>{  

    showTransactionCard(trx);  

});

}

function parseTransaction(

text,  

globalDate,  

globalBank,  

globalType

){

const lower =  
text.toLowerCase();  

/*========== NOMINAL ==========*/  

let amount = 0;  

const amountMatch =  
lower.match(  
    /(\d+[.,]?\d*)\s*(jt|juta|rb|ribu)?/i  
);  

if(amountMatch){  

    amount =  
    parseFloat(amountMatch[1]);  

    if(amountMatch[2]){  

        const satuan =  
        amountMatch[2].toLowerCase();  

        if(  
            satuan=="jt"||  
            satuan=="juta"  
        ){  

            amount *= 1000000;  

        }  

        if(  
            satuan=="rb"||  
            satuan=="ribu"  
        ){  

            amount *= 1000;  

        }  

    }  

}  

/*========== BANK ==========*/  

let bank = null;  

bank = banks.find(b=>  

    lower.includes(  
        b.name.toLowerCase()  
    )  

);  

/*========== KATEGORI ==========*/  

let category =

detectCategoryFromHistory(text);

if(!category){

category =  
detectSmartCategory(text);

}

if(!category){

category =  
allCategories.find(c=>  

    lower.includes(  

        c.name.toLowerCase()  

    )  

);

}

/*========== TYPE ==========*/  

let type =

detectTransactionType(text);

if(!type){

type = globalType;

}

if(!amount){

aiContext.waiting=true;  

aiContext.field="amount";  

aiContext.transaction={  

    bank,  
    category,  
    type,  
    note:text  

};  

addAIMessage(  

    "💰 Nominalnya berapa Bestie?"  

);  

return null;

}

if(!bank){

aiContext.waiting=true;  

aiContext.field="bank";  

aiContext.transaction={  

    amount,  
    category,  
    type,  
    note:text  

};  

addAIMessage(  

    "🏦 Pakai bank apa Bestie?"  

);  

return null;

}

if(!category){

aiContext.waiting=true;  

aiContext.field="category";  

aiContext.transaction={  

    amount,  
    bank,  
    type,  
    note:text  

};  

addAIMessage(  

    "📂 Kategorinya apa Bestie?"  

);  

return null;

}

return{  

    id:Date.now()+  
    Math.random(),  

    type,  

    amount,  

    bank,  

    category,  

    note:text,  

    date:

detectSmartDate(text)

||

globalDate

};

}

function detectCategoryFromHistory(text){

const transactions =  
JSON.parse(  
    localStorage.getItem("transactions") || "[]"  
);  

if(!transactions.length)  
    return null;  

let bestCategory = null;  

let bestScore = 0;  

const words =  
text.toLowerCase()  
.split(/\s+/);  

transactions.forEach(tr=>{  

    if(!tr.note || !tr.categoryId)  
        return;  

    let score = 0;  

    tr.note  
    .toLowerCase()  
    .split(/\s+/)  
    .forEach(word=>{  

        if(words.includes(word))  
            score++;  

    });  

    if(score > bestScore){  

        bestScore = score;  

        bestCategory =  
        allCategories.find(c=>  

            c.id == tr.categoryId  

        );  

    }  

});  

if(bestScore >= 2){  

    return bestCategory;  

}  

return null;

}

function detectSmartCategory(text){

const msg =  
text.toLowerCase();  

const keyword={  

    makanan:[  
        "makan",  
        "ayam",  
        "geprek",  
        "bakso",  
        "mie",  
        "nasi",  
        "kopi",  
        "minum",  
        "teh",  
        "cafe",  
        "resto",  
        "pizza",  
        "burger"  
    ],  

    transport:[  
        "bensin",  
        "pertalite",  
        "pertamax",  
        "solar",  
        "parkir",  
        "tol",  
        "grab",  
        "gocar",  
        "gojek",  
        "ojek",  
        "taxi"  
    ],  

    belanja:[  
        "belanja",  
        "indomaret",  
        "alfamart",  
        "supermarket",  
        "sayur",  
        "buah",  
        "shopee",  
        "tokopedia",  
        "lazada"  
    ],  

    kesehatan:[  
        "obat",  
        "dokter",  
        "rumah sakit",  
        "apotek",  
        "vitamin"  
    ],  

    hiburan:[  
        "bioskop",  
        "game",  
        "steam",  
        "spotify",  
        "netflix"  
    ]  

};  

for(const key in keyword){  

    if(  

        keyword[key].some(word=>  

            msg.includes(word)  

        )  

    ){  

        const cat=  

        allCategories.find(c=>  

            c.name.toLowerCase()  

            .includes(key)  

        );  

        if(cat) return cat;  

    }  

}  

return null;

}

function detectTransactionType(text){

const msg = text.toLowerCase();  

const incomeWords=[  

    "gaji",  
    "bonus",  
    "jual",  
    "transfer masuk",  
    "cashback",  
    "hadiah",  
    "komisi",  
    "refund",  
    "pendapatan",  
    "pemasukan",  
    "dibayar",  
    "dibayar client",  
    "bayaran"  

];  

const expenseWords=[  

    "makan",  
    "minum",  
    "kopi",  
    "beli",  
    "bayar",  
    "isi bensin",  
    "parkir",  
    "belanja",  
    "traktir",  
    "topup",  
    "langganan",  
    "spotify",  
    "netflix",  
    "shopee",  
    "tokopedia"  

];  

if(  

    incomeWords.some(  

        word=>msg.includes(word)  

    )  

){  

    return "income";  

}  

if(  

    expenseWords.some(  

        word=>msg.includes(word)  

    )  

){  

    return "expense";  

}  

return "expense";

}

function detectSmartDate(text){

const msg =  
text.toLowerCase();  

const date =  
new Date();  

/*========== HARI ==========*/  

if(msg.includes("kemarin")){  

    date.setDate(  
        date.getDate()-1  
    );  

}  

const dayMatch =  
msg.match(  
    /(\d+)\s*hari\s*lalu/  
);  

if(dayMatch){  

    date.setDate(  

        date.getDate()-  

        Number(dayMatch[1])  

    );  

}  

/*========== JAM ==========*/  

const hourMatch =  
msg.match(  
    /jam\s*(\d{1,2})/  
);  

if(hourMatch){  

    date.setHours(  

        Number(hourMatch[1])  

    );  

    date.setMinutes(0);  

}  

if(msg.includes("pagi")){  

    date.setHours(8);  

}  

if(msg.includes("siang")){  

    date.setHours(13);  

}  

if(msg.includes("sore")){  

    date.setHours(16);  

}  

if(msg.includes("malam")){  

    date.setHours(20);  

}  

return date;

}

function showTransactionCard(data){

const wrapper =  
document.createElement("div");  

wrapper.className =  
"message ai ai-card-message";  

wrapper.innerHTML = `  

<div class="avatar">  

    <img src="assets/apxx-ai.png">  

</div>  

<div class="bubble ai-card-bubble">  

    <div class="ai-name">  

        Apxx AI  

    </div>  

    <div class="ai-transaction-card">  

        <div class="ai-card-title">  

            <i class="fa-solid fa-receipt"></i>  

            <span>Tambah Transaksi</span>  

        </div>  

        <div class="ai-field">  

            <label>Kategori</label>  

            <select class="ai-category">  

                <option value="">  
                Pilih kategori  
                </option>  

                ${allCategories.map(cat=>`  

                <option  

                    value="${cat.id}"  

                    ${data.category?.id==cat.id  
                    ?"selected":""}  

                >  

                    ${cat.name}  

                </option>  

                `).join("")}  

            </select>  

        </div>  

        <div class="ai-field">  

            <label>Nominal</label>  

            <input  

                class="ai-amount"  

                value="${formatRupiah(data.amount)}"  

                placeholder="Nominal"  

            >  

        </div>  

        <div class="ai-field">  

            <label>Bank</label>  

            <select class="ai-bank">  

                <option value="">  
                Pilih Bank  
                </option>  

                ${banks.map(bank=>`  

                <option  

                    value="${bank.id}"  

                    ${data.bank?.id==bank.id  
                    ?"selected":""}  

                >  

                    ${bank.name}  

                </option>  

                `).join("")}  

            </select>  

        </div>  

        <div class="ai-field">  

            <label>Tanggal</label>  

            <input  

                class="ai-date"  

                type="datetime-local"  

                value="${new Date(data.date)  
                .toISOString()  
                .slice(0,16)}"  

            >  

        </div>  

        <div class="ai-field">  

            <label>Catatan</label>  

            <textarea  

                class="ai-note"  

                rows="2"  

            >${data.note}</textarea>  

        </div>  

        <div class="ai-actions">  

            <button  
            class="ai-cancel">  

                Batal  

            </button>  

            <button  
            class="ai-save">  

                Simpan  

            </button>  

        </div>  

    </div>  

</div>  

`;  

chatContainer.appendChild(wrapper);  

scrollBottom();

lastTransactionCard = wrapper;
lastTransactionData = data;

bindTransactionCard(  
    wrapper,  
    data  
);

}

function bindTransactionCard(wrapper,data){

const amount =  
wrapper.querySelector(".ai-amount");  

const bank =  
wrapper.querySelector(".ai-bank");  

const category =  
wrapper.querySelector(".ai-category");  

const note =  
wrapper.querySelector(".ai-note");  

const date =  
wrapper.querySelector(".ai-date");  

const save =  
wrapper.querySelector(".ai-save");  

const cancel =  
wrapper.querySelector(".ai-cancel");  

/*==========================  
        NOMINAL  
==========================*/  

amount.oninput=function(){  

    const angka =  
    this.value.replace(/\D/g,"");  

    data.amount =  
    Number(angka);  

    this.value =  
    angka  
    ? Number(angka)  
    .toLocaleString("id-ID")  
    : "";  

};  

/*==========================  
        BANK  
==========================*/  

bank.onchange=function(){  

    data.bank =  
    banks.find(b=>  

        String(b.id)===this.value  

    );  

};  

/*==========================  
        CATEGORY  
==========================*/  

category.onchange=function(){  

    data.category =  
    allCategories.find(c=>  

        String(c.id)===this.value  

    );  

};  

/*==========================  
        NOTE  
==========================*/  

note.oninput=function(){  

    data.note =  
    this.value;  

};  

/*==========================  
        DATE  
==========================*/  

date.onchange=function(){  

    data.date =  
    new Date(this.value);  

};  

/*==========================  
        SAVE  
==========================*/  

save.onclick=function(){  

    if(!data.amount){  

        return addAIMessage(  
        "💰 Isi nominal dulu ya Bestie."  
        );  

    }  

    if(!data.bank){  

        return addAIMessage(  
        "🏦 Pilih bank dulu ya."  
        );  

    }  

    if(!data.category){  

        return addAIMessage(  
        "📂 Pilih kategori dulu ya."  
        );  

    }  

    saveTransactionFromAI(data);  

    wrapper.remove();  

  if(  

pendingTransactions.length===0

){

document  
.querySelector(".ai-save-all")  
?.remove();

}

};  

/*==========================  
        CANCEL  
==========================*/  

cancel.onclick=function(){  

    wrapper.remove();  

};

}

function saveTransactionFromAI(data){

/*==============================  
        AMBIL DATA  
==============================*/  

const transactions =  
JSON.parse(  

    localStorage.getItem(  
        "transactions"  
    ) || "[]"  

);  

/*==============================  
        SIMPAN  
==============================*/  

transactions.unshift({  

    id: generateId(),  

    type: data.type,  

    amount: data.amount,  

    bankId: data.bank?.id || null,  

    categoryId: data.category?.id || null,  

    note: data.note,  

    createdAt:  
    new Date(data.date)  
    .toISOString()  

});  

localStorage.setItem(  

    "transactions",  

    JSON.stringify(  
        transactions  
    )  

);  

/*==============================  
    UPDATE SALDO BANK  
==============================*/  

if(data.bank){  

    const bankIndex =  
    banks.findIndex(b=>  

        b.id===data.bank.id  

    );  

    if(bankIndex!=-1){  

        if(data.type==="income"){  

            banks[bankIndex].balance +=  
            Number(data.amount);  

        }else{  

            banks[bankIndex].balance -=  
            Number(data.amount);  

        }  

        localStorage.setItem(  

            "banks",  

            JSON.stringify(banks)  

        );  

    }  

}  

/*==============================  
    HAPUS DARI PENDING  
==============================*/  

pendingTransactions =  
pendingTransactions.filter(  

    t=>t.id!==data.id  

);  

/*==============================  
    SUCCESS  
==============================*/  

addAIMessage(`  

✅ <b>Berhasil disimpan!</b>  

<br><br>  

💰 ${formatRupiah(data.amount)}  

<br>  

🏦 ${data.bank?.name || "-"}  

<br>  

📂 ${data.category?.name || "-"}  

`);

}

function aiFollowUp(data){

const message=[];  

if(data.type=="expense"){  

    if(data.amount>=1000000){  

        message.push(  

            "💸 Wah cukup besar ya Bestie."  

        );  

    }  

    if(  

        data.category &&  

        data.category.name  

        .toLowerCase()  

        .includes("makanan")  

    ){  

        message.push(  

            "🍜 Jangan lupa jaga budget makan ya."  

        );  

    }  

}  

if(data.type=="income"){  

    message.push(  

        "🎉 Selamat atas pemasukannya!"  

    );  

}  

if(message.length){  

    addAIMessage(  

        message.join("<br><br>")  

    );  

}

aiFollowUp(data);

}

function showBalance(){

const banks = JSON.parse(  
    localStorage.getItem("banks") || "[]"  
);  

if(!banks.length){  

    return addAIMessage(  
        "Belum ada data bank Bestie 😊"  
    );  

}  

let total = 0;  

let html = `  

💳 <b>Saldo Semua Bank</b>  

<br><br>  

`;  

banks.forEach(bank=>{  

    const saldo =  
    Number(bank.balance || bank.saldo || 0);  

    total += saldo;  

    html += `  

    <b>${bank.name}</b>  

    <br>  

    Rp ${formatRupiah(saldo)}  

    <br><br>  

    `;  

});  

html += `  

<hr>  

<b>Total Saldo</b>  

<br>  

Rp ${formatRupiah(total)}  

`;  

addAIMessage(html);

}

function todayExpense(){

const transactions = JSON.parse(  

    localStorage.getItem("transactions")  

    || "[]"  

);  

const today =  
new Date().toDateString();  

const todayData =  
transactions.filter(t=>{  

    return(  

        t.type==="expense" &&  

        new Date(t.createdAt)  
        .toDateString()===today  

    );  

});  

const total =  
todayData.reduce(  

    (a,b)=>a+Number(b.amount),  

    0  

);  

addAIMessage(`  

    📉 <b>Pengeluaran Hari Ini</b>  

    <br><br>  

    Total transaksi  

    <b>${todayData.length}</b>  

    <br>  

    Total pengeluaran  

    <b>Rp ${formatRupiah(total)}</b>  

`);

}

function todayIncome(){

const transactions = JSON.parse(  

    localStorage.getItem("transactions")  

    || "[]"  

);  

const today =  
new Date().toDateString();  

const todayData =  
transactions.filter(t=>{  

    return(  

        t.type==="income" &&  

        new Date(t.createdAt)  
        .toDateString()===today  

    );  

});  

const total =  
todayData.reduce(  

    (a,b)=>a+Number(b.amount),  

    0  

);  

addAIMessage(`  

    📈 <b>Pemasukan Hari Ini</b>  

    <br><br>  

    Total transaksi  

    <b>${todayData.length}</b>  

    <br>  

    Total pemasukan  

    <b>Rp ${formatRupiah(total)}</b>  

`);

}

function monthInsight(){

const transactions = JSON.parse(  

    localStorage.getItem("transactions")  

    || "[]"  

);  

const now = new Date();  

const month = now.getMonth();  

const year = now.getFullYear();  

const data = transactions.filter(t=>{  

    const d = new Date(t.createdAt);  

    return(  

        d.getMonth()==month &&  

        d.getFullYear()==year  

    );  

});  

if(!data.length){  

    return addAIMessage(  

        "📊 Belum ada transaksi bulan ini Bestie."  

    );  

}  

let income = 0;  

let expense = 0;  

const categoryMap = {};  

data.forEach(t=>{  

    if(t.type=="income"){  

        income += Number(t.amount);  

    }else{  

        expense += Number(t.amount);  

    }  

    if(!categoryMap[t.categoryId]){  

        categoryMap[t.categoryId]=0;  

    }  

    categoryMap[t.categoryId]+=  

    Number(t.amount);  

});  

let topCategory = null;  

let topValue = 0;  

Object.keys(categoryMap).forEach(id=>{  

    if(categoryMap[id]>topValue){  

        topValue = categoryMap[id];  

        topCategory =  

        allCategories.find(c=>  

            String(c.id)==String(id)  

        );  

    }  

});  

const saving = income-expense;

let advice = [];

if(expense > income){

advice.push(  
    "⚠ Pengeluaran lebih besar daripada pemasukan bulan ini."  
);

}

if(saving > 0){

advice.push(  
    "🎉 Keuangan kamu masih surplus. Pertahankan ya!"  
);

}

if(topCategory){

const persen =  

Math.round(  

    (topValue /  

    Math.max(expense,1))  

    *100  

);  

advice.push(  

    `📌 Pengeluaran terbesar ada di kategori <b>${topCategory.name}</b> (${persen}%).`  

);  

if(persen >= 40){  

    advice.push(  

        "💡 Coba kurangi pengeluaran pada kategori tersebut agar tabungan lebih cepat bertambah."  

    );  

}

}

if(expense==0){

advice.push(  

    "🥳 Belum ada pengeluaran bulan ini."  

);

}

if(income==0){

advice.push(  

    "💼 Belum ada pemasukan yang tercatat bulan ini."  

);

}

addAIMessage(`

📊 <b>Insight Bulan Ini</b>

<br><br>

💰 Pemasukan

<b>Rp ${formatRupiah(income)}</b>

<br><br>

💸 Pengeluaran

<b>Rp ${formatRupiah(expense)}</b>

<br><br>

💵 Selisih

<b>Rp ${formatRupiah(saving)}</b>

<br><br>

🏆 Kategori terbesar

<b>${topCategory?.name || "-"}</b>

(Rp ${formatRupiah(topValue)})

<br><br>

<hr>  <br>  ${advice.join("<br><br>")}

`);

if(expense > income * 1.5){

addAIMessage(  

    "🚨 Pengeluaranmu sudah jauh melebihi pemasukan bulan ini."  

);

}
else if(expense > income){

addAIMessage(  

    "⚠ Sebaiknya mulai mengurangi pengeluaran agar tetap surplus."  

);

}
else{

addAIMessage(  

    "✅ Kondisi keuanganmu masih sehat bulan ini."  

);

}

}

function showPeriodReport(period, msg){

    const transactions = JSON.parse(
        localStorage.getItem("transactions") || "[]"
    );

    const now = new Date();

    let start = new Date(now);

    if(period=="today"){
        start.setHours(0,0,0,0);
    }

    if(period=="week"){
        start.setDate(now.getDate()-6);
        start.setHours(0,0,0,0);
    }

    if(period=="month"){
        start = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );
    }

    const isIncome = msg.includes("pemasukan");
    const isExpense = msg.includes("pengeluaran");

    let data = transactions.filter(t=>{

        const d = new Date(t.createdAt);

        return d >= start;

    });

    if(isIncome){
        data = data.filter(t=>t.type=="income");
    }

    if(isExpense){
        data = data.filter(t=>t.type=="expense");
    }

    if(!data.length){

        return addAIMessage(
            "Belum ada transaksi pada periode tersebut 😊"
        );

    }

    let total = 0;

    let html = "";

    data.forEach(t=>{

        total += Number(t.amount);

        const bank = banks.find(
            b=>b.id==t.bankId
        );

        html += `

💰 Rp ${formatRupiah(t.amount)}

<br>

🏦 ${bank?.name || "-"}

<br>

📝 ${t.note}

<br><br>

`;

    });

    let title = "";

    if(period=="today"){
        title = "Hari Ini";
    }

    if(period=="week"){
        title = "7 Hari Terakhir";
    }

    if(period=="month"){
        title = "Bulan Ini";
    }

    let judul = "Semua Transaksi";

    if(isIncome){
        judul = "Pemasukan";
    }

    if(isExpense){
        judul = "Pengeluaran";
    }

    addAIMessage(`

📊 <b>${judul} ${title}</b>

<br><br>

Jumlah transaksi

<b>${data.length}</b>

<br>

Total

<b>Rp ${formatRupiah(total)}</b>

<br><br>

<hr>

<br>

${html}

`);

}
