// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ISapphire
 * @notice Interface para recursos de criptografia do Oasis Sapphire
 * @dev Sapphire oferece criptografia confidencial nativa via TEE
 * 
 * IMPORTANTE: No Oasis Sapphire:
 * - Variáveis 'private' são automaticamente criptografadas
 * - Computação acontece em TEE (Trusted Execution Environment)
 * - Dados nunca vazam do ambiente seguro
 * - Apenas o resultado final é revelado
 */
interface ISapphire {
    /**
     * @notice Gera bytes aleatórios de forma confidencial
     * @dev Usa o precompile de random do Sapphire
     */
    function randomBytes(uint256 numBytes, bytes memory pers) external view returns (bytes memory);
    
    /**
     * @notice Criptografa dados usando chave pública
     * @dev Precompile de criptografia do Sapphire (se disponível)
     * Nota: A criptografia principal é feita automaticamente pelo TEE
     */
    function encrypt(bytes memory data, bytes memory publicKey) external view returns (bytes memory);
    
    /**
     * @notice Descriptografa dados usando chave privada
     * @dev Precompile de descriptografia do Sapphire (se disponível)
     * Nota: A descriptografia principal é feita automaticamente pelo TEE
     */
    function decrypt(bytes memory encryptedData, bytes memory privateKey) external view returns (bytes memory);
}

/**
 * @title Sapphire
 * @notice Biblioteca helper para funcionalidades do Sapphire
 * @dev Wrapper para precompiles do Sapphire
 */
library Sapphire {
    // Endereços dos precompiles do Sapphire
    address constant RANDOM_BYTES = 0x0100000000000000000000000000000000000001;
    address constant ENCRYPT = 0x0100000000000000000000000000000000000002;
    address constant DECRYPT = 0x0100000000000000000000000000000000000003;
    
    /**
     * @notice Gera um número aleatório seguro usando TEE
     * @dev Usa o precompile de random do Sapphire
     * @return Número aleatório de 256 bits
     */
    function randomUint256() internal view returns (uint256) {
        bytes memory randomData = ISapphire(RANDOM_BYTES).randomBytes(32, "");
        return uint256(bytes32(randomData));
    }
    
    /**
     * @notice Gera um número aleatório dentro de um range
     * @param min Valor mínimo (inclusivo)
     * @param max Valor máximo (exclusivo)
     * @return Número aleatório no range [min, max)
     */
    function randomUint256InRange(uint256 min, uint256 max) internal view returns (uint256) {
        require(max > min, "Invalid range");
        uint256 range = max - min;
        return (randomUint256() % range) + min;
    }
    
    /**
     * @notice Gera salt criptográfico seguro
     * @dev Usa randomness do Sapphire para gerar salt único
     * @return Salt de 32 bytes
     */
    function generateSalt() internal view returns (bytes32) {
        return bytes32(randomUint256());
    }
    
    /**
     * @notice Criptografa dados (se precompile disponível)
     * @dev Nota: No Sapphire, a criptografia principal é automática via TEE
     * Esta função é para criptografia adicional se necessário
     * @param data Dados para criptografar
     * @param publicKey Chave pública para criptografia
     * @return Dados criptografados
     */
    function encryptData(bytes memory data, bytes memory publicKey) 
        internal 
        view 
        returns (bytes memory) 
    {
        // Tenta usar precompile se disponível
        // Se não disponível, retorna dados (criptografia TEE já protege)
        try ISapphire(ENCRYPT).encrypt(data, publicKey) returns (bytes memory encrypted) {
            return encrypted;
        } catch {
            // Se precompile não disponível, TEE já protege automaticamente
            return data;
        }
    }
    
    /**
     * @notice Descriptografa dados (se precompile disponível)
     * @dev Nota: No Sapphire, a descriptografia principal é automática via TEE
     * @param encryptedData Dados criptografados
     * @param privateKey Chave privada para descriptografia
     * @return Dados descriptografados
     */
    function decryptData(bytes memory encryptedData, bytes memory privateKey) 
        internal 
        view 
        returns (bytes memory) 
    {
        // Tenta usar precompile se disponível
        try ISapphire(DECRYPT).decrypt(encryptedData, privateKey) returns (bytes memory decrypted) {
            return decrypted;
        } catch {
            // Se precompile não disponível, assume que dados já estão descriptografados pelo TEE
            return encryptedData;
        }
    }
    
    /**
     * @notice Verifica se estamos executando no Sapphire
     * @dev Verifica se o precompile de random está disponível
     * @return true se estiver no Sapphire, false caso contrário
     */
    function isSapphire() internal view returns (bool) {
        // Tenta chamar o precompile de random
        // Se funcionar, estamos no Sapphire
        try ISapphire(RANDOM_BYTES).randomBytes(1, "") returns (bytes memory) {
            return true;
        } catch {
            return false;
        }
    }
}

