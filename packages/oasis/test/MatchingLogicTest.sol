// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PrevDLAds.sol";
import "../src/Types.sol";

/**
 * @title MatchingLogicTest
 * @notice Teste detalhado da lógica de matching para identificar bugs
 */
contract MatchingLogicTest is Test {
    PrevDLAds public prevdlAds;
    
    address public owner = address(1);
    address public advertiser = address(2);
    address public user1 = address(3);
    address public user2 = address(4);
    address public user3 = address(5);

    function setUp() public {
        vm.prank(owner);
        prevdlAds = new PrevDLAds();
    }

    function _setUserProfileHelper(
        address user,
        uint8 age,
        Types.Location location,
        Types.Profession profession,
        Types.Interest[3] memory interests,
        Types.Gender gender
    ) internal {
        vm.prank(user);
        bytes memory encryptedData = abi.encode(age, location, profession, interests, gender);
        bytes32 nonce = keccak256(abi.encodePacked(block.timestamp, user));
        prevdlAds.setUserProfileEncrypted(encryptedData, nonce);
    }

    /**
     * @notice Teste crítico: Verificar se campanha com critérios específicos NÃO faz match com usuários que não atendem
     * Este teste deve FALHAR se houver bug na lógica
     */
    function testCampaign1ShouldNotMatchAllUsers() public {
        // Simular criação da campanha 1 com critérios específicos
        // Baseado no que o usuário disse: "campanha 1 está sendo retornada para todos mas nem todos estão habilitados"
        vm.startPrank(advertiser);
        
        // Criar campanha com critérios ESPECÍFICOS (não aceita todos)
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 25,  // Idade específica
            targetAgeMax: 35,  // Idade específica
            targetLocation: Types.Location.SAO_PAULO,  // Localização específica
            targetProfession: Types.Profession.SOFTWARE_ENGINEER,  // Profissão específica
            targetInterest: Types.Interest.TECH,  // Interesse específico
            targetGender: Types.Gender.MALE  // Gênero específico
        });
        
        bytes32 creativeHash = keccak256("campaign1");
        uint256 campaignId = prevdlAds.createCampaign(
            creativeHash,
            "https://campaign1.com",
            targeting,
            1000000,
            100000,  // dailyBudgetUSDC
            1000,
            5000
        );
        
        // Ativar campanha
        prevdlAds.updateCampaignStatus(campaignId, Types.CampaignStatus.ACTIVE);
        vm.stopPrank();
        
        // Criar usuário 1 que DEVE fazer match (atende todos os critérios)
        Types.Interest[3] memory interests1 = [
            Types.Interest.TECH,
            Types.Interest.CRYPTO,
            Types.Interest.GAMING
        ];
        _setUserProfileHelper(user1, 30, Types.Location.SAO_PAULO, Types.Profession.SOFTWARE_ENGINEER, interests1, Types.Gender.MALE);
        
        // Criar usuário 2 que NÃO deve fazer match (idade fora do range)
        Types.Interest[3] memory interests2 = [
            Types.Interest.TECH,
            Types.Interest.CRYPTO,
            Types.Interest.GAMING
        ];
        _setUserProfileHelper(user2, 40, Types.Location.SAO_PAULO, Types.Profession.SOFTWARE_ENGINEER, interests2, Types.Gender.MALE);
        
        // Criar usuário 3 que NÃO deve fazer match (localização diferente)
        Types.Interest[3] memory interests3 = [
            Types.Interest.TECH,
            Types.Interest.CRYPTO,
            Types.Interest.GAMING
        ];
        _setUserProfileHelper(user3, 30, Types.Location.RIO_DE_JANEIRO, Types.Profession.SOFTWARE_ENGINEER, interests3, Types.Gender.MALE);
        
        // Verificar matches
        vm.prank(user1);
        Types.MatchResult memory result1 = prevdlAds.checkAdMatch(campaignId, user1);
        assertTrue(result1.isMatch, "User1 should match (meets all criteria)");
        assertTrue(result1.ageMatch, "User1 age should match");
        assertTrue(result1.locationMatch, "User1 location should match");
        assertTrue(result1.professionMatch, "User1 profession should match");
        assertTrue(result1.interestMatch, "User1 interest should match");
        assertTrue(result1.genderMatch, "User1 gender should match");
        
        vm.prank(user2);
        Types.MatchResult memory result2 = prevdlAds.checkAdMatch(campaignId, user2);
        assertFalse(result2.isMatch, "User2 should NOT match (age 40 > 35)");
        assertFalse(result2.ageMatch, "User2 age should NOT match");
        // Os outros critérios podem match, mas idade não, então isMatch deve ser false
        
        vm.prank(user3);
        Types.MatchResult memory result3 = prevdlAds.checkAdMatch(campaignId, user3);
        assertFalse(result3.isMatch, "User3 should NOT match (location RIO != SAO_PAULO)");
        assertFalse(result3.locationMatch, "User3 location should NOT match");
    }

    /**
     * @notice Verificar se a lógica de idade está correta
     */
    function testAgeMatchingLogic() public {
        vm.startPrank(advertiser);
        
        // Campanha com idade 25-35
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 25,
            targetAgeMax: 35,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignIdAge = prevdlAds.createCampaign(keccak256("age_test"), "https://test.com", targeting, 1000000, 100000, 1000, 5000);
        prevdlAds.updateCampaignStatus(campaignIdAge, Types.CampaignStatus.ACTIVE);
        vm.stopPrank();
        
        Types.Interest[3] memory interests = [Types.Interest.TECH, Types.Interest.CRYPTO, Types.Interest.GAMING];
        
        // Usuário com 24 anos - NÃO deve match
        _setUserProfileHelper(user1, 24, Types.Location.ANY, Types.Profession.ANY, interests, Types.Gender.ANY);
        vm.prank(user1);
        Types.MatchResult memory result1 = prevdlAds.checkAdMatch(campaignIdAge, user1);
        assertFalse(result1.isMatch, "User with age 24 should NOT match (below min)");
        assertFalse(result1.ageMatch, "Age 24 should NOT match range 25-35");
        
        // Usuário com 25 anos - DEVE match (limite inferior)
        _setUserProfileHelper(user2, 25, Types.Location.ANY, Types.Profession.ANY, interests, Types.Gender.ANY);
        vm.prank(user2);
        Types.MatchResult memory result2 = prevdlAds.checkAdMatch(campaignIdAge, user2);
        assertTrue(result2.isMatch, "User with age 25 should match (at min)");
        assertTrue(result2.ageMatch, "Age 25 should match range 25-35");
        
        // Usuário com 35 anos - DEVE match (limite superior)
        _setUserProfileHelper(user3, 35, Types.Location.ANY, Types.Profession.ANY, interests, Types.Gender.ANY);
        vm.prank(user3);
        Types.MatchResult memory result3 = prevdlAds.checkAdMatch(campaignIdAge, user3);
        assertTrue(result3.isMatch, "User with age 35 should match (at max)");
        assertTrue(result3.ageMatch, "Age 35 should match range 25-35");
        
        // Usuário com 36 anos - NÃO deve match
        address user4 = address(6);
        _setUserProfileHelper(user4, 36, Types.Location.ANY, Types.Profession.ANY, interests, Types.Gender.ANY);
        vm.prank(user4);
        Types.MatchResult memory result4 = prevdlAds.checkAdMatch(campaignIdAge, user4);
        assertFalse(result4.isMatch, "User with age 36 should NOT match (above max)");
        assertFalse(result4.ageMatch, "Age 36 should NOT match range 25-35");
    }
}

