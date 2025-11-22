#!/bin/bash
# Post-build script to reorganize dist/ folder

echo "📦 Reorganizing dist/ folder..."

cd "$(dirname "$0")/.."

# Move SDK files to root of dist/
if [ -d "dist/sdk/src" ]; then
  mv dist/sdk/src/* dist/
  rm -rf dist/sdk
  echo "✅ Moved SDK files to dist/ root"
fi

# Keep Aztec artifacts in a subfolder
if [ -d "dist/aztec" ]; then
  echo "✅ Aztec artifacts kept in dist/aztec/"
fi

echo "📋 Final structure:"
ls -la dist/

echo "✅ Post-build complete!"

