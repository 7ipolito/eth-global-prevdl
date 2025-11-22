#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMP_DIR="$PROJECT_ROOT/.temp_compile"

echo "🔨 Compiling PREVDL contracts..."
echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Temp dir: $TEMP_DIR"

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up temp directory..."
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Remove temp dir if it exists
rm -rf "$TEMP_DIR"

# Compile AdTargeting in isolated temp directory
echo ""
echo "📦 Compiling AdTargeting..."
mkdir -p "$TEMP_DIR/ad_targeting/src"
cp "$PROJECT_ROOT/src/ad_targeting.nr" "$TEMP_DIR/ad_targeting/src/main.nr"
cat > "$TEMP_DIR/ad_targeting/Nargo.toml" <<EOF
[package]
name = "ad_targeting"
type = "contract"
authors = [ "" ]
compiler_version = ">=0.18.0"

[dependencies]
aztec = { git = "https://github.com/AztecProtocol/aztec-packages/", tag = "v3.0.0-devnet.5", directory = "noir-projects/aztec-nr/aztec" }
EOF

cd "$TEMP_DIR/ad_targeting"
# Temporarily rename parent Nargo.toml to avoid interference
if [ -f "$PROJECT_ROOT/Nargo.toml" ]; then
    mv "$PROJECT_ROOT/Nargo.toml" "$PROJECT_ROOT/Nargo.toml.bak"
fi
aztec-nargo compile
# Restore parent Nargo.toml
if [ -f "$PROJECT_ROOT/Nargo.toml.bak" ]; then
    mv "$PROJECT_ROOT/Nargo.toml.bak" "$PROJECT_ROOT/Nargo.toml"
fi
cd "$PROJECT_ROOT"

# Compile AdAuction in isolated temp directory
echo ""
echo "📦 Compiling AdAuction..."
mkdir -p "$TEMP_DIR/ad_auction/src"
cp "$PROJECT_ROOT/src/ad_auction.nr" "$TEMP_DIR/ad_auction/src/main.nr"
cat > "$TEMP_DIR/ad_auction/Nargo.toml" <<EOF
[package]
name = "ad_auction"
type = "contract"
authors = [ "" ]
compiler_version = ">=0.18.0"

[dependencies]
aztec = { git = "https://github.com/AztecProtocol/aztec-packages/", tag = "v3.0.0-devnet.5", directory = "noir-projects/aztec-nr/aztec" }
EOF

cd "$TEMP_DIR/ad_auction"
# Temporarily rename parent Nargo.toml to avoid interference
if [ -f "$PROJECT_ROOT/Nargo.toml" ]; then
    mv "$PROJECT_ROOT/Nargo.toml" "$PROJECT_ROOT/Nargo.toml.bak"
fi
aztec-nargo compile
# Restore parent Nargo.toml
if [ -f "$PROJECT_ROOT/Nargo.toml.bak" ]; then
    mv "$PROJECT_ROOT/Nargo.toml.bak" "$PROJECT_ROOT/Nargo.toml"
fi
cd "$PROJECT_ROOT"

# Copy compiled contracts to main target directory
echo ""
echo "📋 Copying compiled contracts to target/..."
mkdir -p target

# Find and copy AdTargeting
AD_TARGETING_FILE=$(find "$TEMP_DIR/ad_targeting/target" -name "*.json" | head -1)
if [ -n "$AD_TARGETING_FILE" ]; then
    cp "$AD_TARGETING_FILE" target/
    echo "✅ Copied AdTargeting: $(basename "$AD_TARGETING_FILE")"
else
    echo "❌ AdTargeting compilation artifact not found!"
    exit 1
fi

# Find and copy AdAuction
AD_AUCTION_FILE=$(find "$TEMP_DIR/ad_auction/target" -name "*.json" | head -1)
if [ -n "$AD_AUCTION_FILE" ]; then
    cp "$AD_AUCTION_FILE" target/
    echo "✅ Copied AdAuction: $(basename "$AD_AUCTION_FILE")"
else
    echo "❌ AdAuction compilation artifact not found!"
    exit 1
fi

# Post-process all contracts
echo ""
echo "🔄 Post-processing contracts..."
aztec-postprocess-contract

# Generate TypeScript artifacts
echo ""
echo "📝 Generating TypeScript artifacts..."
aztec codegen target --outdir src/artifacts

echo ""
echo "✅ All contracts compiled successfully!"
echo ""
echo "📋 Compiled contracts in target/:"
ls -la target/*.json 2>/dev/null | awk '{print "  - " $9}' || echo "  (none found)"
echo ""
echo "📋 Generated artifacts in src/artifacts/:"
ls -la src/artifacts/*.ts 2>/dev/null | awk '{print "  - " $9}' || echo "  (none found)"

