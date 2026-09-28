import dns from 'node:dns/promises';
import net from 'node:net';
import type { LookupAddress } from 'node:dns';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);

export class UnsafeEndpointError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeEndpointError';
  }
}

function isPrivateIpv4(address: string) {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) return true;

  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase().split('%')[0];
  const mappedIpv4 = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];

  if (mappedIpv4) return isPrivateIpv4(mappedIpv4);

  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith('ff')
  );
}

export function isPublicIpAddress(address: string) {
  const family = net.isIP(address);
  if (family === 4) return !isPrivateIpv4(address);
  if (family === 6) return !isPrivateIpv6(address);
  return false;
}

export function normalizeEndpointUrl(value: unknown) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new UnsafeEndpointError('An endpoint URL is required.');
  }

  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new UnsafeEndpointError('Enter a valid endpoint URL.');
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new UnsafeEndpointError('Only HTTP and HTTPS endpoints are supported.');
  }

  if (url.username || url.password) {
    throw new UnsafeEndpointError('Endpoint URLs cannot contain credentials.');
  }

  url.hash = '';
  return url;
}

export async function assertPublicEndpoint(value: string | URL) {
  const url = value instanceof URL ? value : normalizeEndpointUrl(value);
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');

  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost')) {
    throw new UnsafeEndpointError('Local and private-network endpoints are not allowed.');
  }

  if (net.isIP(hostname)) {
    if (!isPublicIpAddress(hostname)) {
      throw new UnsafeEndpointError('Local and private-network endpoints are not allowed.');
    }
    return url;
  }

  let addresses: LookupAddress[];
  try {
    addresses = await dns.lookup(hostname, { all: true, verbatim: true }) as LookupAddress[];
  } catch {
    throw new UnsafeEndpointError('The endpoint hostname could not be resolved.');
  }

  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIpAddress(address))) {
    throw new UnsafeEndpointError('Local and private-network endpoints are not allowed.');
  }

  return url;
}
