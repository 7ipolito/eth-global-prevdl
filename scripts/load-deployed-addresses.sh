#!/bin/bash
# Script para carregar endereços deployados automaticamente

DEPLOYED_JSON="packages/aztec/contracts/config/deployed.json"

if [ ! -f "$DEPLOYED_JSON" ]; then
    echo "❌ Arquivo deployed.json não encontrado!"
    echo "   Execute: cd packages/aztec/contracts && yarn deploy-prevdl"
    exit 1
fi

# Extrair endereços usando jq ou grep
if command -v jq >/dev/null 2>&1; then
    AD_TARGETING=$(jq -r '.contracts.adTargeting' "$DEPLOYED_JSON")
    AD_AUCTION=$(jq -r '.contracts.adAuction' "$DEPLOYED_JSON")
else
    # Fallback para grep/sed
    AD_TARGETING=$(grep -o '"adTargeting": "[^"]*"' "$DEPLOYED_JSON" | cut -d'"' -f4)
    AD_AUCTION=$(grep -o '"adAuction": "[^"]*"' "$DEPLOYED_JSON" | cut -d'"' -f4)
fi

if [ -z "$AD_TARGETING" ] || [ -z "$AD_AUCTION" ]; then
    echo "❌ Não foi possível extrair endereços do deployed.json"
    exit 1
fi

echo "📋 Endereços encontrados em deployed.json:"
echo ""
echo "   AD_TARGETING_ADDRESS=$AD_TARGETING"
echo "   AD_AUCTION_ADDRESS=$AD_AUCTION"
echo ""

# Exportar variáveis
export AD_TARGETING_ADDRESS="$AD_TARGETING"
export AD_AUCTION_ADDRESS="$AD_AUCTION"
export PREVDL_MODE=sandbox
export AZTEC_NODE_URL=http://localhost:8080

echo "✅ Variáveis de ambiente configuradas!"
echo ""
echo "Para usar em outro terminal, execute:"
echo "   source scripts/load-deployed-addresses.sh"
echo ""
echo "Ou copie e cole:"
echo "   export AD_TARGETING_ADDRESS=$AD_TARGETING"
echo "   export AD_AUCTION_ADDRESS=$AD_AUCTION"
echo "   export PREVDL_MODE=sandbox"
echo "   export AZTEC_NODE_URL=http://localhost:8080"

