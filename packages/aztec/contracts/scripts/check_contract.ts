/**
 * Script para verificar se um contrato existe no sandbox
 */

import { createAztecNodeClient } from "@aztec/aztec.js/node";
import { AztecAddress } from "@aztec/stdlib/aztec-address";
import { Logger, createLogger } from "@aztec/aztec.js/log";

async function main() {
    const logger = createLogger('aztec:check-contract');
    const nodeUrl = process.env.AZTEC_NODE_URL || 'http://localhost:8080';
    
    // Pegar endereço do argumento ou variável de ambiente
    const contractAddress = process.argv[2] || process.env.CONTRACT_ADDRESS;
    
    if (!contractAddress) {
        logger.error('❌ Por favor, forneça o endereço do contrato:');
        logger.error('   node scripts/check_contract.ts <address>');
        logger.error('   ou');
        logger.error('   CONTRACT_ADDRESS=0x... node scripts/check_contract.ts');
        process.exit(1);
    }
    
    logger.info(`🔍 Verificando contrato no sandbox...`);
    logger.info(`   Node URL: ${nodeUrl}`);
    logger.info(`   Contract Address: ${contractAddress}`);
    logger.info('');
    
    try {
        // Conectar ao node
        const node = createAztecNodeClient(nodeUrl);
        
        // Verificar status do node
        const status = await node.getStatus();
        logger.info(`✅ Node conectado: Chain ID ${status.chainId}`);
        logger.info('');
        
        // Converter endereço
        const address = AztecAddress.fromString(contractAddress);
        
        // Tentar obter o contrato
        logger.info('📡 Buscando contrato no node...');
        const contractInstance = await node.getContract(address);
        
        if (contractInstance) {
            logger.info('✅ Contrato encontrado!');
            logger.info('');
            logger.info('📋 Detalhes do contrato:');
            logger.info(`   Address: ${contractInstance.address}`);
            logger.info(`   Contract Class ID: ${contractInstance.contractClassId}`);
            logger.info(`   Initialization Hash: ${contractInstance.initializationHash}`);
            logger.info(`   Public Keys Hash: ${contractInstance.publicKeysHash}`);
        } else {
            logger.error('❌ Contrato NÃO encontrado no node!');
            logger.error('');
            logger.error('Possíveis causas:');
            logger.error('1. Contrato não foi deployado ainda');
            logger.error('2. Endereço está incorreto');
            logger.error('3. Contrato foi deployado em outro node/sandbox');
            logger.error('');
            logger.error('Solução:');
            logger.error('1. Verifique se o sandbox está rodando: curl http://localhost:8080/status');
            logger.error('2. Deploy o contrato: yarn deploy-prevdl');
            logger.error('3. Verifique o endereço no arquivo config/deployed.json');
            process.exit(1);
        }
    } catch (error: any) {
        logger.error(`❌ Erro ao verificar contrato: ${error?.message || error}`);
        logger.error('');
        logger.error('Verifique:');
        logger.error('1. Sandbox está rodando? curl http://localhost:8080/status');
        logger.error('2. Endereço está no formato correto? (0x seguido de 64 caracteres hex)');
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});

