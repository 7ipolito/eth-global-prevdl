#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔨 Compiling all PREVDL contracts..."
echo "📁 Project root: $PROJECT_ROOT"

# Compile main contract (PrivateVoting - keeping for compatibility)
echo ""
echo "📦 Compiling PrivateVoting..."
cd "$PROJECT_ROOT"
aztec-nargo compile

# Compile AdTargeting (in isolated directory)
echo ""
echo "📦 Compiling AdTargeting..."
cd "$PROJECT_ROOT/contracts/ad_targeting"
# Remove any parent Nargo.toml interference by using --manifest-path
aztec-nargo compile 2>&1 || {
    echo "⚠️  AdTargeting compilation failed, trying alternative approach..."
    # Try compiling from the directory itself
    cd "$PROJECT_ROOT/contracts/ad_targeting"
    aztec-nargo compile
}
cd "$PROJECT_ROOT"

# Compile AdAuction (in isolated directory)
echo ""
echo "📦 Compiling AdAuction..."
cd "$PROJECT_ROOT/contracts/ad_auction"
aztec-nargo compile 2>&1 || {
    echo "⚠️  AdAuction compilation failed, trying alternative approach..."
    cd "$PROJECT_ROOT/contracts/ad_auction"
    aztec-nargo compile
}
cd "$PROJECT_ROOT"

# Copy compiled contracts to main target directory
echo ""
echo "📋 Copying compiled contracts to target/..."
mkdir -p target

# Find and copy AdTargeting (try different possible names)
AD_TARGETING_FOUND=false
for file in "contracts/ad_targeting/target/ad_targeting-AdTargeting.json" \
            "contracts/ad_targeting/target/"*.json; do
    if [ -f "$file" ] && [[ "$file" != *"private_voting"* ]]; then
        cp "$file" target/
        echo "✅ Copied AdTargeting: $(basename "$file")"
        AD_TARGETING_FOUND=true
        break
    fi
done

# Find and copy AdAuction (try different possible names)
AD_AUCTION_FOUND=false
for file in "contracts/ad_auction/target/ad_auction-AdAuction.json" \
            "contracts/ad_auction/target/"*.json; do
    if [ -f "$file" ] && [[ "$file" != *"private_voting"* ]]; then
        cp "$file" target/
        echo "✅ Copied AdAuction: $(basename "$file")"
        AD_AUCTION_FOUND=true
        break
    fi
done

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
echo "📋 Compiled contracts:"
ls -la target/*.json 2>/dev/null | awk '{print "  - " $9}' || echo "  (none found)"
echo ""
echo "📋 Generated artifacts:"
ls -la src/artifacts/*.ts 2>/dev/null | awk '{print "  - " $9}' || echo "  (none found)"

