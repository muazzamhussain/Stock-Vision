import { betterAuth } from "better-auth";
import { mongodbAdapter} from "better-auth/adapters/mongodb";
import { connectToDatabase} from "@/database/mongoose";
import { nextCookies} from "better-auth/next-js";
import { sendResetPasswordEmail } from "../nodemailer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authInstance: any = null;

export const getAuth = async () => {
    if(authInstance) return authInstance;

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if(!db) throw new Error('MongoDB connection not found');

    authInstance = betterAuth({
        database: mongodbAdapter(db as any),
        secret: process.env.BETTER_AUTH_SECRET,
        baseURL: process.env.BETTER_AUTH_URL,
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
            sendResetPassword: async({user, url, token}: {user: {email: string}; url: string; token: string})=>{
                await sendResetPasswordEmail({email: user.email, resetUrl: url});
            },
        },
        plugins: [nextCookies()],
    });

    return authInstance;
}

export const auth = await getAuth();
