#!/bin/bash
set -e

echo "🏖️  Configurando Aztec Sandbox..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar se aztec está instalado
if ! command_exists aztec; then
    echo -e "${RED}❌ Aztec CLI não encontrado!${NC}"
    echo ""
    echo "Instale com:"
    echo "  bash -i <(curl -s https://install.aztec.network)"
    exit 1
fi

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando!${NC}"
    echo "Inicie o Docker e tente novamente."
    exit 1
fi

echo -e "${GREEN}✅ Docker está rodando${NC}"

# Verificar versão atual
echo ""
echo "📋 Verificando versões atuais..."
AZTEC_VERSION=$(aztec --version 2>&1 | head -1 || echo "unknown")
echo "   Aztec CLI: $AZTEC_VERSION"

# Perguntar se quer atualizar
echo ""
read -p "Deseja atualizar o Aztec para a versão mais recente? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Atualizando Aztec..."
    aztec-up
    echo -e "${GREEN}✅ Aztec atualizado${NC}"
fi

# Verificar se sandbox já está rodando
echo ""
echo "🔍 Verificando se sandbox já está rodando..."
if curl -s http://localhost:8080/status >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Sandbox já está rodando na porta 8080${NC}"
    read -p "Deseja parar e reiniciar? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🛑 Parando sandbox..."
        aztec stop || true
        sleep 2
    else
        echo "✅ Usando sandbox existente"
        exit 0
    fi
fi

# Perguntar se quer habilitar proving
echo ""
read -p "Deseja habilitar client-side proving? (mais lento, mas mais realista) (y/n) " -n 1 -r
echo
PROVING_FLAG=""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    PROVING_FLAG="PXE_PROVER_ENABLED=1"
    echo -e "${YELLOW}⚠️  Proving habilitado - primeira execução pode levar vários minutos${NC}"
fi

# Iniciar sandbox
echo ""
echo "🚀 Iniciando sandbox..."
echo "   URL: http://localhost:8080"
if [ -n "$PROVING_FLAG" ]; then
    echo "   Modo: Com proving habilitado"
else
    echo "   Modo: Sem proving (mais rápido)"
fi
echo ""

$PROVING_FLAG aztec start --sandbox &
SANDBOX_PID=$!

# Aguardar sandbox iniciar
echo "⏳ Aguardando sandbox iniciar..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:8080/status >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Sandbox está rodando!${NC}"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "   Tentativa $ATTEMPT/$MAX_ATTEMPTS..."
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}❌ Sandbox não iniciou a tempo${NC}"
    echo "Verifique os logs com: docker logs aztec-sandbox"
    exit 1
fi

# Mostrar status
echo ""
echo "📊 Status do Sandbox:"
curl -s http://localhost:8080/status | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8080/status

echo ""
echo -e "${GREEN}🎉 Sandbox configurado e rodando!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Compilar contratos:"
echo "   cd packages/aztec/contracts"
echo "   yarn compile-prevdl"
echo "   yarn codegen"
echo ""
echo "2. Deploy contratos:"
echo "   yarn deploy-prevdl"
echo ""
echo "3. Configurar SDK:"
echo "   cd ../../sdk"
echo "   export AD_TARGETING_ADDRESS=0x..."
echo "   export AD_AUCTION_ADDRESS=0x..."
echo "   export PREVDL_MODE=sandbox"
echo ""
echo "4. Testar SDK:"
echo "   npm run example:sandbox"
echo ""
echo "Para parar o sandbox:"
echo "   aztec stop"
echo ""

