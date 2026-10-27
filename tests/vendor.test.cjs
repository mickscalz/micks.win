const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  crypto = require("node:crypto");
test("pinned codec/runtime/model assets match recorded SHA-256 provenance", () => {
  const rows = fs
    .readFileSync("assets/vendor/SHA256SUMS", "utf8")
    .trim()
    .split("\n");
  assert.equal(rows.length, 9);
  for (const row of rows) {
    const [expected, file] = row.split(/\s+/);
    assert.ok(file.startsWith("assets/vendor/"));
    assert.equal(
      crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
      expected,
      file,
    );
  }
});
