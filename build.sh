#!/usr/bin/env bash
# ================================================================
# Studio SVB — Build script (v2.1)
# Rebuild /assets/tailwind.css avec purge des classes non utilisées.
# Prérequis: télécharger le binaire standalone Tailwind une fois.
# ================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

TAILWIND_VERSION="${TAILWIND_VERSION:-v3.4.17}"
TAILWIND_BIN="${TAILWIND_BIN:-$HOME/.local/bin/tailwindcss}"

# Détection de plateforme (macos-arm64 / macos-x64 / linux-x64)
detect_platform() {
  local os arch
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"
  case "$os-$arch" in
    darwin-arm64) echo "macos-arm64" ;;
    darwin-x86_64) echo "macos-x64" ;;
    linux-x86_64)  echo "linux-x64" ;;
    linux-aarch64) echo "linux-arm64" ;;
    *) echo "unsupported"; return 1 ;;
  esac
}

# Installation one-shot du binaire standalone
install_tailwind() {
  mkdir -p "$(dirname "$TAILWIND_BIN")"
  local platform
  platform=$(detect_platform)
  local url="https://github.com/tailwindlabs/tailwindcss/releases/download/${TAILWIND_VERSION}/tailwindcss-${platform}"
  echo "→ Téléchargement Tailwind ${TAILWIND_VERSION} (${platform})…"
  curl -sSL -o "$TAILWIND_BIN" "$url"
  chmod +x "$TAILWIND_BIN"
  echo "✓ Tailwind installé dans $TAILWIND_BIN"
}

# Créer la config Tailwind minimale si absente
ensure_config() {
  if [ ! -f "tailwind.config.js" ]; then
    cat > tailwind.config.js <<'EOF'
module.exports = {
  content: ['./*.html', './blog/*.html', './assets/*.js'],
  theme: {
    extend: {
      colors: {
        'svb-green-light': '#98D0B3',
        'svb-green-dark':  '#4A8D84',
        'svb-sand':        '#F2E6CF',
        'svb-peach':       '#E8B496',
        'svb-text':        '#2F4F4F',
      },
      fontFamily: {
        'sans':  ['Montserrat','sans-serif'],
        'hand':  ['Dancing Script','cursive'],
        'vibes': ['Great Vibes','cursive'],
      },
    },
  },
};
EOF
    echo "✓ tailwind.config.js créé"
  fi
}

ensure_input() {
  mkdir -p assets
  if [ ! -f "assets/tailwind-input.css" ]; then
    cat > assets/tailwind-input.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
    echo "✓ assets/tailwind-input.css créé"
  fi
}

prepare_publish() {
  local publish_dir="$ROOT/dist"
  mkdir -p "$publish_dir"

  # Le site est statique : on publie uniquement les pages et leurs ressources.
  # Les scripts, exports et fichiers de travail restent hors ligne.
  rsync -a --delete \
    --exclude='/dist/' \
    --include='/*.html' \
    --include='/_headers' \
    --include='/_redirects' \
    --include='/robots.txt' \
    --include='/sitemap.xml' \
    --include='/site.webmanifest' \
    --include='/service-worker.js' \
    --include='/admin/' --include='/admin/**' \
    --include='/assets/' --include='/assets/**' \
    --include='/blog/' --include='/blog/**' \
    --include='/en/' --include='/en/**' \
    --include='/images/' --include='/images/**' \
    --include='/videos/' --include='/videos/**' \
    --exclude='*' \
    "$ROOT/" "$publish_dir/"

  echo "✓ Dossier de publication propre : dist/"
}

main() {
  # 1. Build content (CMS markdown → HTML + JSON feeds)
  if [ -x "scripts/build-content.py" ] && command -v python3 >/dev/null 2>&1; then
    echo "→ Build content (CMS)…"
    python3 scripts/build-content.py
    echo ""
  fi

  # 2. Tailwind (dépend du contenu car les articles générés contiennent des classes)
  [ -x "$TAILWIND_BIN" ] || install_tailwind
  ensure_config
  ensure_input

  echo "→ Build Tailwind (purge + minify)…"
  "$TAILWIND_BIN" \
    -c tailwind.config.js \
    -i assets/tailwind-input.css \
    -o assets/tailwind.css \
    --minify

  echo ""
  echo "✓ assets/tailwind.css construit :"
  ls -lh assets/tailwind.css | awk '{print "  "$5"  "$9}'

  echo ""
  echo "→ Préparation des fichiers publics…"
  prepare_publish
}

main "$@"
