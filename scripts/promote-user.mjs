#!/usr/bin/env node
// Import clerkClient dynamically to avoid SSR issues in tooling
import { clerkClient } from '@clerk/nextjs/server';

const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node scripts/promote-user.mjs <userId>');
  process.exit(1);
}

(async () => {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const publicMetadata = { ...(user.publicMetadata || {}), isAdmin: true };
    await clerk.users.updateUser(userId, { publicMetadata });

    console.log(`Promoted user ${userId} to admin (publicMetadata.isAdmin = true)`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to promote user:', err);
    process.exit(1);
  }
})();
