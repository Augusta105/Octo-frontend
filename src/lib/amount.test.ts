import { describe, it, expect } from "vitest";
import { parseAmount, formatStroops } from "./amount";
import { stroopsToXlm } from "./sponsorship";
import { amountToStroops } from "./wallets";
import { usdAmountToStroops, isValidEmail } from "./payment-links";

describe("parseAmount", () => {
  it("parses decimals into exact stroops", () => {
    expect(parseAmount("1.5")).toEqual({ ok: true, stroops: BigInt(15_000_000) });
    expect(parseAmount(".0000001")).toEqual({ ok: true, stroops: BigInt(1) });
    expect(parseAmount("10.")).toEqual({ ok: true, stroops: BigInt(100_000_000) });
    expect(parseAmount("0")).toEqual({ ok: true, stroops: BigInt(0) });
  });

  it("rejects more than 7 decimals", () => {
    const r = parseAmount("1.00000001");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/7 decimal/);
  });

  it("rejects non-numeric, signed, exponent and empty input", () => {
    for (const bad of ["", " ", ".", "-1", "1e3", "abc", "1.2.3", "0x10"]) {
      expect(parseAmount(bad).ok).toBe(false);
    }
  });

  it("rejects values above int64", () => {
    expect(parseAmount("922337203685.4775808").ok).toBe(false);
    expect(parseAmount("922337203685.4775807").ok).toBe(true);
  });
});

describe("formatStroops", () => {
  it("trims trailing zeros and keeps up to 7 decimals", () => {
    expect(formatStroops(100)).toBe("0.00001");
    expect(formatStroops(BigInt(15_000_000))).toBe("1.5");
    expect(formatStroops(10_000_000)).toBe("1");
    expect(formatStroops(1)).toBe("0.0000001");
    expect(formatStroops(0)).toBe("0");
    expect(formatStroops(-100)).toBe("-0.00001");
  });
});

describe("amountToStroops", () => {
  it("converts whole and fractional amounts into stroops", () => {
    expect(amountToStroops("1")).toBe(BigInt(10_000_000));
    expect(amountToStroops("1.5")).toBe(BigInt(15_000_000));
    expect(amountToStroops("0.0000001")).toBe(BigInt(1));
  });

  it("handles zero", () => {
    expect(amountToStroops("0")).toBe(BigInt(0));
  });
});

describe("usdAmountToStroops", () => {
  it("converts whole and fractional USD amounts into stroops", () => {
    expect(usdAmountToStroops("1")).toBe(BigInt(10_000_000));
    expect(usdAmountToStroops("1.5")).toBe(BigInt(15_000_000));
    expect(usdAmountToStroops("0.0000001")).toBe(BigInt(1));
  });

  it("handles zero", () => {
    expect(usdAmountToStroops("0")).toBe(BigInt(0));
  });
});

describe("isValidEmail", () => {
  it("accepts valid email addresses", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("first.last+tag@sub.example.co")).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    for (const bad of ["", " ", "user", "user@", "@example.com", "user@example", "a b@example.com"]) {
      expect(isValidEmail(bad)).toBe(false);
    }
  });
});

describe("stroopsToXlm", () => {
  it("renders a 100-stroop fee as 0.00001 XLM", () => {
    expect(stroopsToXlm(100)).toBe("0.00001 XLM");
  });

  it("renders zero stroops as 0 XLM", () => {
    expect(stroopsToXlm(0)).toBe("0 XLM");
  });

  it("renders whole amounts as XLM", () => {
    expect(stroopsToXlm(10_000_000)).toBe("1 XLM");
  });

  it("renders fractional amounts as XLM", () => {
    expect(stroopsToXlm(15_000_000)).toBe("1.5 XLM");
  });

  it("renders negative amounts as XLM", () => {
    expect(stroopsToXlm(-100)).toBe("-0.00001 XLM");
  });
});
