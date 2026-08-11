import { lookup } from "node:dns/promises";
import { isIP, type LookupFunction } from "node:net";
import { domainToASCII } from "node:url";
import { Agent, buildConnector } from "undici";

const PUBLIC_WEBSITE_ERROR = "Please enter a public website domain";

export type PublicAddress = {
  address: string;
  family: 4 | 6;
};

export type PublicHostname = {
  hostname: string;
  addresses: readonly PublicAddress[];
};

export type PublicUrlTarget = PublicHostname & {
  url: URL;
};

type ResolveOptions = {
  timeoutMs?: number;
};

type PinnedAgentOptions = {
  bodyTimeoutMs: number;
  connectTimeoutMs: number;
  headersTimeoutMs: number;
  maxResponseBytes: number;
};

/** A deliberately generic error so private infrastructure details never leak. */
export class UnsafeNetworkTargetError extends Error {
  constructor(message = PUBLIC_WEBSITE_ERROR) {
    super(message);
    this.name = "UnsafeNetworkTargetError";
  }
}

function parseIpv4(address: string): Uint8Array | null {
  const parts = address.split(".");
  if (parts.length !== 4) return null;

  const bytes = parts.map((part) => Number(part));
  if (
    bytes.some(
      (byte, index) =>
        !Number.isInteger(byte) ||
        byte < 0 ||
        byte > 255 ||
        String(byte) !== parts[index]
    )
  ) {
    return null;
  }
  return Uint8Array.from(bytes);
}

function parseIpv6(address: string): Uint8Array | null {
  let normalized = address.toLowerCase();
  const zoneIndex = normalized.indexOf("%");
  if (zoneIndex !== -1) normalized = normalized.slice(0, zoneIndex);

  const lastColon = normalized.lastIndexOf(":");
  if (normalized.includes(".") && lastColon !== -1) {
    const ipv4 = parseIpv4(normalized.slice(lastColon + 1));
    if (!ipv4) return null;
    const high = ((ipv4[0] << 8) | ipv4[1]).toString(16);
    const low = ((ipv4[2] << 8) | ipv4[3]).toString(16);
    normalized = `${normalized.slice(0, lastColon)}:${high}:${low}`;
  }

  const halves = normalized.split("::");
  if (halves.length > 2) return null;

  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;

  const words = [
    ...left,
    ...Array.from({ length: missing }, () => "0"),
    ...right,
  ];
  if (words.length !== 8) return null;

  const bytes = new Uint8Array(16);
  for (let index = 0; index < words.length; index += 1) {
    if (!/^[0-9a-f]{1,4}$/.test(words[index])) return null;
    const word = Number.parseInt(words[index], 16);
    bytes[index * 2] = word >> 8;
    bytes[index * 2 + 1] = word & 0xff;
  }
  return bytes;
}

function parseIp(address: string): Uint8Array | null {
  const family = isIP(address);
  if (family === 4) return parseIpv4(address);
  if (family === 6) return parseIpv6(address);
  return null;
}

function isInCidr(
  address: Uint8Array,
  network: Uint8Array,
  prefixLength: number
): boolean {
  if (address.length !== network.length) return false;

  const fullBytes = Math.floor(prefixLength / 8);
  const remainingBits = prefixLength % 8;
  for (let index = 0; index < fullBytes; index += 1) {
    if (address[index] !== network[index]) return false;
  }
  if (remainingBits === 0) return true;

  const mask = (0xff << (8 - remainingBits)) & 0xff;
  return (address[fullBytes] & mask) === (network[fullBytes] & mask);
}

const IPV4_NON_PUBLIC_CIDRS = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.31.196.0", 24],
  ["192.52.193.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["192.175.48.0", 24],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const;

const IPV6_NON_PUBLIC_CIDRS = [
  // IETF protocol assignments, benchmarking, ORCHID, and related special use.
  ["2001::", 23],
  ["2001:db8::", 32],
  // 6to4 can encode an otherwise blocked IPv4 destination.
  ["2002::", 16],
  // Direct Delegation AS112 service prefix, not a normal public destination.
  ["2620:4f:8000::", 48],
  // Documentation prefix.
  ["3fff::", 20],
] as const;

/**
 * True only for globally routable unicast addresses. The allow-list posture for
 * IPv6 intentionally excludes every range outside 2000::/3, then removes the
 * special-use allocations that sit inside that global-unicast block.
 */
export function isPublicIpAddress(address: string): boolean {
  const family = isIP(address);
  const bytes = parseIp(address);
  if (!bytes) return false;

  if (family === 4) {
    return !IPV4_NON_PUBLIC_CIDRS.some(([network, prefix]) => {
      const networkBytes = parseIpv4(network);
      return networkBytes ? isInCidr(bytes, networkBytes, prefix) : true;
    });
  }

  const globalUnicast = parseIpv6("2000::");
  if (!globalUnicast || !isInCidr(bytes, globalUnicast, 3)) return false;

  return !IPV6_NON_PUBLIC_CIDRS.some(([network, prefix]) => {
    const networkBytes = parseIpv6(network);
    return networkBytes ? isInCidr(bytes, networkBytes, prefix) : true;
  });
}

function canonicalHostname(input: string): string {
  let hostname = input.trim();
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    hostname = hostname.slice(1, -1);
  }
  hostname = hostname.replace(/\.$/, "");

  if (isIP(hostname)) return hostname.toLowerCase();

  const ascii = domainToASCII(hostname).toLowerCase();
  if (!ascii || ascii.length > 253 || ascii.split(".").some((part) => !part)) {
    throw new UnsafeNetworkTargetError();
  }

  const labels = ascii.split(".");
  if (
    labels.length < 2 ||
    labels.some(
      (label) =>
        label.length > 63 ||
        !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
    )
  ) {
    throw new UnsafeNetworkTargetError();
  }

  const blockedSuffixes = [
    "localhost",
    "local",
    "internal",
    "home.arpa",
    "test",
    "invalid",
    "onion",
  ];
  if (
    blockedSuffixes.some(
      (suffix) => ascii === suffix || ascii.endsWith(`.${suffix}`)
    )
  ) {
    throw new UnsafeNetworkTargetError();
  }

  return ascii;
}

function dnsTimeoutError(timeoutMs: number): Error {
  const error = new Error(`DNS lookup timed out after ${timeoutMs / 1000}s`);
  error.name = "TimeoutError";
  return error;
}

async function lookupAll(
  hostname: string,
  timeoutMs?: number
): Promise<PublicAddress[]> {
  const pending = lookup(hostname, { all: true, verbatim: true }).then(
    (records) =>
      records.map((record) => ({
        address: record.address,
        family: record.family as 4 | 6,
      }))
  );
  if (!timeoutMs) return pending;

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      pending,
      new Promise<PublicAddress[]>((_, reject) => {
        timer = setTimeout(() => reject(dnsTimeoutError(timeoutMs)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function resolvePublicHostname(
  input: string,
  options: ResolveOptions = {}
): Promise<PublicHostname> {
  const hostname = canonicalHostname(input);
  const literalFamily = isIP(hostname);
  const resolved = literalFamily
    ? [{ address: hostname, family: literalFamily as 4 | 6 }]
    : await lookupAll(hostname, options.timeoutMs);

  const addresses = resolved.filter(
    (record): record is PublicAddress =>
      (record.family === 4 || record.family === 6) && Boolean(record.address)
  );
  if (!addresses.length) {
    const error = new Error(`getaddrinfo ENOTFOUND ${hostname}`);
    Object.assign(error, { code: "ENOTFOUND", hostname });
    throw error;
  }

  // Reject a mixed public/private answer rather than silently filtering it. A
  // later connection attempt must never get a chance to select the private IP.
  if (addresses.some((record) => !isPublicIpAddress(record.address))) {
    throw new UnsafeNetworkTargetError();
  }

  const unique = new Map<string, PublicAddress>();
  for (const record of addresses) {
    unique.set(`${record.family}:${record.address}`, record);
  }
  return { hostname, addresses: [...unique.values()] };
}

export async function resolvePublicUrl(
  input: string | URL,
  options: ResolveOptions = {}
): Promise<PublicUrlTarget> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Invalid URL format");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }
  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials are not supported");
  }

  // URL normalizes an explicitly supplied default port to an empty string, so
  // any remaining port is non-standard for its scheme.
  if (url.port) {
    throw new Error("Only standard HTTP and HTTPS ports are supported");
  }

  const target = await resolvePublicHostname(url.hostname, options);
  return { ...target, url };
}

function lookupError(hostname: string): NodeJS.ErrnoException {
  return Object.assign(new Error(`getaddrinfo ENOTFOUND ${hostname}`), {
    code: "ENOTFOUND",
    hostname,
  });
}

/** A Node lookup function that can return only the addresses already vetted. */
export function createPinnedLookup(target: PublicHostname): LookupFunction {
  return (requestedHostname, options, callback) => {
    let requested: string;
    try {
      requested = canonicalHostname(requestedHostname);
    } catch {
      callback(lookupError(requestedHostname), "", 0);
      return;
    }

    if (requested !== target.hostname) {
      callback(lookupError(requestedHostname), "", 0);
      return;
    }

    const requestedFamily =
      options.family === "IPv4"
        ? 4
        : options.family === "IPv6"
          ? 6
          : options.family;
    const addresses = requestedFamily
      ? target.addresses.filter((record) => record.family === requestedFamily)
      : [...target.addresses];

    if (!addresses.length) {
      callback(lookupError(requestedHostname), "", 0);
      return;
    }

    if (options.all) {
      callback(
        null,
        addresses.map((record) => ({ ...record }))
      );
      return;
    }

    callback(null, addresses[0].address, addresses[0].family);
  };
}

function ipKey(address: string | undefined): string | null {
  if (!address) return null;
  const bytes = parseIp(address);
  if (!bytes) return null;

  // Node can expose an IPv4 peer as an IPv4-mapped IPv6 address.
  if (
    bytes.length === 16 &&
    bytes.slice(0, 10).every((byte) => byte === 0) &&
    bytes[10] === 0xff &&
    bytes[11] === 0xff
  ) {
    return `4:${Buffer.from(bytes.slice(12)).toString("hex")}`;
  }
  return `${bytes.length === 4 ? 4 : 6}:${Buffer.from(bytes).toString("hex")}`;
}

/**
 * Build a one-target dispatcher whose DNS lookup is pinned to the validated
 * answer. The connector also checks the actual peer before Undici can send the
 * HTTP request.
 */
export function createPinnedAgent(
  target: PublicUrlTarget,
  options: PinnedAgentOptions
): Agent {
  const allowedPeers = new Set(
    target.addresses.map((record) => ipKey(record.address)).filter(Boolean)
  );
  const connector = buildConnector({
    allowH2: false,
    autoSelectFamily: target.addresses.length > 1,
    lookup: createPinnedLookup(target),
    maxCachedSessions: 0,
    timeout: options.connectTimeoutMs,
  });

  return new Agent({
    allowH2: false,
    autoSelectFamily: target.addresses.length > 1,
    bodyTimeout: options.bodyTimeoutMs,
    connect(connectOptions, callback) {
      connector(connectOptions, (error, socket) => {
        if (error || !socket) {
          callback(error ?? new Error("Connection failed"), null);
          return;
        }

        const peer = ipKey(socket.remoteAddress);
        if (!peer || !allowedPeers.has(peer)) {
          const unsafe = new UnsafeNetworkTargetError();
          socket.destroy(unsafe);
          callback(unsafe, null);
          return;
        }
        callback(null, socket);
      });
    },
    connectTimeout: options.connectTimeoutMs,
    connections: 1,
    headersTimeout: options.headersTimeoutMs,
    keepAliveTimeout: 1_000,
    maxOrigins: 1,
    maxResponseSize: options.maxResponseBytes,
    pipelining: 1,
  });
}
