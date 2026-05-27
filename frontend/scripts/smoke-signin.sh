#!/usr/bin/env bash
#
# Sign-in smoke test for the Next.js frontend behind the same-origin proxy.
# Verifies the highest-risk pieces of the migration:
#   1. proxy routes non-API paths to Next, /api to Symfony
#   2. POST /auth/login sets the BEARER cookie (scoped to /api/v1)
#   3. GET /users/me with that cookie returns the user (the console boot call)
#
# Usage:
#   STAGING_URL=https://staging.dailybrew.work \
#   TEST_EMAIL=you@example.com TEST_PASSWORD=secret \
#   [LOCALE=en] bash frontend/scripts/smoke-signin.sh
set -uo pipefail

URL="${STAGING_URL:?set STAGING_URL}"
EMAIL="${TEST_EMAIL:?set TEST_EMAIL}"
PASSWORD="${TEST_PASSWORD:?set TEST_PASSWORD}"
LOCALE="${LOCALE:-en}"
URL="${URL%/}"
JAR="$(mktemp)"
fail=0
pass() { printf '  \033[32mPASS\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=1; }

echo "== Smoke test against $URL (locale=$LOCALE) =="

# 1. Proxy: /sign-in -> Next HTML
echo "[1] proxy: GET /sign-in serves the Next app"
body="$(curl -fsS "$URL/sign-in" 2>/dev/null)"
if echo "$body" | grep -qiE '<div id="daily_brew_application"'; then
  bad "/sign-in is still the legacy Symfony SPA shell (cutover/proxy not pointing at Next)"
elif echo "$body" | grep -qiE '_next|/__next|next'; then
  pass "/sign-in is served by Next.js"
else
  bad "/sign-in did not look like the Next app (check the proxy)"
fi

# 2. Proxy: /api -> Symfony (404 JSON, not the SPA/Next HTML)
echo "[2] proxy: /api/v1/$LOCALE reaches Symfony"
code="$(curl -s -o /dev/null -w '%{http_code}' "$URL/api/v1/$LOCALE/users/me")"
if [ "$code" = "401" ] || [ "$code" = "200" ]; then
  pass "/api reaches Symfony (HTTP $code from /users/me unauthenticated)"
else
  bad "/api/v1/$LOCALE/users/me returned HTTP $code (expected 401 unauthenticated)"
fi

# 3. Login -> Set-Cookie BEARER
echo "[3] POST /auth/login sets the BEARER cookie"
login_headers="$(curl -s -D - -o /dev/null -c "$JAR" \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -X POST "$URL/api/v1/$LOCALE/auth/login" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")"
if echo "$login_headers" | grep -qiE '^set-cookie:.*BEARER'; then
  pass "login set a BEARER cookie"
  echo "$login_headers" | grep -iE '^set-cookie:.*(BEARER|refresh)' | sed 's/^/      /'
else
  bad "login did not set a BEARER cookie — check the response below"
  echo "$login_headers" | head -1 | sed 's/^/      /'
fi

# 4. /users/me with the cookie -> 200 + publicId
echo "[4] GET /users/me with the cookie returns the user"
me="$(curl -s -b "$JAR" -H 'Accept: application/json' "$URL/api/v1/$LOCALE/users/me")"
if echo "$me" | grep -qiE '"publicId"'; then
  pass "/users/me returned the authenticated user"
  echo "$me" | head -c 200 | sed 's/^/      /'; echo
else
  bad "/users/me did not return a user (cookie not accepted?)"
  echo "$me" | head -c 200 | sed 's/^/      /'; echo
fi

rm -f "$JAR"
echo
[ "$fail" = 0 ] && echo "ALL CHECKS PASSED" || echo "SOME CHECKS FAILED"
exit "$fail"
