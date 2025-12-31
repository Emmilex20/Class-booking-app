"use client";

import React from "react";
import Link from "next/link";
import { PricingTable } from "@clerk/nextjs";

interface SafePricingTableProps {
  appearance?: any;
  fallback?: React.ReactNode;
  [key: string]: any;
}

export default function SafePricingTable(props: SafePricingTableProps) {
  try {
    return <PricingTable {...props} />;
  } catch (err) {
    console.error("PricingTable render failed:", err);
    return (
      <div className="p-8 bg-muted rounded-lg text-center">
        <p className="font-semibold mb-2">Billing is not enabled</p>
        <p className="text-sm text-muted-foreground mb-4">
          The pricing table cannot be displayed while Clerk billing is disabled.
        </p>
        <Link
          href="https://dashboard.clerk.com/last-active?path=billing/settings"
          className="text-primary underline"
        >
          Enable billing in the Clerk dashboard
        </Link>
      </div>
    );
  }
}
