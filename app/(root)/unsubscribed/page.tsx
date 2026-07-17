"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

const UnsubscribedPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const initialResubscribed = searchParams.get("resubscribed") === "true";
  const [isResubscribed, setIsResubscribed] = useState(initialResubscribed);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Try to get email from session or localStorage
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleResubscribe = async () => {
    if (!token) return;

    try {
      const response = await fetch(`/api/unsubscribe?token=${token}`, {
        method: "POST",
      });

      if (response.ok) {
        setIsResubscribed(true);
      }
    } catch (error) {
      console.error("Failed to resubscribe:", error);
    }
  };

  return (
    <div className="fixed-inset-0 bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg border border-white/10 p-8 text-center">
        {isResubscribed ? (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              You're Resubscribed!
            </h1>
            <p className="text-gray-400 mb-6">
              You will now continue to receive email updates from Stock Vision.
            </p>
            <Link href="/">
              <Button className="yellow-btn w-full">Return to Dashboard</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              You've Been Unsubscribed
            </h1>
            <p className="text-gray-400 mb-2">{email && `(${email})`}</p>
            <p className="text-gray-500 text-sm mb-6">
              You will no longer receive email updates from Stock Vision.
            </p>
            <div className="space-y-3">
              <Button onClick={handleResubscribe} className="yellow-btn w-full">
                Resubscribe
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
                >
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UnsubscribedPage;
