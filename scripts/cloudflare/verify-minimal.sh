#!/usr/bin/env bash
set -euo pipefail
test "$(id -u)" -ne 0
test "$(awk '/^NoNewPrivs:/ {print $2}' /proc/self/status)" = 1
if /sbin/ldconfig -p | grep -q 'libatk-1.0.so.0'; then
  echo 'Regression image must reproduce the missing ATK library.' >&2
  exit 1
fi
system_status_before=$(sha256sum /var/lib/dpkg/status)
npm run "verify:$1"
node scripts/cloudflare/audit-routing.mjs ".cloudflare/$1/wrangler.json"
test "$system_status_before" = "$(sha256sum /var/lib/dpkg/status)"
test -f .cloudflare/browser-libraries/ubuntu24.04-x64/packages.json
echo 'ROOTLESS_MINIMAL_VERIFIED: missing ATK reproduced, browser/export/audits passed, system package database unchanged.'
