require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

const app = express();

app.use(cors());
app.use(express.json());

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
    res.json({
        success: true,
        message: "Orange Finance API"
    });
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
   START SERVER
=========================== */

app.listen(process.env.PORT || 3000, () => {

    console.log("🚀 Server Running");

});
