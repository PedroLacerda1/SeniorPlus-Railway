const token = process.env.TEST_JWT;

if (!token) {
  console.error("❌ TEST_JWT environment variable not set.");
  process.exit(1);
}

// Verifica se o JWT tem estrutura válida: header.payload.signature
const parts = token.split(".");
if (parts.length !== 3) {
  console.error("❌ Invalid JWT structure.");
  process.exit(1);
}

try {
  const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
  const payload = JSON.parse(payloadJson);

  if (!payload.exp) {
    console.error("❌ JWT does not contain 'exp' field.");
    process.exit(1);
  }

  if (payload.exp * 1000 < Date.now()) {
    console.error("❌ JWT is expired.");
    process.exit(1);
  }

  console.log("✔️ JWT structure and expiration are valid.");
} catch (err) {
  console.error("❌ Failed decoding JWT:", err.message);
  process.exit(1);
}
