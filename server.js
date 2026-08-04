require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

function auth(req, res, next){

    const token = req.headers.authorization;

    if(!token){

        return res.status(401).json({
            success:false,
            message:"Token tidak ada."
        });

    }

    try{

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.id;

        next();

    }catch{

        return res.status(401).json({
            success:false,
            message:"Token tidak valid."
        });

    }

}

const cors = require("cors");

const User = require("./models/User");

const bot = new TelegramBot(
    process.env.BOT_TOKEN,
    {
        polling: true
    }
);

const pendingRequests = {};

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* ===========================
   CONNECT MONGODB
=========================== */

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("✅ MongoDB Connected");
})
.catch(err => {
    console.log(err);
});

/* ===========================
   HOME
=========================== */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "chat.html"));
});

/* ===========================
   REGISTER
=========================== */

app.post("/register", async (req, res) => {

    try {

        const {
            name,
            username,
            password
        } = req.body;

        if (!name || !username || !password) {

            return res.json({
                success: false,
                message: "Data belum lengkap."
            });

        }

        const exist = await User.findOne({
            username: username.toLowerCase()
        });

        if (exist) {

            return res.json({
                success: false,
                message: "Username sudah digunakan."
            });

        }

        const hash = await bcrypt.hash(password, 10);

        const user = new User({

            name,

            username: username.toLowerCase(),

            password: hash,

            banks: [

                {
                    id: Date.now(),
                    name: "Cash",
                    balance: 0,
                    startOfDay: 0
                },

                {
                    id: Date.now() + 1,
                    name: "Jago",
                    balance: 0,
                    startOfDay: 0
                }

            ],

            transactions: [],

            categories: {

                income: [

                    {
                        id: Date.now() + 2,
                        name: "Gaji",
                        icon: "fa-solid fa-wallet"
                    },

                    {
                        id: Date.now() + 3,
                        name: "Tarik Tunai",
                        icon: "fa-solid fa-money-bill-wave"
                    }

                ],

                expense: [

                    {
                        id: Date.now() + 4,
                        name: "Makan",
                        icon: "fa-solid fa-utensils"
                    },

                    {
                        id: Date.now() + 5,
                        name: "Belanja",
                        icon: "fa-solid fa-cart-shopping"
                    }

                ]

            }

        });

        await user.save();

        res.json({

            success: true,

            message: "Register berhasil."

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

/* ===========================
   LOGIN
=========================== */

app.post("/login", async (req, res) => {

    try {

        const {

            username,

            password

        } = req.body;

        const user = await User.findOne({

            username: username.toLowerCase()

        });

        if (!user) {

            return res.json({

                success: false,

                message: "Username tidak ditemukan."

            });

        }

        const match = await bcrypt.compare(

            password,

            user.password

        );

        if (!match) {

            return res.json({

                success: false,

                message: "Password salah."

            });

        }

        const token = jwt.sign(

            {

                id: user._id

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "30d"

            }

        );

        res.json({

            success: true,

            token,

            user

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

app.get("/me", auth, async(req,res)=>{

    try{

        const user = await User.findById(req.userId);

        if(!user){

            return res.json({
                success:false
            });

        }

        res.json({
            success:true,
            user
        });

    }catch(err){

        res.status(500).json({
            success:false,
            message:err.message
        });

    }

});

app.post("/save", auth, async(req,res)=>{

    try{

        const {

            banks,

            transactions,

            categories

        } = req.body;

        await User.findByIdAndUpdate(

            req.userId,

            {

                banks,

                transactions,

                categories

            }

        );

        res.json({

            success:true,

            message:"Data berhasil disimpan."

        });

    }catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

/* ===========================
   BUY TOKEN
=========================== */

app.post("/buy-token", async (req, res) => {

    try{

        const requestId =
        Math.random()
        .toString(36)
        .substring(2,8)
        .toUpperCase();

        pendingRequests[requestId] = {

    approved:false,

    token:Math.random()
    .toString(36)
    .substring(2,12)
    .toUpperCase()

};

        const waktu = new Date().toLocaleString("id-ID",{

            day:"2-digit",
            month:"long",
            year:"numeric",
            hour:"2-digit",
            minute:"2-digit"

        });

        await bot.sendMessage(

            process.env.CHAT_ID,

`📩 APXX Wallet
━━━━━━━━━━━━━━
🟠 Permintaan Token Baru

ID : ${requestId}
Waktu : ${waktu}
━━━━━━━━━━━━━━`

        );

        res.json({

            success:true,

            requestId

        });

    }catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

app.post("/payment-confirm", async (req,res)=>{

    try{

        const {

            requestId,

            bank,

            name

        } = req.body;

        if(!pendingRequests[requestId]){

    return res.json({

        success:false,

        message:"Request tidak ditemukan."

    });

}

pendingRequests[requestId].bank = bank;

pendingRequests[requestId].name = name;

        await bot.sendMessage(

            process.env.CHAT_ID,

`💳 APXX Wallet
━━━━━━━━━━━━━━
Konfirmasi Pembayaran

ID : ${requestId}

Bank :
${bank}

Atas Nama :
${name}

━━━━━━━━━━━━━━`,

            {

                reply_markup:{

                    inline_keyboard:[

                        [

                            {

                                text:"✅ Berikan Akses",

                                callback_data:
                                "approve_"+requestId

                            }

                        ],

                        [

                            {

                                text:"❌ Tolak",

                                callback_data:
                                "reject_"+requestId

                            }

                        ]

                    ]

                }

            }

        );

        res.json({

            success:true

        });

    }catch(err){

        console.log(err);

        res.json({

            success:false

        });

    }

});

/* ===========================
   TELEGRAM CALLBACK
=========================== */

bot.on("callback_query", async (query)=>{

    const data = query.data;

    if(data.startsWith("approve_")){

        const requestId = data.replace("approve_","");

        if(!pendingRequests[requestId]){

            return bot.answerCallbackQuery(
                query.id,
                {
                    text:"Request tidak ditemukan."
                }
            );

        }

        pendingRequests[requestId].approved = true;

        await bot.editMessageReplyMarkup(

            { inline_keyboard:[] },

            {

                chat_id:query.message.chat.id,

                message_id:query.message.message_id

            }

        );

        await bot.sendMessage(

            query.message.chat.id,

`✅ Token berhasil disetujui

ID : ${requestId}`

        );

        return bot.answerCallbackQuery(

            query.id,

            {

                text:"Berhasil."

            }

        );

    }

    if(data.startsWith("reject_")){

        const requestId = data.replace("reject_","");

        delete pendingRequests[requestId];

        await bot.editMessageReplyMarkup(

            { inline_keyboard:[] },

            {

                chat_id:query.message.chat.id,

                message_id:query.message.message_id

            }

        );

        await bot.sendMessage(

            query.message.chat.id,

`❌ Permintaan ditolak

ID : ${requestId}`

        );

        return bot.answerCallbackQuery(

            query.id,

            {

                text:"Ditolak."

            }

        );

    }

});

/* ===========================
   CHECK REGISTER
=========================== */

app.get("/check-register",(req,res)=>{

    const requestId = req.query.requestId;

    const request = pendingRequests[requestId];

    if(!request){

        return res.json({
            success:false
        });

    }

    if(!request.approved){

        return res.json({
            success:false
        });

    }

    res.json({

        success:true,

        token:request.token

    });

    delete pendingRequests[requestId];

});

/* ===========================
   START SERVER
=========================== */

app.listen(process.env.PORT || 3000, () => {

    console.log("🚀 Server Running");

});
