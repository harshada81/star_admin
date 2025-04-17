var express = require("express");
// var mysql = require('mysql2');
var nodemailer = require('nodemailer');
var bodyparser = require("body-parser");
var upload = require("express-fileupload");
var session = require("express-session");

var admin_routes = require("./routes/admin");
var user_routes = require("./routes/user");


var app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(upload());
app.use(session({
    secret:"a2zithub",
    saveUninitialized:true,
    resave:true
}));


// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // true for port 465, false for other ports
//   auth: {
//     user: "harshadakedare81gmail.com",
//     pass: "jn7jnAPss4f63QBp6D",
//   },
// });

// // async..await is not allowed in global scope, must use a wrapper
// async function main() {
//   // send mail with defined transport object
//   const info = await transporter.sendMail({
//     from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
//     to: "bar@example.com, baz@example.com", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>", // html body
//   });

//   console.log("Message sent: %s", info.messageId);
//   // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
// }

// main().catch(console.error);

app.use(express.static("public/"));

app.use("/admin",admin_routes);
app.use("/",user_routes);
 

app.listen(3000);

 