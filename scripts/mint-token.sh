#!/usr/bin/env bash
# Mint Authorization: Bearer <id>|<email>|<mac> for AUTH_SECRET (default: dev).
set -euo pipefail

ID="${1:-ada}"
EMAIL="${2:-ada@example.com}"
SECRET="${AUTH_SECRET:-dev}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

TOKEN="$(
  ID="$ID" EMAIL="$EMAIL" SECRET="$SECRET" python3 - <<'PY'
import hmac, hashlib, os
secret = os.environ["SECRET"].encode()
msg = f'{os.environ["ID"]}.{os.environ["EMAIL"]}'.encode()
mac = hmac.new(secret, msg, hashlib.sha256).hexdigest()
print(f'{os.environ["ID"]}|{os.environ["EMAIL"]}|{mac}')
PY
)"

echo "$TOKEN"
printf '%s\n' "$TOKEN" > "$ROOT/web/demo-token.txt"
