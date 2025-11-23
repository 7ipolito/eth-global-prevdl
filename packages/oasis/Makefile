# ===========================================
# PrevDL Ads - Oasis Sapphire Makefile
# ===========================================
# 
# Quick commands for building, testing, and deploying
# the PrevDL Ads privacy-preserving advertising system
#
# Prerequisites:
# - Foundry installed (https://book.getfoundry.sh/getting-started/installation)
# - .env file with PRIVATE_KEY configured
#
# ===========================================

.PHONY: help install build test clean deploy-local deploy-testnet deploy-mainnet verify-testnet verify-mainnet

# Default target
help:
	@echo "========================================"
	@echo "PrevDL Ads - Oasis Sapphire Commands"
	@echo "========================================"
	@echo ""
	@echo "🔧 Setup & Build:"
	@echo "  make install          - Install dependencies"
	@echo "  make build            - Compile contracts"
	@echo "  make clean            - Clean build artifacts"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test             - Run all tests"
	@echo "  make test-verbose     - Run tests with verbose output"
	@echo "  make test-gas         - Run tests with gas reports"
	@echo "  make coverage         - Generate test coverage report"
	@echo ""
	@echo "🚀 Deployment:"
	@echo "  make deploy-local     - Deploy to local node"
	@echo "  make deploy-testnet   - Deploy to Sapphire Testnet"
	@echo "  make deploy-mainnet   - Deploy to Sapphire Mainnet"
	@echo "  make deploy-test-data - Deploy with test campaigns"
	@echo ""
	@echo "✅ Verification:"
	@echo "  make verify-testnet   - Verify contract on testnet"
	@echo "  make verify-mainnet   - Verify contract on mainnet"
	@echo ""
	@echo "📊 Analytics:"
	@echo "  make size             - Check contract sizes"
	@echo "  make gas-snapshot     - Create gas snapshot"
	@echo ""
	@echo "🔍 Inspection:"
	@echo "  make inspect          - Show contract info"
	@echo "  make abi              - Generate ABI files"
	@echo ""
	@echo "========================================"

# ===========================================
# SETUP & BUILD
# ===========================================

install:
	@echo "📦 Installing dependencies..."
	forge install
	@echo "✅ Dependencies installed!"

build:
	@echo "🔨 Building contracts..."
	forge build
	@echo "✅ Build complete!"

clean:
	@echo "🧹 Cleaning build artifacts..."
	forge clean
	rm -rf cache out deployments/*.json
	@echo "✅ Clean complete!"

# ===========================================
# TESTING
# ===========================================

test:
	@echo "🧪 Running tests..."
	forge test
	@echo "✅ Tests complete!"

test-verbose:
	@echo "🧪 Running tests (verbose)..."
	forge test -vvv

test-gas:
	@echo "⛽ Running tests with gas reports..."
	forge test --gas-report

coverage:
	@echo "📊 Generating coverage report..."
	forge coverage
	@echo "✅ Coverage report generated!"

# ===========================================
# DEPLOYMENT
# ===========================================

deploy-local:
	@echo "🚀 Deploying to local Sapphire node..."
	@echo "⚠️  Make sure Sapphire local node is running on http://localhost:8545"
	forge script script/Deploy.s.sol:DeployPrevDLAds \
		--rpc-url sapphire_local \
		--broadcast \
		-vvv
	@echo "✅ Deployed to local!"

deploy-testnet:
	@echo "🚀 Deploying to Sapphire Testnet..."
	@echo "📡 Chain: Sapphire Testnet (23295)"
	@echo "🌐 RPC: https://testnet.sapphire.oasis.io"
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "❌ Error: PRIVATE_KEY not set in .env"; \
		echo "💡 Create .env file: cp .env.example .env"; \
		echo "💡 Add PRIVATE_KEY=0x... to .env"; \
		exit 1; \
	fi
	forge script script/Deploy.s.sol:DeployPrevDLAds \
		--rpc-url sapphire_testnet \
		--broadcast \
		--private-key $(PRIVATE_KEY) \
		--verify \
		-vvv
	@echo "✅ Deployed to testnet!"
	@echo "🔍 View on explorer: https://explorer.oasis.io/testnet/sapphire"

deploy-mainnet:
	@echo "🚀 Deploying to Sapphire Mainnet..."
	@echo "⚠️  WARNING: This will deploy to PRODUCTION!"
	@echo "📡 Chain: Sapphire Mainnet (23294)"
	@echo "🌐 RPC: https://sapphire.oasis.io"
	@echo ""
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" != "yes" ]; then \
		echo "❌ Deployment cancelled"; \
		exit 1; \
	fi
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "❌ Error: PRIVATE_KEY not set in .env"; \
		echo "💡 Create .env file: cp .env.example .env"; \
		echo "💡 Add PRIVATE_KEY=0x... to .env"; \
		exit 1; \
	fi
	forge script script/Deploy.s.sol:DeployPrevDLAds \
		--rpc-url sapphire_mainnet \
		--broadcast \
		--private-key $(PRIVATE_KEY) \
		--verify \
		-vvv
	@echo "✅ Deployed to mainnet!"
	@echo "🔍 View on explorer: https://explorer.oasis.io/mainnet/sapphire"

deploy-test-data:
	@echo "🧪 Deploying with test data..."
	forge script script/Deploy.s.sol:DeployWithTestData \
		--rpc-url sapphire_testnet \
		--broadcast \
		-vvv
	@echo "✅ Deployed with test campaigns!"

# ===========================================
# VERIFICATION
# ===========================================

verify-testnet:
	@echo "✅ Verifying contract on Sapphire Testnet..."
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "❌ Error: CONTRACT_ADDRESS not provided"; \
		echo "Usage: make verify-testnet CONTRACT_ADDRESS=0x..."; \
		exit 1; \
	fi
	forge verify-contract \
		$(CONTRACT_ADDRESS) \
		src/PrevDLAds.sol:PrevDLAds \
		--chain-id 23295 \
		--verifier blockscout \
		--verifier-url https://explorer.oasis.io/testnet/sapphire/api
	@echo "✅ Contract verified!"

verify-mainnet:
	@echo "✅ Verifying contract on Sapphire Mainnet..."
	@if [ -z "$(CONTRACT_ADDRESS)" ]; then \
		echo "❌ Error: CONTRACT_ADDRESS not provided"; \
		echo "Usage: make verify-mainnet CONTRACT_ADDRESS=0x..."; \
		exit 1; \
	fi
	forge verify-contract \
		$(CONTRACT_ADDRESS) \
		src/PrevDLAds.sol:PrevDLAds \
		--chain-id 23294 \
		--verifier blockscout \
		--verifier-url https://explorer.oasis.io/mainnet/sapphire/api
	@echo "✅ Contract verified!"

# ===========================================
# ANALYTICS & INSPECTION
# ===========================================

size:
	@echo "📏 Checking contract sizes..."
	forge build --sizes

gas-snapshot:
	@echo "⛽ Creating gas snapshot..."
	forge snapshot
	@echo "✅ Snapshot saved to .gas-snapshot"

inspect:
	@echo "🔍 Contract Information:"
	@echo ""
	@echo "📝 PrevDLAds.sol:"
	@forge inspect src/PrevDLAds.sol:PrevDLAds methods 2>/dev/null || echo "Build contracts first: make build"
	@echo ""
	@echo "Storage Layout:"
	@forge inspect src/PrevDLAds.sol:PrevDLAds storage-layout --pretty 2>/dev/null || echo "Build contracts first: make build"

abi:
	@echo "📋 Generating ABI files..."
	@mkdir -p abi
	@forge inspect src/PrevDLAds.sol:PrevDLAds abi > abi/PrevDLAds.json
	@forge inspect src/Types.sol:Types abi > abi/Types.json 2>/dev/null || true
	@echo "✅ ABI files generated in ./abi/"

# ===========================================
# UTILITY COMMANDS
# ===========================================

format:
	@echo "🎨 Formatting code..."
	forge fmt
	@echo "✅ Code formatted!"

lint:
	@echo "🔍 Linting code..."
	forge fmt --check
	@echo "✅ Linting complete!"

update:
	@echo "⬆️  Updating dependencies..."
	forge update
	@echo "✅ Dependencies updated!"

# ===========================================
# DEVELOPMENT WORKFLOW
# ===========================================

dev: clean install build test
	@echo "✅ Development build complete!"

# Full CI/CD pipeline
ci: clean install build test coverage gas-snapshot
	@echo "✅ CI pipeline complete!"

# Quick iteration cycle
quick: build test
	@echo "✅ Quick build and test complete!"

# ===========================================
# INFORMATION
# ===========================================

info:
	@echo "========================================"
	@echo "PrevDL Ads - Project Information"
	@echo "========================================"
	@echo ""
	@echo "📂 Project Structure:"
	@echo "  src/          - Smart contracts"
	@echo "  test/         - Test files"
	@echo "  script/       - Deployment scripts"
	@echo "  lib/          - Dependencies"
	@echo ""
	@echo "🔗 Oasis Sapphire Networks:"
	@echo "  Testnet:  Chain ID 23295"
	@echo "  Mainnet:  Chain ID 23294"
	@echo ""
	@echo "📚 Resources:"
	@echo "  Docs:     https://docs.oasis.io/build/sapphire/"
	@echo "  Explorer: https://explorer.oasis.io/"
	@echo "  Faucet:   https://faucet.testnet.oasis.io/"
	@echo ""
	@echo "🔐 Privacy Features:"
	@echo "  ✓ Encrypted user profiles"
	@echo "  ✓ Private ad matching"
	@echo "  ✓ Confidential computations (TEE)"
	@echo "  ✓ Privacy-preserving analytics"
	@echo ""
	@echo "========================================"

# ===========================================
# ENVIRONMENT CHECK
# ===========================================

check-env:
	@echo "🔍 Checking environment..."
	@if [ ! -f .env ]; then \
		echo "⚠️  Warning: .env file not found"; \
		echo "💡 Copy .env.example to .env and configure"; \
	else \
		echo "✅ .env file found"; \
	fi
	@if [ -z "$(PRIVATE_KEY)" ]; then \
		echo "⚠️  Warning: PRIVATE_KEY not set"; \
	else \
		echo "✅ PRIVATE_KEY configured"; \
	fi
	@which forge > /dev/null || (echo "❌ Foundry not installed!" && exit 1)
	@echo "✅ Foundry installed: $$(forge --version | head -n1)"
	@echo "✅ Environment check complete!"

# Load .env if it exists
-include .env
export
