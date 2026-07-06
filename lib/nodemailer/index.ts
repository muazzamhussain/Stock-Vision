import nodemailer from "nodemailer";
import {WELCOME_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: Number(process.env.NODEMAILER_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
    debug: true,
    logger: true,
});

transporter.verify((error) => {
    if (error) {
        console.error("SMTP Connection Error:", error);
    } else {
        console.log("✅ SMTP Server is ready to send emails");
    }
});

export const sendWelcomeEmail = async ({email, name, intro}: WelcomeEmailData) => {
    const htmlEmailTemplate = WELCOME_EMAIL_TEMPLATE
        .replace("{{name}}", name)
        .replace("{{intro}}", intro);

    const mailOptions = {
        from: `"Stock Vision" <muazzam@stockvision.ai>`,
        to: email,
        subject: "Welcome to Stock Vision - Your stock market toolkit is ready",
        text: "Thanks for joining Stock Vision",
        html: htmlEmailTemplate,
    };

    await transporter.sendMail(mailOptions);
};