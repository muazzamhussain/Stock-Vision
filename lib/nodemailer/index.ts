import nodemailer from "nodemailer";
import {
  WELCOME_EMAIL_TEMPLATE,
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  PRICE_ALERT_EMAIL_TEMPLATE,
  RESET_PASSWORD_EMAIL_TEMPLATE,
} from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL!,
    pass: process.env.NODEMAILER_PASSWORD!,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
  unsubscribeToken,
}: WelcomeEmailData & { unsubscribeToken: string }) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${unsubscribeToken}`;

  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name)
    .replace("{{intro}}", intro)
    .replace("{{appUrl}}", appUrl!)
    .replace("{{unsubscribeUrl}}", unsubscribeUrl);

  const mailOptions = {
    from: `"Stock Vision" <Stock Vision@muazzam.page.gd>`,
    to: email,
    subject: `Welcome to Stock Vision - your stock market toolkit is ready!`,
    text: "Thanks for joining Stock Vision",
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
  unsubscribeToken,
}: {
  email: string;
  date: string;
  newsContent: string;
  unsubscribeToken: string;
}): Promise<void> => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${unsubscribeToken}`;

  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace("{{date}}", date)
    .replace("{{newsContent}}", newsContent)
    .replace("{{appUrl}}", appUrl!)
    .replace("{{unsubscribeUrl}}", unsubscribeUrl);

  const mailOptions = {
    from: `"Stock Vision News" <Stock Vision@muazzam.page.gd>`,
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Stock Vision`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

// Update sendAlertEmail to include unsubscribe token
export const sendAlertEmail = async ({
  email,
  symbol,
  company,
  currentPrice,
  targetPrice,
  condition,
  stockUrl,
  unsubscribeToken,
}: {
  email: string;
  symbol: string;
  company: string;
  currentPrice: string;
  targetPrice: string;
  condition: string;
  stockUrl: string;
  unsubscribeToken: string;
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${unsubscribeToken}`;

  const htmlTemplate = PRICE_ALERT_EMAIL_TEMPLATE.replace("{{symbol}}", symbol)
    .replace("{{company}}", company)
    .replace("{{currentPrice}}", currentPrice)
    .replace("{{targetPrice}}", targetPrice)
    .replace("{{condition}}", condition)
    .replace("{{stockUrl}}", stockUrl)
    .replace("{{unsubscribeUrl}}", unsubscribeUrl)
    .replace("{{appUrl}}", appUrl!);

  const mailOptions = {
    from: `"Stock Vision" <StockVision@muazzam.page.gd>`,
    to: email,
    subject: `🔔 Price Alert: ${symbol} has hit your target price`,
    text: `Your price alert for ${symbol} (${company}) has been triggered.\n\nCurrent Price: ${currentPrice}\nTarget Price: ${targetPrice}\nCondition: Price is ${condition} your target.\n\nView stock details: ${stockUrl}`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async ({
  email,
  resetUrl,
}: {
  email: string;
  resetUrl: string;
}) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const htmlTemplate = RESET_PASSWORD_EMAIL_TEMPLATE.replace(
    /{{resetUrl}}/g,
    resetUrl,
  ).replace("{{appUrl}}", appUrl!);

  const mailOptions = {
    from: `"Stock Vision" <Stock Vision@muazzam.page.gd>`,
    to: email,
    subject: "Reset your Stock Vision password",
    text: `We received a request to reset your Stock Vision password.\n\nClick the link below to set a new password (valid for 1 hour):\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
