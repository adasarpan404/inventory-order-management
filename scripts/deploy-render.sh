#!/usr/bin/env bash
set -euo pipefail

# Render deployment helper for Inventory & Order Management System
#
# Prerequisites:
#   1. Render account: https://dashboard.render.com/register
#   2. GitHub repo connected to Render
#   3. Render CLI installed and logged in: render login
#
# Quick deploy (Blueprint — recommended):
#   1. Open https://dashboard.render.com/blueprints
#   2. Click "New Blueprint Instance"
#   3. Connect GitHub repo: adasarpan404/inventory-order-management
#   4. When prompted, set:
#        CORS_ORIGINS  = https://inventory-frontend.onrender.com
#        VITE_API_URL  = https://inventory-backend.onrender.com/api
#   5. Click "Apply" and wait for deploy (~5-10 min)
#
# After deploy, update CORS_ORIGINS if your frontend URL differs.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="${HOME}/.local/bin:${PATH}"

echo "==> Validating render.yaml"
render blueprints validate "${ROOT_DIR}/render.yaml" -o text

echo ""
echo "==> Blueprint is valid."
echo ""
echo "Deploy via Dashboard:"
echo "  https://dashboard.render.com/blueprints"
echo ""
echo "Repo: https://github.com/adasarpan404/inventory-order-management"
echo ""
echo "After deployment, your URLs will be:"
echo "  Backend:  https://inventory-backend.onrender.com"
echo "  Frontend: https://inventory-frontend.onrender.com"
echo "  API Docs: https://inventory-backend.onrender.com/docs"