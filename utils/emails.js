const nodemailer = require('nodemailer');
const sendemail = async options => {
    //three steps we have to follow to use nodemailer.
    //create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,       //save in config.env
            pass:process.env.EMAIL_PASSWORD
        }
    })

    //define the email options
    const mailoptions = {
        from: 'santhosh ',
        to: options.email,
        subject: options.subject,
        text:options.message
    }
    //actually send mail
    await transporter.sendMail(mailoptions)
}
module.exports = sendemail;