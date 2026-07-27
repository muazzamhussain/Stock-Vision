'use client'
import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/actions/auth.actions";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const [resetDone, setResetDone] = useState(false);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error("Missing reset token");
      return;
    }

    const result = await resetPassword(token, data.password);

    if (result.success) {
      setResetDone(true);
      toast.success("Password reset successfully! You can now sign in.");
      setTimeout(() => router.push("/sign-in"), 2000);
    } else {
      toast.error("Password reset failed", {
        description: result.error || "Please try again.",
      });
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-white">
          Invalid Reset Link
        </h2>
        <p className="text-gray-400">The reset token is missing or invalid.</p>
        <FooterLink text="Go to" linkText="Sign In" href="/sign-in" />
      </div>
    );
  }

  if (resetDone) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-white">
          Password Reset Successful
        </h2>
        <p className="text-gray-400">
          You can now sign in with your new password.
        </p>
        <FooterLink text="Go to" linkText="Sign In" href="/sign-in" />
      </div>
    );
  }

  return (
    <>
      <h1 className="form-title">Set New Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter a strong password"
          register={register}
          error={errors.password}
          validation={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
        />

        <InputField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your new password"
          register={register}
          error={errors.confirmPassword}
          validation={{
            required: "Please confirm your password",
            validate: (value: string) =>
              value === watch("password") || "Passwords do not match",
          }}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full mt-5"
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordPage;
