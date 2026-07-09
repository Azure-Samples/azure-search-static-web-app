#!/bin/sh
# Inject the backend URL into a runtime config file the SPA reads at load time.
cat > /app/build/config.js <<EOF
window.__APP_CONFIG__ = { BACKEND_URL: "${AZURE_BACKEND_URL:-}" };
EOF
exec serve -s build -l "${PORT:-3000}"
