"use client"

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-4 text-2xl font-semibold">Create an account</h1>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </div>
    </div>
  );
}
