# Vaab Tasks

A minimal task list that uses **Vaab as the backend**, exercising the
first-class vibe-app citizens:

| Need | Vaab surface |
| --- | --- |
| HTTP server | `serve` / `route` / `reply` |
| JSON | types that `can Json` |
| Database | `Db.connect`, `db.execute`, `db.query` (SQLite) |
| Auth | `request.who` (HMAC bearer token) |
| Secrets | `env.get` / `env.required` |
| Outbound HTTP | `http.get` (used by `/api/quote`) |

Integrations like Stripe stay as riffs — this app does not pull them in.

## Prerequisites

Build the Vaab CLI from the sibling checkout:

```sh
cargo build -p vaab-cli --manifest-path ../vaab/Cargo.toml
```

## Run

```sh
# terminal 1 — API
./scripts/serve.sh

# terminal 2 — static UI
python3 -m http.server 5173 --directory web
```

Open http://127.0.0.1:5173

Demo login is baked into the UI (user `ada` / `ada@example.com` signed with
`AUTH_SECRET=dev`). Mint another token with:

```sh
./scripts/mint-token.sh ada ada@example.com
```

## Layout

```
backend/main.vaab   Vaab HTTP API
web/                tiny static frontend
scripts/            serve + token helpers
data/               SQLite file (created on first request)
```
