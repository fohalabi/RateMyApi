import dns from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { assertPublicEndpoint, isPublicIpAddress, normalizeEndpointUrl } from './endpoint-security';

const REQUEST_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;
const MAX_RESPONSE_BYTES = 1_000_000;

export interface ProbeResult {
  latencyMs: number;
  statusCode: number;
}

const safeLookup: net.LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true, verbatim: true }, (error, addresses) => {
    if (error) {
      callback(error, []);
      return;
    }

    const publicAddresses = addresses.filter(({ address }) => isPublicIpAddress(address));
    if (publicAddresses.length !== addresses.length || publicAddresses.length === 0) {
      const unsafeError = Object.assign(new Error('Hostname resolved to a private address.'), {
        code: 'EUNSAFEADDRESS',
      });
      callback(unsafeError, []);
      return;
    }

    if (options.all) {
      callback(null, publicAddresses);
    } else {
      const selected = publicAddresses[0];
      callback(null, selected.address, selected.family);
    }
  });
};

async function requestEndpoint(url: URL, redirectsRemaining: number): Promise<ProbeResult> {
  await assertPublicEndpoint(url);
  const startedAt = performance.now();
  const transport = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = transport.request(url, {
      method: 'GET',
      headers: {
        accept: '*/*',
        'user-agent': 'RateMyAPI-Monitor/1.0',
      },
      lookup: safeLookup,
      timeout: REQUEST_TIMEOUT_MS,
    }, (response) => {
      const statusCode = response.statusCode ?? 0;
      const location = response.headers.location;

      if (location && statusCode >= 300 && statusCode < 400) {
        response.resume();
        if (redirectsRemaining === 0) {
          reject(new Error('Endpoint exceeded the redirect limit.'));
          return;
        }

        let redirectUrl: URL;
        try {
          redirectUrl = normalizeEndpointUrl(new URL(location, url).toString());
        } catch (error) {
          reject(error);
          return;
        }

        requestEndpoint(redirectUrl, redirectsRemaining - 1).then(resolve, reject);
        return;
      }

      let receivedBytes = 0;
      response.on('data', (chunk: Buffer) => {
        receivedBytes += chunk.length;
        if (receivedBytes > MAX_RESPONSE_BYTES) response.destroy();
      });
      response.on('end', () => resolve({
        latencyMs: Math.max(1, Math.round(performance.now() - startedAt)),
        statusCode,
      }));
      response.on('close', () => {
        if (receivedBytes > MAX_RESPONSE_BYTES) {
          resolve({ latencyMs: Math.max(1, Math.round(performance.now() - startedAt)), statusCode });
        }
      });
    });

    request.on('timeout', () => request.destroy(new Error('Endpoint request timed out.')));
    request.on('error', reject);
    request.end();
  });
}

export async function probeEndpoint(value: string): Promise<ProbeResult> {
  return requestEndpoint(normalizeEndpointUrl(value), MAX_REDIRECTS);
}
