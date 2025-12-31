"use client"

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      </div>
    </div>
  );
}
