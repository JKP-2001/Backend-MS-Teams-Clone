import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";


function getDate() {
    var date = new Date();
    date.toISOString();
    return date;
}


const sendEmail = (receiver, subject, text) => {
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
        // html: htmlBody // html body
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
    const text = `Hello ${name},\n\nUse the following OTP to Login procedures. OTP is valid for 5 minutes.\n\n${x}\n\nThank You\nTeam Org.`

    const subject = "Confirm your account on Teams"

    sendEmail(email, subject, text);
    console.log("OTP email sent");

    return x;
}

export { getDate, sendEmail, generateAndSendOTP }