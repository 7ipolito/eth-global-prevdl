#!/bin/bash
# Script para usar os endereços do deployed.json

DEPLOYED_JSON="packages/aztec/contracts/config/deployed.json"

if [ ! -f "$DEPLOYED_JSON" ]; then
    echo "❌ Arquivo deployed.json não encontrado!"
    echo "   Execute: cd packages/aztec/contracts && yarn deploy-prevdl"
    exit 1
fi

echo "📋 Carregando endereços de $DEPLOYED_JSON"
echo ""

# Extrair endereços
if command -v jq >/dev/null 2>&1; then
    AD_TARGETING=$(jq -r '.contracts.adTargeting' "$DEPLOYED_JSON")
    AD_AUCTION=$(jq -r '.contracts.adAuction' "$DEPLOYED_JSON")
    NETWORK=$(jq -r '.network' "$DEPLOYED_JSON")
    TIMESTAMP=$(jq -r '.timestamp' "$DEPLOYED_JSON")
else
    AD_TARGETING=$(grep -o '"adTargeting": "[^"]*"' "$DEPLOYED_JSON" | cut -d'"' -f4)
    AD_AUCTION=$(grep -o '"adAuction": "[^"]*"' "$DEPLOYED_JSON" | cut -d'"' -f4)
    NETWORK="sandbox"
    TIMESTAMP="unknown"
fi

echo "📊 Informações do Deploy:"
echo "   Network: $NETWORK"
echo "   Timestamp: $TIMESTAMP"
echo ""
echo "📍 Endereços dos Contratos:"
echo "   AdTargeting: $AD_TARGETING"
echo "   AdAuction: $AD_AUCTION"
echo ""

# Exportar variáveis
export AD_TARGETING_ADDRESS="$AD_TARGETING"
export AD_AUCTION_ADDRESS="$AD_AUCTION"
export PREVDL_MODE=sandbox
export AZTEC_NODE_URL=http://localhost:8080

echo "✅ Variáveis de ambiente configuradas!"
echo ""
echo "💡 Lembre-se:"
echo "   - Os contratos estão no Aztec Sandbox (node)"
echo "   - Este arquivo contém apenas os endereços"
echo "   - Certifique-se que o sandbox está rodando!"
echo ""
echo "🧪 Para testar:"
echo "   cd packages/sdk"
echo "   npm run example:sandbox"
