const banks = JSON.parse(
localStorage.getItem("banks") || "[]"
);

const categories = JSON.parse(
localStorage.getItem("categories") || "{}"
);

const allCategories = [

...(categories.income || []),

...(categories.expense || [])

];

let pendingTransaction = {

type:null,

amount:null,

bank:null,

category:null,

note:null,

date:new Date()

};

let pendingTransactions = [];

/*======================================
            ELEMENT
======================================*/

const chatContainer =
document.getElementById("chatContainer");

const input =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

const backBtn =
document.getElementById("backBtn");

/*======================================
            BACK
======================================*/

backBtn.onclick=()=>{

history.back();

};

/*======================================
            MESSAGE
======================================*/

function addUserMessage(text){

const time=new Date().toLocaleTimeString("id-ID",{
hour:"2-digit",
minute:"2-digit"
});

const wrapper=document.createElement("div");

wrapper.className="message user";

wrapper.innerHTML=`

<div class="bubble">

${text}

<div class="message-time">
${time}
</div>

</div>

`;

chatContainer.appendChild(wrapper);

scrollBottom();

}

function addAIMessage(text){

const time=new Date().toLocaleTimeString("id-ID",{
hour:"2-digit",
minute:"2-digit"
});

const wrapper=document.createElement("div");

wrapper.className="message ai";

wrapper.innerHTML=`

<div class="avatar">

<img src="assets/apxx-ai.png">

</div>

<div class="bubble">

<div class="ai-name">
Apxx AI
</div>

${text}

<div class="message-time">
${time}
</div>

</div>

`;

chatContainer.appendChild(wrapper);

scrollBottom();

}

/*======================================
            TYPING
======================================*/

let typingBox=null;

function showTyping(){

typingBox=document.createElement("div");

typingBox.className="message ai";

typingBox.innerHTML=`

<div class="avatar">

<img src="assets/apxx-ai.png">

</div>

<div class="typing">

<span></span>

<span></span>

<span></span>

</div>

`;

chatContainer.appendChild(typingBox);

scrollBottom();

}

function hideTyping(){

if(typingBox){

typingBox.remove();

typingBox=null;

}

}

/*======================================
        QUICK QUESTION
======================================*/

function addSuggestion(){

const wrap=document.createElement("div");

wrap.className="quick-question";

wrap.innerHTML=`

<button>Makan ayam geprek 20rb Cash</button>

<button>Gaji 5 juta BCA</button>

<button>Pengeluaran hari ini</button>

<button>Saldo semua bank</button>

<button>Insight bulan ini</button>

`;


chatContainer.appendChild(wrap);

wrap.querySelectorAll("button").forEach(btn=>{

btn.onclick=()=>{

input.value=btn.innerText;

input.focus();

};

});

scrollBottom();

}

/*======================================
        FIRST MESSAGE
======================================*/

window.onload=()=>{

showTyping();

setTimeout(()=>{

hideTyping();

addAIMessage(`

Halo Bestie! 👋😊

<br><br>

Aku <b>Apxx AI</b>, teman finansialmu.

Aku bisa membantu mencatat transaksi hanya dari chat biasa.

`);

addSuggestion();

},1800);

};

/*======================================
            SEND
======================================*/

function sendMessage(){

const text=input.value.trim();

if(text=="") return;

addUserMessage(text);

input.value="";

showTyping();

setTimeout(()=>{

hideTyping();

processMessage(text);

},1200);

}

sendBtn.onclick=sendMessage;

input.onkeydown=e=>{

if(e.key==="Enter"){

sendMessage();

}

};

/*======================================
        SCROLL
======================================*/

function scrollBottom(){

chatContainer.scrollTop=

chatContainer.scrollHeight;

}

function processMessage(text){

if(

data.amount &&
!data.bank

){

const bank=banks.find(b=>

b.name.toLowerCase()==

text.toLowerCase()

);

if(bank){

data.bank=bank;

showTransactionCard();

return;

}

}

if(

data.amount &&

data.bank &&

!data.category

){

const category=allCategories.find(c=>

c.name.toLowerCase()==

text.toLowerCase()

);

if(category){

data.category=category;

showTransactionCard();

return;

}

}

const msg=text.toLowerCase();

if(
msg.includes("hari ini") &&
msg.includes("pengeluaran")
){

return todayExpense();

}

if(
msg.includes("hari ini") &&
msg.includes("pemasukan")
){

return todayIncome();

}

if(
msg.includes("saldo")
){

return showBalance();

}

parseTransactions(text);

}

function detectCategoryFromHistory(text){

const transactions=JSON.parse(

localStorage.getItem("transactions")||"[]"

);

let bestCategory=null;

let bestScore=0;

transactions.forEach(tr=>{

if(!tr.note||!tr.categoryId)return;

let score=0;

const oldWords=
tr.note.toLowerCase().split(/\s+/);

const newWords=
text.toLowerCase().split(/\s+/);

oldWords.forEach(word=>{

if(

newWords.includes(word)

){

score++;

}

});

if(score>bestScore){

bestScore=score;

bestCategory=

allCategories.find(c=>

c.id==tr.categoryId

);

}

});

return bestCategory;

}

function parseTransactions(text){

const lines=text

.split(/\n|,|terus|lalu|kemudian|dan/i)

.map(i=>i.trim())

.filter(i=>i);

pendingTransactions = [];

lines.forEach(line=>{

parseTransaction(line);

});

}

function parseTransaction(text){

const bankList = banks;

const categoryList = allCategories;

let amount=0;

const amountMatch=text.match(
/(\d+[.,]?\d*)\s*(jt|juta|rb|ribu)?/i
);

if(amountMatch){

amount=parseFloat(amountMatch[1]);

if(amountMatch[2]){

const s=amountMatch[2].toLowerCase();

if(s=="jt"||s=="juta"){

amount*=1000000;

}

if(s=="rb"||s=="ribu"){

amount*=1000;

}

}

}

let bank = bankList.find(item=>
text.toLowerCase().includes(
item.name.toLowerCase()
));
  
let category = detectCategoryFromHistory(text);

if(!category){

category = categoryList.find(item=>

text.toLowerCase().includes(

item.name.toLowerCase()

)

);

}

let type="expense";

if(
text.match(
/gaji|bonus|masuk|income|pemasukan|jual/i
)
){

type="income";

}

const transaction={

type,

amount,

bank,

category,

note:text,

date:new Date()

};

pendingTransactions.push(transaction);

showTransactionCard(transaction);

pendingTransaction = {

type,

amount,

bank,

category,

note:text,

date:new Date()

};

}

function showTransactionCard(data){

const wrapper = document.createElement("div");

wrapper.className = "message ai";

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

<select id="aiCategory">

<option value="">Pilih Kategori</option>

${allCategories.map(cat=>`

<option

value="${cat.id}"

${data.category?.id==cat.id?"selected":""}

>

${cat.name}

</option>

`).join("")}

</select>

</div>

<div class="ai-field">

<label>Nominal</label>

<input

id="aiAmount"

type="text"

value="${
data.amount
? Number(data.amount).toLocaleString("id-ID")
: ""
}"

>

</div>

<div class="ai-field">

<label>Bank</label>

<select id="aiBank">

<option value="">Pilih Bank</option>

${banks.map(bank=>`

<option

value="${bank.id}"

${data.bank?.id==bank.id?"selected":""}

>

${bank.name}

</option>

`).join("")}

</select>

</div>

<div class="ai-field">

<label>Tanggal</label>

<input

id="aiDate"

type="datetime-local"

value="${new Date().toISOString().slice(0,16)}"

>

</div>

<div class="ai-field">

<label>Catatan</label>

<textarea

id="aiNote"

rows="2"

>${data.note||""}</textarea>

</div>

<div class="ai-actions">

${
pendingTransactions.length>1
?
`<button class="ai-save-all">
Simpan Semua
</button>`
:
""
}

<button class="ai-cancel">
Batal
</button>

<button class="ai-save">
Simpan
</button>

</div>

</div>

</div>

</div>

`;

// Hapus card lama kalau masih ada
  
wrapper.classList.add("ai-card-message");

chatContainer.appendChild(wrapper);

scrollBottom();

bindTransactionCard(wrapper,data);

}

function bindTransactionCard(wrapper,data){

const amount =
wrapper.querySelector("#aiAmount");

const bank =
wrapper.querySelector("#aiBank");

const category =
wrapper.querySelector("#aiCategory");

const note =
wrapper.querySelector("#aiNote");

const save =
wrapper.querySelector(".ai-save");

const cancel =
wrapper.querySelector(".ai-cancel");

const saveAll =
wrapper.querySelector(".ai-save-all");

if(saveAll){

saveAll.onclick=function(){

pendingTransactions.forEach(item=>{

saveTransactionFromAI(item);

});

pendingTransactions=[];

document
.querySelectorAll(".ai-card-message")
.forEach(card=>card.remove());

addAIMessage(
"✅ Sip bestie!, semua transaksi berhasil disimpan."
);

};

}

amount.oninput=function(){

const angka=this.value.replace(/\D/g,"");

this.value=angka
?Number(angka).toLocaleString("id-ID")
:"";

data.amount=
Number(angka);

};

bank.onchange=function(){

data.bank=

banks.find(b=>b.id==this.value);

};

category.onchange=function(){

data.category=

allCategories.find(c=>c.id==this.value);

};

note.oninput=function(){

data.note=this.value;

};

save.onclick=function(){

saveTransactionFromAI(
data
);

wrapper.remove();

};

}

function saveTransactionFromAI(data){

const transactions=JSON.parse(

localStorage.getItem("transactions")||"[]"

);

transactions.unshift({

id:Date.now(),

type:data.type,

amount:data.amount,

bankId:data.bank?.id,

categoryId:data.category?.id,

note:data.note,

createdAt:new Date().toISOString()

});

localStorage.setItem(

"transactions",

JSON.stringify(transactions)

);

pendingTransaction={

type:null,

amount:null,

bank:null,

category:null,

note:null,

date:new Date()

};

addAIMessage(

"✅ Sip Bestie! Transaksi berhasil disimpan."

);

}
