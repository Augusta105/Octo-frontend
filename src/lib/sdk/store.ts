/**
 * Local (browser) persistence of the encrypted seed backup, keyed by wallet id.
 *
 * The blob is the same opaque ciphertext the server stores and is useless without the user's
 * password. Storage is an optional cache because browser policy can make localStorage fail.
 */
import { parseBackup, type EncryptedBackup } from "./crypto";

const PREFIX = "octo_wallet_backup_";

function notifyStorageFailure() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("octo-storage-warning", {
      detail:
        "This browser could not cache your encrypted wallet backup. You can continue, but the backup will be fetched from Octo when needed.",
    }),
  );
}

export function saveLocalBackup(walletId: string, backup: EncryptedBackup): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(PREFIX + walletId, JSON.stringify(backup));
    return true;
  } catch {
    notifyStorageFailure();
    return false;
  }
}

export function loadLocalBackup(walletId: string): EncryptedBackup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + walletId);
    if (!raw) return null;
    return parseBackup(raw);
  } catch {
    return null;
  }
}

export function clearLocalBackups() {
  if (typeof window === "undefined") return;
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    notifyStorageFailure();
  }
}
