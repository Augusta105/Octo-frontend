/**
 * Unlock a wallet for signing: obtain the decrypted Keypair from the user's password.
 *
 * Prefers the local encrypted backup (no network); falls back to the server-stored blob for
 * new-device recovery. The decrypted key exists only for the duration of the caller's signing
 * and is never persisted in plaintext.
 */
import { Keypair } from "@stellar/stellar-base";
import { decryptSeed } from "./crypto";
import { fromMnemonic } from "./keys";
import { getBackup } from "./client";
import { loadLocalBackup, saveLocalBackup } from "./store";
import { parseBackup } from "./crypto";

/**
 * User-facing message shown when no key backup can be found for a wallet.
 * Exported so tests can assert against the constant instead of a hardcoded string.
 */
export const MISSING_BACKUP_ERROR =
  'No key backup found for this wallet. Use "Recover wallet" on the wallet overview page.';

/**
 * Decrypt the wallet's key with `password` and return a signing Keypair.
 * Throws with a user-facing message if there is no backup or the password is wrong.
 *
 * When `expectedPublicKey` is given, the unlocked keypair is bound to the wallet it is
 * supposed to unlock: unlock fails safely if the derived public key does not match, so a
 * tampered or wrong-wallet backup can never be used to sign.
 */
export async function unlockWallet(
  token: string,
  walletId: string,
  password: string,
  expectedPublicKey?: string,
): Promise<Keypair> {
  let backup = loadLocalBackup(walletId);

  // New device / cleared storage: pull the opaque blob the server holds and cache it locally.
  if (!backup) {
    const remote = await getBackup(token, walletId);
    if (!remote.encrypted_backup) {
      throw new Error(MISSING_BACKUP_ERROR);
    }
    backup = parseBackup(remote.encrypted_backup);
    saveLocalBackup(walletId, backup);
  }

  const mnemonic = await decryptSeed(backup, password); // throws on wrong password
  const keypair = fromMnemonic(mnemonic).keypair;
  if (expectedPublicKey !== undefined && keypair.publicKey() !== expectedPublicKey) {
    throw new Error("Unlocked key does not match this wallet. Aborting unlock.");
  }
  return keypair;
}
