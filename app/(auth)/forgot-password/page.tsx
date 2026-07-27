"use client";
import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { sendForgotPassword } from "@/lib/actions/auth.actions";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const forgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({ defaultValues: { email: "" } });

  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async (data: ForgotPasswordForm) => {
    const result = await sendForgotPassword(data.email);
    if (result.success) {
      setEmailSent(true);
      toast.success("Password reset link sent to your email.");
    } else {
      toast.error("Failed to send reset email", {
        description: result.error || "Please try again",
      });
    }
  };

  if (emailSent)
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-white">Check Your Inbox</h2>
        <p className="text-gray-400">
          We’ve sent a password reset link to your email address.
        </p>
        <p className="text-gray-500 text-sm">
          If you don’t see it, check your spam folder.
        </p>
        <FooterLink text="Return to" linkText="Sign In" href="/sign-in" />
      </div>
    );

  return (
    <>
      <h1 className="form-title">Reset Your Password</h1>
      <p className="text-gray-400 mb-6 text-sm">
        Enter the email address associated with your account, and we’ll send you
        a link to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
          placeholder="name@example.com"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          }}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full mt-5"
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
        <FooterLink
          text="Remember your password?"
          linkText="Sign in"
          href="/sign-in"
        />
      </form>
    </>
  );
};

export default forgotPasswordPage;
