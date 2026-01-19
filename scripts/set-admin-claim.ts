/**
 * Set Admin Custom Claim
 *
 * Sets the 'admin' custom claim for a Firebase user.
 *
 * Usage:
 *   npx ts-node scripts/set-admin-claim.ts <user-uid>
 *
 * Prerequisites:
 *   - Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 *   - User must already exist in Firebase Auth
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

async function main() {
  const uid = process.argv[2];

  if (!uid) {
    console.error('Usage: npx ts-node scripts/set-admin-claim.ts <user-uid>');
    process.exit(1);
  }

  // Initialize Firebase Admin
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccount) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
    process.exit(1);
  }

  initializeApp({
    credential: cert(serviceAccount as string),
  });

  const auth = getAuth();

  try {
    // Get current user to verify they exist
    const user = await auth.getUser(uid);
    console.log(`Found user: ${user.email || user.uid}`);

    // Set admin custom claim
    await auth.setCustomUserClaims(uid, { admin: true });

    console.log(`✅ Successfully set admin claim for user: ${uid}`);
    console.log('   User will need to sign out and sign back in for changes to take effect.');
  } catch (error) {
    console.error('❌ Error setting admin claim:', error);
    process.exit(1);
  }
}

main();
