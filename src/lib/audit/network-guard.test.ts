import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  UnsafeNetworkTargetError,
  isPublicIpAddress,
  resolvePublicHostname,
  resolvePublicUrl,
} from "@/lib/audit/network-guard";

describe("isPublicIpAddress", () => {
  for (const address of [
    "1.1.1.1",
    "8.8.8.8",
    "2606:4700:4700::1111",
    "2001:4860:4860::8888",
  ]) {
    it(`accepts globally routable address ${address}`, () => {
      assert.equal(isPublicIpAddress(address), true);
    });
  }

  for (const address of [
    "0.0.0.0",
    "10.0.0.1",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.1.1",
    "192.0.2.1",
    "198.18.0.1",
    "203.0.113.1",
    "224.0.0.1",
    "255.255.255.255",
    "::",
    "::1",
    "::ffff:127.0.0.1",
    "fc00::1",
    "fe80::1",
    "2001:db8::1",
    "2002:7f00:1::",
    "ff02::1",
  ]) {
    it(`rejects non-public address ${address}`, () => {
      assert.equal(isPublicIpAddress(address), false);
    });
  }
});

describe("public target resolution", () => {
  it("resolves a public IP literal without DNS", async () => {
    const target = await resolvePublicUrl("https://1.1.1.1/path");
    assert.equal(target.hostname, "1.1.1.1");
    assert.deepEqual(target.addresses, [{ address: "1.1.1.1", family: 4 }]);
  });

  for (const url of [
    "http://127.0.0.1",
    "http://169.254.169.254/latest/meta-data",
    "https://[::1]/",
  ]) {
    it(`rejects private URL target ${url}`, async () => {
      await assert.rejects(resolvePublicUrl(url), UnsafeNetworkTargetError);
    });
  }

  it("rejects credentials and non-standard ports before connecting", async () => {
    await assert.rejects(
      resolvePublicUrl("https://user:pass@1.1.1.1"),
      /credentials/i
    );
    await assert.rejects(
      resolvePublicUrl("https://1.1.1.1:8443"),
      /standard HTTP and HTTPS ports/i
    );
  });

  for (const hostname of ["service.internal", "example.local", "example.test"]) {
    it(`rejects reserved hostname ${hostname} without DNS`, async () => {
      await assert.rejects(
        resolvePublicHostname(hostname),
        UnsafeNetworkTargetError
      );
    });
  }
});
