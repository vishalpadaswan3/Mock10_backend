require("dotenv").config();
const express = require("express");
const sgMail = require("@sendgrid/mail");





function sendmail(email, otp) {
    sgMail.setApiKey(process.env.SG_API_KEY);

    const messages = [
        {
            to: `${email}`,
            from: "vishalpadaswan2@gmail.com",
            subject: "OTP for verification",
            html: `
        <strong>
           <h2>From: owner of chatsapp</h2>
           <h2> Email: ${email}</h2>
           <p>verify your email once<p>
            <h1>OTP: ${otp}</h1>
        </strong>`,
        },
    ];
    sgMail.send(messages).then((success, error) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent");
        }
    });

    return otp;
}

module.exports = { sendmail }