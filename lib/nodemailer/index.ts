import nodemailer from 'nodemailer';
import {WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE, PRICE_ALERT_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ 
  email, 
  name, 
  intro,
  unsubscribeToken,
}: WelcomeEmailData & { unsubscribeToken: string }) => {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${unsubscribeToken}`;
  
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE
    .replace('{{name}}', name)
    .replace('{{intro}}', intro)
    .replace('{{unsubscribeUrl}}', unsubscribeUrl);

  const mailOptions = {
    from: `"Stock Vision" <Stock Vision@muazzam.page.gd>`,
    to: email,
    subject: `Welcome to Stock Vision - your stock market toolkit is ready!`,
    text: 'Thanks for joining Stock Vision',
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async (
  { email, date, newsContent, unsubscribeToken }: 
  { email: string; date: string; newsContent: string; unsubscribeToken: string }
): Promise<void> => {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${unsubscribeToken}`;
  
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
    .replace('{{date}}', date)
    .replace('{{newsContent}}', newsContent)
    .replace('{{unsubscribeUrl}}', unsubscribeUrl);

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
  targetPrice,
  condition,
  currentPrice,
  unsubscribeToken,
}: {
  email: string;
  symbol: string;
  company: string;
  targetPrice: number;
  condition: "above" | "below";
  currentPrice: number;
  unsubscribeToken: string;
}) => {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${unsubscribeToken}`;
  
  const htmlTemplate = PRICE_ALERT_EMAIL_TEMPLATE
    .replace('{{symbol}}', symbol)
    .replace('{{company}}', company)
    .replace('{{targetPrice}}', targetPrice.toFixed(2))
    .replace('{{condition}}', condition === 'above' ? 'above' : 'below')
    .replace('{{currentPrice}}', currentPrice.toFixed(2))
    .replace('{{stockUrl}}', `${process.env.NEXT_PUBLIC_APP_URL}/stocks/${symbol}`)
    .replace('{{unsubscribeUrl}}', unsubscribeUrl);

  const mailOptions = {
    from: `"Stock Vision Alerts" <Stock Vision@muazzam.page.gd>`,
    to: email,
    subject: `🔔 Price Alert: ${symbol} ${condition === 'above' ? 'above' : 'below'} $${targetPrice.toFixed(2)}`,
    text: `${symbol} (${company}) is currently $${currentPrice.toFixed(2)} - ${condition === 'above' ? 'above' : 'below'} your target of $${targetPrice.toFixed(2)}`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};