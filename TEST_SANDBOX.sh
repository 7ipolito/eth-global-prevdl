#!/bin/bash

# Script para testar PREVDL no Aztec Sandbox
# Uso: ./TEST_SANDBOX.sh

set -e

echo "============================================================"
echo "PREVDL - Teste no Aztec Sandbox"
echo "============================================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Docker está rodando
echo "🔍 Verificando Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando!${NC}"
    echo "Por favor, inicie o Docker e tente novamente."
    exit 1
fi
echo -e "${GREEN}✅ Docker está rodando${NC}"
echo ""

# Verificar se Aztec Sandbox está rodando
echo "🔍 Verificando Aztec Sandbox..."
if ! curl -s http://localhost:8080/status > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Aztec Sandbox não está rodando${NC}"
    echo ""
    echo "Iniciando Aztec Sandbox..."
    echo "Por favor, em outro terminal, execute:"
    echo "  cd packages/aztec/contracts"
    echo "  aztec sandbox"
    echo ""
    echo "Depois que o sandbox estiver pronto, execute este script novamente."
    exit 1
fi
echo -e "${GREEN}✅ Aztec Sandbox está rodando${NC}"
echo ""

# Compilar contratos
echo "📦 Compilando contratos..."
cd packages/aztec/contracts
yarn compile
echo -e "${GREEN}✅ Contratos compilados${NC}"
echo ""

# Gerar artifacts TypeScript
echo "🔧 Gerando artifacts TypeScript..."
yarn codegen
echo -e "${GREEN}✅ Artifacts gerados${NC}"
echo ""

# Deploy contratos
echo "🚀 Fazendo deploy dos contratos..."
yarn deploy-prevdl
echo ""

# Ler endereços do arquivo de deploy
if [ -f "config/deployed.json" ]; then
    echo "📋 Endereços dos contratos deployados:"
    cat config/deployed.json | grep -A 4 "contracts"
    echo ""
    
    # Extrair endereços
    AD_TARGETING=$(cat config/deployed.json | grep -o '"adTargeting": "[^"]*"' | cut -d'"' -f4)
    AD_AUCTION=$(cat config/deployed.json | grep -o '"adAuction": "[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$AD_TARGETING" ] && [ -n "$AD_AUCTION" ]; then
        echo "✅ Endereços extraídos:"
        echo "   AD_TARGETING_ADDRESS=$AD_TARGETING"
        echo "   AD_AUCTION_ADDRESS=$AD_AUCTION"
        echo ""
        
        # Testar com SDK
        echo "🧪 Testando com SDK..."
        cd ../../sdk
        
        export AD_TARGETING_ADDRESS=$AD_TARGETING
        export AD_AUCTION_ADDRESS=$AD_AUCTION
        export PREVDL_MODE=sandbox
        export AZTEC_NODE_URL=http://localhost:8080
        
        bun run example:sandbox
        
        echo ""
        echo -e "${GREEN}✅ Teste completo!${NC}"
    else
        echo -e "${RED}❌ Não foi possível extrair endereços${NC}"
        echo "Por favor, verifique o arquivo config/deployed.json"
    fi
else
    echo -e "${RED}❌ Arquivo config/deployed.json não encontrado${NC}"
    echo "O deploy pode ter falhado. Verifique os logs acima."
fi

echo ""
echo "============================================================"
echo "Para testar novamente, execute:"
echo "  export AD_TARGETING_ADDRESS=$AD_TARGETING"
echo "  export AD_AUCTION_ADDRESS=$AD_AUCTION"
echo "  export PREVDL_MODE=sandbox"
echo "  cd packages/sdk && bun run example:sandbox"
echo "============================================================"

