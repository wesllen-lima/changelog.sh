#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-wesllen-lima/changelog-sh}"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
BINARY="changelog"

# Detect OS and arch
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
  x86_64)        ARCH="x64"   ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $ARCH" >&2; exit 1 ;;
esac

case "$OS" in
  linux|darwin) ;;
  *) echo "Unsupported OS: $OS" >&2; exit 1 ;;
esac

TARGET="${OS}-${ARCH}"

# Resolve version
if [ -z "${VERSION:-}" ]; then
  VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
    | grep '"tag_name"' | cut -d'"' -f4)
fi

echo "Installing changelog.sh ${VERSION} (${TARGET})…"

URL="https://github.com/${REPO}/releases/download/${VERSION}/${BINARY}-${TARGET}"
TMP=$(mktemp)

curl -fsSL "$URL" -o "$TMP"
chmod +x "$TMP"

if [ -w "$INSTALL_DIR" ]; then
  mv "$TMP" "${INSTALL_DIR}/${BINARY}"
else
  sudo mv "$TMP" "${INSTALL_DIR}/${BINARY}"
fi

echo ""
echo "✓ Installed to ${INSTALL_DIR}/${BINARY}"
echo ""
echo "Quick start:"
echo "  export BETTER_AUTH_SECRET=\$(openssl rand -hex 32)"
echo "  export ADMIN_EMAIL=admin@example.com"
echo "  export ADMIN_PASSWORD=yourpassword"
echo "  changelog"
