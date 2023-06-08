const express = require('express');
const { userModel } = require('../Model/user.Model');
const { sendmail } = require("./generateotp.js")
const bcrypt = require('bcrypt');
const sessionStorage = require('sessionstorage');
const jwt = require('jsonwebtoken');

const userRouter = express.Router();


userRouter.post('/signup', async (req, res) => {

    try {
        let { email, username, password } = req.body;

        let user = await userModel.find({ email: email });
        if (user.length) {
            return res.status(401).json({ message: "User already exists" })
        }

        let pass = await bcrypt.hash(password, 10);
        password = pass;

        let otp = Math.floor(Math.random() * 1000000);

        sessionStorage.setItem("otp", email + otp);
        sendmail(email, otp)

        let newuser = new userModel({ username, email, password });
        await newuser.save();
        res.status(201).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
})


userRouter.post('/verify', async (req, res) => {

    try {
        let { email, otp } = req.body;
        let storedotp = sessionStorage.getItem("otp");
        if (storedotp == email + otp) {
            let user = await userModel.findOneAndUpdate({ email: email }, { verified: true });
            res.status(200).json({ message: "User verified successfully" });
        } else {
            res.status(401).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(500).json({ message: "something went wrong" });
    }

})


userRouter.post('/login', async (req, res) => {

    try {
        let { email, password } = req.body;

        let user = await userModel.find({ email: email });
        if (user.length && user[0].verified) {
            let isMatch = await bcrypt.compare(password, user[0].password);
            if (isMatch) {
                let token = jwt.sign({ id: user[0]._id }, process.env.JWT_SECRET_KEY);
                res.status(200).json({ message: "User logged in successfully", token,user:user[0] });
            } else {
                res.status(401).json({ message: "Invalid Credentials" });
            }
        }else{
            res.status(401).json({ message: "User not verified" });
        }

    } catch (error) {
        res.status(500).json({ message: "something went wrong" });
    }
})

module.exports = { userRouter }