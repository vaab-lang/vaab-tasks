#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VAAB_BIN="${VAAB_BIN:-$ROOT/../vaab/target/debug/vaab}"

if [[ ! -x "$VAAB_BIN" ]]; then
  echo "building vaab…"
  cargo build -p vaab-cli --manifest-path "$ROOT/../vaab/Cargo.toml"
fi

mkdir -p "$ROOT/data"
cd "$ROOT"

export AUTH_SECRET="${AUTH_SECRET:-dev}"
export DATABASE_URL="${DATABASE_URL:-sqlite:data/tasks.db}"

exec "$VAAB_BIN" serve backend/main.vaab
