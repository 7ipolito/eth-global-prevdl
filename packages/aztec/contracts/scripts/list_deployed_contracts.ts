/**
 * Script para listar contratos deployados no sandbox
 */

import { createAztecNodeClient } from "@aztec/aztec.js/node";
import { createLogger } from "@aztec/aztec.js/log";
import fs from 'fs';
import path from 'path';

async function main() {
    const logger = createLogger('aztec:list-contracts');
    const nodeUrl = process.env.AZTEC_NODE_URL || 'http://localhost:8080';
    
    logger.info(`🔍 Listando contratos deployados no sandbox...`);
    logger.info(`   Node URL: ${nodeUrl}`);
    logger.info('');
    
    try {
        // Conectar ao node
        const node = createAztecNodeClient(nodeUrl);
        
        // Verificar status do node
        const status = await node.getStatus();
        logger.info(`✅ Node conectado: Chain ID ${status.chainId}`);
        logger.info(`   Chain Version: ${status.chainVersion}`);
        logger.info('');
        
        // Obter informações do chain
        logger.info('📡 Buscando informações da chain...');
        
        // Tentar obter o último bloco para ver transações
        try {
            const latestBlock = await node.getBlockNumber();
            logger.info(`   Latest Block: ${latestBlock}`);
        } catch (e) {
            logger.warn('   Não foi possível obter número do bloco');
        }
        
        logger.info('');
        logger.info('📋 Contratos no Aztec Sandbox:');
        logger.info('');
        logger.info('ℹ️  No Aztec Sandbox, os contratos são armazenados no próprio node.');
        logger.info('   Para verificar se um contrato específico existe, use:');
        logger.info('   yarn check-contract <address>');
        logger.info('');
        logger.info('💡 Para deployar os contratos PREVDL:');
        logger.info('   yarn deploy-prevdl');
        logger.info('');
        logger.info('💾 O script de deploy salva os endereços em:');
        logger.info('   config/deployed.json');
        logger.info('');
        
        // Verificar se existe arquivo deployed.json
        const deployedPath = path.resolve(process.cwd(), 'config/deployed.json');
        if (fs.existsSync(deployedPath)) {
            logger.info('✅ Arquivo deployed.json encontrado:');
            const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf-8'));
            logger.info(JSON.stringify(deployed, null, 2));
            logger.info('');
            logger.info('Para usar esses endereços:');
            logger.info(`   export AD_TARGETING_ADDRESS=${deployed.contracts.adTargeting}`);
            logger.info(`   export AD_AUCTION_ADDRESS=${deployed.contracts.adAuction}`);
        } else {
            logger.warn('⚠️  Arquivo deployed.json não encontrado!');
            logger.warn('   Isso significa que os contratos ainda não foram deployados.');
            logger.warn('   Execute: yarn deploy-prevdl');
        }
        
    } catch (error: any) {
        logger.error(`❌ Erro ao conectar ao node: ${error?.message || error}`);
        logger.error('');
        logger.error('Verifique:');
        logger.error('1. Sandbox está rodando? curl http://localhost:8080/status');
        logger.error('2. URL do node está correta?');
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});

