// scripts/test-email.mjs
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// ─── 1. Validate ENV ────────────────────────────────────────────────
const validateEnv = () => {
    const required = {
        EMAIL_USER: process.env.NODEMAILER_EMAIL,
        EMAIL_PASS: process.env.NODEMAILER_PASSWORD,
    };

    console.log("\n📋 ENV CHECK:");
    console.log("─────────────────────────────");

    let hasError = false;

    for (const [key, value] of Object.entries(required)) {
        if (!value) {
            console.log(`❌ ${key}: MISSING`);
            hasError = true;
        } else if (key === "EMAIL_PASS") {
            console.log(`✅ ${key}: ${"*".repeat(value.length)} (SET)`);
        } else {
            console.log(`✅ ${key}: ${value}`);
        }
    }

    console.log("─────────────────────────────\n");

    if (hasError) {
        throw new Error("Missing required environment variables. Check .env.local");
    }

    return {
        user: required.EMAIL_USER,
        pass: required.EMAIL_PASS,
    };
};

// ─── 2. Create Transporter ──────────────────────────────────────────
const createTransporter = (config) => {
    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
            user: config.user,
            pass: config.pass,
        },
        debug: true,
        logger: true,
    });
};

// ─── 3. Test Connection ─────────────────────────────────────────────
const testConnection = async (transporter) => {
    console.log("🔌 Testing SMTP connection...\n");
    try {
        await transporter.verify();
        console.log("\n✅ SMTP connection successful!\n");
        return true;
    } catch (error) {
        console.error("\n❌ SMTP connection failed:");
        console.error(error);
        return false;
    }
};

// ─── 4. Send Test Email ─────────────────────────────────────────────
const sendTestEmail = async (transporter, from, to) => {
    console.log(`📨 Sending test email to: ${to}\n`);

    const info = await transporter.sendMail({
        from: `"StockVision Test" <${from}>`,
        to,
        subject: "✅ StockVision - Email Test",
        text: "This is a plain text test email from StockVision.",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #22c55e;">✅ Email Test Successful!</h1>
                <p>Your Nodemailer config is working correctly.</p>
                
                <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0;">Config Used:</h3>
                    <code>HOST: ${process.env.EMAIL_HOST}</code><br/>
                    <code>PORT: ${process.env.EMAIL_PORT}</code><br/>
                    <code>USER: ${process.env.EMAIL_USER}</code>
                </div>

                <p style="color: #666; font-size: 14px;">
                    Sent at: ${new Date().toISOString()}
                </p>
            </div>
        `,
    });

    return info;
};

// ─── 5. Run All Tests ───────────────────────────────────────────────
const runTests = async () => {
    console.log("\n🚀 STOCKVISION EMAIL TEST");
    console.log("═════════════════════════════\n");

    try {
        // Step 1: Validate ENV
        const config = validateEnv();

        // Step 2: Create transporter
        const transporter = createTransporter(config);

        // Step 3: Test connection
        const connected = await testConnection(transporter);
        if (!connected) {
            process.exit(1);
        }

        // Step 4: Send test email (sends to yourself by default)
        const TEST_RECIPIENT = config.user;
        const info = await sendTestEmail(transporter, config.user, TEST_RECIPIENT);

        // Step 5: Results
        console.log("\n📊 TEST RESULTS:");
        console.log("─────────────────────────────");
        console.log(`✅ Status   : Email sent successfully`);
        console.log(`📨 Message  : ${info.messageId}`);
        console.log(`📬 Accepted : ${info.accepted.join(", ")}`);
        console.log(`❌ Rejected : ${info.rejected.join(", ") || "none"}`);
        console.log(`📋 Response : ${info.response}`);
        console.log("─────────────────────────────\n");

        console.log("🎉 All tests passed!\n");
        process.exit(0);
    } catch (error) {
        console.error("\n💥 TEST FAILED:");
        console.error("─────────────────────────────");
        console.error(error);
        console.error("─────────────────────────────\n");

        // Common error hints
        if (error.message.includes("Missing credentials")) {
            console.log("💡 Hint: Check EMAIL_USER and EMAIL_PASS in .env.local");
        } else if (error.message.includes("ECONNREFUSED")) {
            console.log("💡 Hint: Check EMAIL_HOST and EMAIL_PORT");
        } else if (error.message.includes("Invalid login")) {
            console.log("💡 Hint: Use Gmail App Password, not your real password");
            console.log("   → myaccount.google.com → Security → App Passwords");
        } else if (error.message.includes("self signed certificate")) {
            console.log("💡 Hint: Add { tls: { rejectUnauthorized: false } } to config");
        }

        process.exit(1);
    }
};

runTests();