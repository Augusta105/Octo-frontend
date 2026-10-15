import { describe, expect, it } from 'vitest';
import { Account, Keypair, MuxedAccount, StrKey } from '@stellar/stellar-base';
import {
  baseAccountOf,
  getStellarAddressKind,
  isValidStellarAddress,
  validateStellarAddress,
} from './address';

const G_ADDRESS = Keypair.random().publicKey();
const OTHER_G_ADDRESS = Keypair.random().publicKey();

const M_ADDRESS = new MuxedAccount(
  new Account(G_ADDRESS, '0'),
  '123',
).accountId();

const INVALID_ADDRESS = 'not-a-stellar-address';
const EMPTY_ADDRESS = '';

describe('isValidStellarAddress', () => {
  it('returns true for a valid G... address', () => {
    expect(isValidStellarAddress(G_ADDRESS)).toBe(true);
  });

  it('returns true for a valid M... address', () => {
    expect(isValidStellarAddress(M_ADDRESS)).toBe(true);
  });

  it('returns false for an invalid address', () => {
    expect(isValidStellarAddress(INVALID_ADDRESS)).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidStellarAddress(EMPTY_ADDRESS)).toBe(false);
  });

  it('returns false for null and undefined', () => {
    expect(isValidStellarAddress(null as unknown as string)).toBe(false);
    expect(isValidStellarAddress(undefined as unknown as string)).toBe(false);
  });
});

describe('getStellarAddressKind', () => {
  it('returns "account" for a valid G... address', () => {
    expect(getStellarAddressKind(G_ADDRESS)).toBe('account');
  });

  it('returns "muxed" for a valid M... address', () => {
    expect(getStellarAddressKind(M_ADDRESS)).toBe('muxed');
  });

  it('returns null for an invalid address', () => {
    expect(getStellarAddressKind(INVALID_ADDRESS)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(getStellarAddressKind(EMPTY_ADDRESS)).toBeNull();
  });
});

describe('baseAccountOf', () => {
  it('returns the same address for a G... address', () => {
    expect(baseAccountOf(G_ADDRESS)).toBe(G_ADDRESS);
  });

  it('returns the underlying G... address for an M... address', () => {
    expect(baseAccountOf(M_ADDRESS)).toBe(G_ADDRESS);
  });

  it('returns null for an invalid address', () => {
    expect(baseAccountOf(INVALID_ADDRESS)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(baseAccountOf(EMPTY_ADDRESS)).toBeNull();
  });
});

describe('validateStellarAddress', () => {
  it('returns valid for a G... address', () => {
    expect(validateStellarAddress(G_ADDRESS)).toEqual({ valid: true });
  });

  it('returns valid for an M... address', () => {
    expect(validateStellarAddress(M_ADDRESS)).toEqual({ valid: true });
  });

  it('returns invalid for an empty string', () => {
    const result = validateStellarAddress(EMPTY_ADDRESS);
    expect(result.valid).toBe(false);
  });

  it('returns invalid for an invalid address', () => {
    const result = validateStellarAddress(INVALID_ADDRESS);
    expect(result.valid).toBe(false);
  });

  it('returns invalid when the address equals ownAddress', () => {
    const result = validateStellarAddress(G_ADDRESS, {
      ownAddress: G_ADDRESS,
    });
    expect(result.valid).toBe(false);
  });

  it('returns valid when the address differs from ownAddress', () => {
    expect(
      validateStellarAddress(G_ADDRESS, { ownAddress: OTHER_G_ADDRESS }),
    ).toEqual({ valid: true });
  });

  it('returns invalid when the base account of an M... address equals ownAddress', () => {
    const result = validateStellarAddress(M_ADDRESS, {
      ownAddress: G_ADDRESS,
    });
    expect(result.valid).toBe(false);
  });

  it('returns valid when ownAddress is not provided', () => {
    expect(validateStellarAddress(G_ADDRESS)).toEqual({ valid: true });
  });
});

describe('StrKey fixtures', () => {
  it('produces a valid G... StrKey', () => {
    expect(StrKey.isValidEd25519PublicKey(G_ADDRESS)).toBe(true);
  });

  it('produces a valid M... StrKey', () => {
    expect(StrKey.isValidMed25519PublicKey(M_ADDRESS)).toBe(true);
  });
});