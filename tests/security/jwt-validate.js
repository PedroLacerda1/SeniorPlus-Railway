const jwt = require("jsonwebtoken");

const token = process.env.TEST_JWT;

if (!token) {
  console.error("❌ TEST_JWT environment variable not set.");
  process.exit(1);
}

try {
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded) {
    console.error("❌ Invalid JWT structure.");
    process.exit(1);
  }

  if (decoded.payload.exp * 1000 < Date.now()) {
    console.error("❌ JWT is expired.");
    process.exit(1);
  }

  console.log("✔️ JWT structure and expiration are valid.");
} catch (err) {
  console.error("❌ Failed validating JWT:", err.message);
  process.exit(1);
}
