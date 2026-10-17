import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { renderWelcomeEmail } from "../src/emails/welcome";
import { renderOtpEmail } from "../src/emails/otp";
import { renderWithdrawalEmail } from "../src/emails/withdrawal";

const OUT_DIR = join(process.cwd(), "emails-export");

const templates: Array<{ name: string; html: string }> = [
  { name: "welcome.html", html: renderWelcomeEmail({ name: "Ada Lovelace" }) },
  { name: "otp.html", html: renderOtpEmail({ code: "123456" }) },
  {
    name: "withdrawal-otp.html",
    html: renderOtpEmail({ code: "123456", purpose: "withdrawal" }),
  },
  {
    name: "withdrawal.html",
    html: renderWithdrawalEmail({
      name: "Ada Lovelace",
      amount: "1.00000000",
      asset: "XLM",
      address: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    }),
  },
];

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  for (const { name, html } of templates) {
    await writeFile(join(OUT_DIR, name), html, "utf8");
  }
  console.log(`Exported ${templates.length} email templates to ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});