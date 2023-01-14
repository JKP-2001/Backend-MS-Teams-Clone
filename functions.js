import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import path from "path";
import fs from "fs"

const __dirname = path.resolve();


function getDate() {
    var date = new Date();
    date.toISOString();
    return date;
}



const sendVerifyEmail = (receiver, subject, name, link) => {
    const filePath = path.join(__dirname, 'Emails/verifyuser.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        username: name,
        link:link
    };
    const htmlToSend = template(replacements);

    var transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // setup e-mail data, even with unicode symbols
    var mailOptions = {
        from: `"Teams Org " ${process.env.EMAIL}`, // sender address (who sends)
        to: receiver, // list of receivers (who receives)
        subject: subject, // Subject line
        html: htmlToSend // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        try {
            if (error) {
                throw error;
            }

            console.log('Message sent: ' + info.response);
        } catch (err) {
            console.log(err.toString());
        }
        // console.log('Message sent')
    });

}

const sendResetPasswordEmail = (receiver, subject, name, email, link) => {
    const filePath = path.join(__dirname, 'Emails/resetPassword.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        username: name,
        link:link,
        email:email
    };
    const htmlToSend = template(replacements);

    var transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // setup e-mail data, even with unicode symbols
    var mailOptions = {
        from: `"Teams Org " ${process.env.EMAIL}`, // sender address (who sends)
        to: receiver, // list of receivers (who receives)
        subject: subject, // Subject line
        html: htmlToSend // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        try {
            if (error) {
                throw error;
            }

            console.log('Message sent: ' + info.response);
        } catch (err) {
            console.log(err.toString());
        }
        // console.log('Message sent')
    });

}

const sendEmail = (receiver, subject, text, htmlBody) => {
    var transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // setup e-mail data, even with unicode symbols
    var mailOptions = {
        from: `"Teams Org " ${process.env.EMAIL}`, // sender address (who sends)
        to: receiver, // list of receivers (who receives)
        subject: subject, // Subject line
        text: text, // plaintext body
        html: htmlBody // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        try {
            if (error) {
                throw error;
            }

            console.log('Message sent: ' + info.response);
        } catch (err) {
            console.log(err.toString());
        }
        // console.log('Message sent')
    });
}

const sendOtp = (receiver, subject, name, otp) => {
    const filePath = path.join(__dirname, 'Emails/otp.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        username: name,
        otp:otp
    };
    const htmlToSend = template(replacements);

    var transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // setup e-mail data, even with unicode symbols
    var mailOptions = {
        from: `"Teams Org " ${process.env.EMAIL}`, // sender address (who sends)
        to: receiver, // list of receivers (who receives)
        subject: subject, // Subject line
        html: htmlToSend // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        try {
            if (error) {
                throw error;
            }

            console.log('Message sent: ' + info.response);
        } catch (err) {
            console.log(err.toString());
        }
        // console.log('Message sent')
    });

}

function generateAndSendOTP(email, name) {
    var x = '';
    for (var i = 0; i < 6; i++) { x += Math.floor(Math.random() * 10); }

    const subject = "Login OTP for Teams"
    sendOtp(email,subject,name,x);
    console.log("OTP email sent");
    return x;
}


const generateGrpCode = () => {
    var x = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < 10; i++) { x += characters.charAt(Math.floor(Math.random() * charactersLength)); }
    return x;
}



export { getDate, sendEmail, generateAndSendOTP, generateGrpCode, sendVerifyEmail, sendResetPasswordEmail, sendOtp }











