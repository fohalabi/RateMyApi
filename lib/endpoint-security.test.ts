import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertPublicEndpoint,
  isPublicIpAddress,
  normalizeEndpointUrl,
  UnsafeEndpointError,
} from './endpoint-security.ts';

test('blocks private and special-use IPv4 addresses', () => {
  for (const address of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '169.254.169.254']) {
    assert.equal(isPublicIpAddress(address), false, address);
  }
});

test('blocks private and special-use IPv6 addresses', () => {
  for (const address of ['::1', '::', 'fc00::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1']) {
    assert.equal(isPublicIpAddress(address), false, address);
  }
});

test('allows public IP addresses', () => {
  assert.equal(isPublicIpAddress('1.1.1.1'), true);
  assert.equal(isPublicIpAddress('2606:4700:4700::1111'), true);
});

test('normalizes safe HTTP URLs', () => {
  assert.equal(normalizeEndpointUrl(' https://example.com/health#status ').toString(), 'https://example.com/health');
});

test('rejects unsupported protocols and embedded credentials', () => {
  assert.throws(() => normalizeEndpointUrl('file:///etc/passwd'), UnsafeEndpointError);
  assert.throws(() => normalizeEndpointUrl('https://user:password@example.com'), UnsafeEndpointError);
});

test('rejects localhost endpoints before probing', async () => {
  await assert.rejects(() => assertPublicEndpoint('http://localhost:3000/health'), UnsafeEndpointError);
  await assert.rejects(() => assertPublicEndpoint('http://127.0.0.1/health'), UnsafeEndpointError);
  await assert.rejects(() => assertPublicEndpoint('http://[::1]/health'), UnsafeEndpointError);
});
