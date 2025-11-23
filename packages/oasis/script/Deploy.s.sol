// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/PrevDLAds.sol";
import "../src/Types.sol";

/**
 * @title DeployPrevDLAds
 * @notice Script para deploy do contrato PrevDLAds na Oasis Sapphire
 * @dev Suporta múltiplos ambientes: local, testnet, mainnet
 * 
 * USAGE:
 * 
 * 1. Local (Sapphire Local Dev):
 *    forge script script/Deploy.s.sol:DeployPrevDLAds --broadcast --rpc-url http://localhost:8545
 * 
 * 2. Testnet (Sapphire Testnet):
 *    forge script script/Deploy.s.sol:DeployPrevDLAds --broadcast --rpc-url $SAPPHIRE_TESTNET_RPC --private-key $PRIVATE_KEY --verify
 * 
 * 3. Mainnet (Sapphire Mainnet):
 *    forge script script/Deploy.s.sol:DeployPrevDLAds --broadcast --rpc-url $SAPPHIRE_MAINNET_RPC --private-key $PRIVATE_KEY --verify
 * 
 * IMPORTANT:
 * - Este contrato DEVE ser deployado na Oasis Sapphire para funcionar corretamente
 * - A criptografia confidencial requer o ambiente TEE do Sapphire
 * - Não funciona em outras chains EVM regulares
 */
contract DeployPrevDLAds is Script {
    
    function run() external {
        // Obter private key do ambiente
        // Pode ser passada via --private-key no comando forge (recomendado)
        // Ou via PRIVATE_KEY no .env como string hex (0x...)
        uint256 deployerPrivateKey;
        
        // Tentar ler como string hex primeiro (formato mais comum)
        try vm.envString("PRIVATE_KEY") returns (string memory keyStr) {
            // Adicionar prefixo 0x se não tiver
            bytes memory keyBytes = bytes(keyStr);
            string memory hexKey = keyStr;
            if (keyBytes.length < 2 || keyBytes[0] != '0' || keyBytes[1] != 'x') {
                // Adicionar prefixo 0x
                hexKey = string(abi.encodePacked("0x", keyStr));
            }
            // Converter string hex para uint256
            deployerPrivateKey = vm.parseUint(hexKey);
        } catch {
            // Se falhar, tentar ler como uint256 (para compatibilidade)
            deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        }
        
        console.log("========================================");
        console.log("Deploying PrevDL Ads on Oasis Sapphire");
        console.log("========================================");
        console.log("");
        
        // Começar broadcast
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy do contrato principal
        console.log("1. Deploying PrevDLAds contract...");
        PrevDLAds prevdlAds = new PrevDLAds();
        
        console.log("   [OK] PrevDLAds deployed at:", address(prevdlAds));
        console.log("   [OK] Owner:", prevdlAds.owner());
        console.log("");
        
        // Verificar estado inicial
        console.log("2. Verifying initial state...");
        console.log("   - Total campaigns:", prevdlAds.getTotalCampaigns());
        console.log("   - Next campaign ID:", prevdlAds.nextCampaignId());
        console.log("");
        
        vm.stopBroadcast();
        
        // Salvar endereço deployado
        _saveDeployment(address(prevdlAds));
        
        console.log("========================================");
        console.log("[OK] Deployment completed successfully!");
        console.log("========================================");
        console.log("");
        console.log("Contract addresses:");
        console.log("   PrevDLAds:", address(prevdlAds));
        console.log("");
        console.log("Privacy Features Enabled:");
        console.log("   - Encrypted user profiles");
        console.log("   - Private ad matching");
        console.log("   - Confidential computations");
        console.log("   - Privacy-preserving analytics");
        console.log("");
        console.log("Next steps:");
        console.log("   1. Verify contract on explorer (if testnet/mainnet)");
        console.log("   2. Update frontend with contract address");
        console.log("   3. Test with real user profiles");
        console.log("   4. Create first ad campaign!");
        console.log("");
    }
    
    /**
     * @dev Salvar endereço do deployment em arquivo JSON
     */
    function _saveDeployment(address contractAddress) internal {
        // Detectar ambiente baseado no chainId
        uint256 chainId = block.chainid;
        string memory environment;
        
        if (chainId == 23295) {
            environment = "sapphire-testnet";
        } else if (chainId == 23294) {
            environment = "sapphire-mainnet";
        } else if (chainId == 31337) {
            environment = "local";
        } else {
            environment = "unknown";
        }
        
        // Criar JSON com informações do deployment
        string memory json = string(abi.encodePacked(
            '{\n',
            '  "chainId": ', vm.toString(chainId), ',\n',
            '  "environment": "', environment, '",\n',
            '  "prevdlAds": "', vm.toString(contractAddress), '",\n',
            '  "deployedAt": ', vm.toString(block.timestamp), ',\n',
            '  "blockNumber": ', vm.toString(block.number), '\n',
            '}'
        ));
        
        // Salvar em arquivo (usar broadcast path que é permitido)
        string memory outputPath = string(abi.encodePacked(
            "./deployments/",
            environment,
            "-deployment.json"
        ));
        
        // Tentar salvar, mas não falhar se não conseguir
        try vm.writeFile(outputPath, json) {
        console.log("[INFO] Deployment info saved to:", outputPath);
        } catch {
            console.log("[WARN] Could not save deployment info to file");
            console.log("[INFO] Contract deployed at:", vm.toString(contractAddress));
        }
    }
}

/**
 * @title DeployWithTestData
 * @notice Deploy com dados de teste para desenvolvimento
 * @dev Cria campanhas e perfis de exemplo
 */
contract DeployWithTestData is Script {
    
    function run() external {
        // Obter private key do ambiente
        uint256 deployerPrivateKey;
        
        // Tentar ler como uint256 (forge converte hex string automaticamente)
        try vm.envUint("PRIVATE_KEY") returns (uint256 key) {
            deployerPrivateKey = key;
        } catch {
            // Se falhar, tentar ler como string e converter
            string memory keyStr = vm.envString("PRIVATE_KEY");
            // Adicionar prefixo 0x se não tiver
            bytes memory keyBytes = bytes(keyStr);
            string memory hexKey = keyStr;
            if (keyBytes.length < 2 || keyBytes[0] != '0' || keyBytes[1] != 'x') {
                // Adicionar prefixo 0x
                hexKey = string(abi.encodePacked("0x", keyStr));
            }
            // Converter string hex para uint256
            deployerPrivateKey = vm.parseUint(hexKey);
        }
        
        console.log("========================================");
        console.log("Deploying with Test Data");
        console.log("========================================");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy contrato
        PrevDLAds prevdlAds = new PrevDLAds();
        console.log("[OK] Contract deployed at:", address(prevdlAds));
        
        // Criar campanha de teste #1: Tech/Crypto
        console.log("\n[INFO] Creating test campaign #1: Tech & Crypto...");
        Types.AdTargeting memory targeting1 = Types.AdTargeting({
            targetAgeMin: 20,
            targetAgeMax: 35,
            targetLocation: Types.Location.SAO_PAULO,
            targetProfession: Types.Profession.SOFTWARE_ENGINEER,
            targetInterest: Types.Interest.TECH,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaign1 = prevdlAds.createCampaign(
            keccak256("Tech Conference 2025"),
            "https://techconf2025.com",
            targeting1,
            10000 ether,  // 10k USDC budget
            1000 ether,   // 1k daily
            0.01 ether,   // impression bid
            0.1 ether     // click bid
        );
        console.log("   Campaign ID:", campaign1);
        
        // Criar campanha de teste #2: Gaming
        console.log("\n[INFO] Creating test campaign #2: Gaming...");
        Types.AdTargeting memory targeting2 = Types.AdTargeting({
            targetAgeMin: 18,
            targetAgeMax: 30,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.GAMING,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaign2 = prevdlAds.createCampaign(
            keccak256("Gaming Tournament"),
            "https://gaming-tournament.com",
            targeting2,
            5000 ether,
            500 ether,
            0.015 ether,
            0.15 ether
        );
        console.log("   Campaign ID:", campaign2);
        
        // Criar campanha de teste #3: Broad (todos)
        console.log("\n[INFO] Creating test campaign #3: Broad Targeting...");
        Types.AdTargeting memory targeting3 = Types.AdTargeting({
            targetAgeMin: 0,
            targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaign3 = prevdlAds.createCampaign(
            keccak256("Universal Product"),
            "https://universal-product.com",
            targeting3,
            20000 ether,
            2000 ether,
            0.005 ether,
            0.05 ether
        );
        console.log("   Campaign ID:", campaign3);
        
        vm.stopBroadcast();
        
        console.log("\n========================================");
        console.log("[OK] Test deployment completed!");
        console.log("========================================");
        console.log("\nSummary:");
        console.log("   - Contract:", address(prevdlAds));
        console.log("   - Total campaigns:", prevdlAds.getTotalCampaigns());
        console.log("");
        console.log("Test campaigns created:");
        console.log("   1. Tech Conference (ID:", campaign1, ")");
        console.log("   2. Gaming Tournament (ID:", campaign2, ")");
        console.log("   3. Universal Product (ID:", campaign3, ")");
        console.log("");
    }
}
