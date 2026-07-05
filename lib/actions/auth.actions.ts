'use server'

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

export const signUpWithEmail = async ({
                                          email,
                                          password,
                                          fullName,
                                          country,
                                          investmentGoals,
                                          riskTolerance,
                                          preferredIndustry
                                      }: SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({
            body: {email, password, name: fullName}
        })

        if (response) {
            await inngest.send({
                name: 'app/user.created',
                data: {
                    email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry
                }
            })
        }

        return {success: true, data: response};
    } catch (error) {
        console.log("Sign up Failed", error);
        return {success: false, error: "Sign up Failed"};
    }
}


export const signOut = async()=>{
    try{
        await auth.api.signOut({headers: await headers()})
    } catch (e){
        console.log("Sign out failed",e);
        return {success: false, error: "Sign out Failed"};

    }
}

export const signInWithEmail = async ({email, password}: SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({body: {email, password}})

        return {success: true, data: response};
    } catch (error) {
        console.log("Sign in failed", error);
        return {success: false, error: "Sign in Failed"};

    }

}
