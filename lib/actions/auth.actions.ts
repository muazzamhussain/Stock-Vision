"use server";

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({
    email,
    password,
    fullName,
    country,
    investmentGoals,
    riskTolerance,
    preferredIndustry,
}: SignUpFormData) => {
    try {
        const response = await auth?.api.signUpEmail({
            body: { email, password, name: fullName },
        });

        if (response) {
            await inngest.send({
                name: "app/user.created",
                data: {
                    userId: response.user.id,
                    email,
                    name: fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry,
                },
            });
        }

        return { success: true, data: response };
    } catch (e: any) {
        console.error("Sign up failed", e);

        // ✅ Better Auth returns structured errors
        const status = e?.status || e?.statusCode;
        const message = e?.body?.message || e?.message || "";

        if (status === 422 || message.toLowerCase().includes("already exists") || message.toLowerCase().includes("email")) {
            return {
                success: false,
                error: "An account with this email already exists. Please sign in instead.",
            };
        }

        return {
            success: false,
            error: message || "Sign up failed. Please try again.",
        };
    }
};

export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        const response = await auth?.api.signInEmail({ body: { email, password } });

        if (!response || !response.user) {
            return {
                success: false,
                error: "Invalid email or password.",
            };
        }

        return { success: true, data: response };
    } catch (e: any) {
        console.error("Sign in failed", e);

        const message = e?.body?.message || e?.message || "";
        const status = e?.status || e?.statusCode;

        if (status === 401 || message.toLowerCase().includes("invalid") || message.toLowerCase().includes("credentials")) {
            return {
                success: false,
                error: "Invalid email or password.",
            };
        }

        return {
            success: false,
            error: message || "Sign in failed. Please try again.",
        };
    }
};

export const signOut = async () => {
  try {
    await auth?.api.signOut({ headers: await headers() });
  } catch (e) {
    console.log("Sign out failed", e);
    return { success: false, error: "Sign out failed" };
  }
};
