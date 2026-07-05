import nodemailer from "nodemailer";
import {WELCOME_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAIL_PASS,
    },
    debug: true,
    logger: true,
});

export const sendWelcomeEmail = async ({email, name, intro}: WelcomeEmailData) => {
    const htmlEmailTemplate = WELCOME_EMAIL_TEMPLATE.replace('{{name}}', name).replace('{{intro}}', intro);

    const mailOptions = {
        from: `"Stock Vision" <stockvision.com`,
        to: email,
        subject: "Welcome to Stock Vision - Your stock market toolkit is ready",
        text: "Thanks for joining stock vision",
        html: htmlEmailTemplate
    }

    await transporter.sendMail(mailOptions);
}