// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PrevDLAds.sol";
import "../src/Types.sol";

/**
 * @title MatchingBugTest
 * @notice Teste específico para verificar bugs na lógica de matching
 */
contract MatchingBugTest is Test {
    PrevDLAds public prevdlAds;
    
    address public owner = address(1);
    address public advertiser = address(2);
    address public user1 = address(3);
    address public user2 = address(4);

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

    function testCampaignWithSpecificTargetingShouldNotMatchAllUsers() public {
        // Criar campanha com targeting específico
        vm.startPrank(advertiser);
        
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 25,
            targetAgeMax: 35,
            targetLocation: Types.Location.SAO_PAULO,
            targetProfession: Types.Profession.SOFTWARE_ENGINEER,
            targetInterest: Types.Interest.TECH,
            targetGender: Types.Gender.MALE
        });
        
        bytes32 creativeHash = keccak256("test");
        uint256 budgetUSDC = 1000000;
        uint256 dailyBudgetUSDC = 100000;
        uint256 bidPerImpression = 1000;
        uint256 bidPerClick = 5000;
        
        uint256 campaignId = prevdlAds.createCampaign(
            creativeHash,
            "https://example.com",
            targeting,
            budgetUSDC,
            dailyBudgetUSDC,
            bidPerImpression,
            bidPerClick
        );
        
        // Ativar campanha
        prevdlAds.updateCampaignStatus(campaignId, Types.CampaignStatus.ACTIVE);
        vm.stopPrank();
        
        // Criar usuário 1 que DEVE fazer match (25 anos, SP, Software Engineer, Tech, Male)
        Types.Interest[3] memory interests1 = [
            Types.Interest.TECH,
            Types.Interest.CRYPTO,
            Types.Interest.GAMING
        ];
        _setUserProfileHelper(user1, 30, Types.Location.SAO_PAULO, Types.Profession.SOFTWARE_ENGINEER, interests1, Types.Gender.MALE);
        
        // Criar usuário 2 que NÃO deve fazer match (40 anos, diferente)
        Types.Interest[3] memory interests2 = [
            Types.Interest.TECH,
            Types.Interest.CRYPTO,
            Types.Interest.GAMING
        ];
        _setUserProfileHelper(user2, 40, Types.Location.SAO_PAULO, Types.Profession.SOFTWARE_ENGINEER, interests2, Types.Gender.MALE);
        
        // Verificar match
        vm.prank(user1);
        Types.MatchResult memory result1 = prevdlAds.checkAdMatch(campaignId, user1);
        assertTrue(result1.isMatch, "User1 should match");
        
        vm.prank(user2);
        Types.MatchResult memory result2 = prevdlAds.checkAdMatch(campaignId, user2);
        assertFalse(result2.isMatch, "User2 should NOT match (age 40 > 35)");
        
        // Verificar detalhes do match para user2
        assertFalse(result2.ageMatch, "User2 age should not match");
    }

    function testCampaignWithAllAnyShouldMatchAllUsers() public {
        // Criar campanha com todos os valores como ANY/NONE
        vm.startPrank(advertiser);
        
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0,
            targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        bytes32 creativeHash = keccak256("test2");
        uint256 campaignId2 = prevdlAds.createCampaign(
            creativeHash,
            "https://example.com",
            targeting,
            1000000,
            100000,  // dailyBudgetUSDC
            1000,
            5000
        );
        
        prevdlAds.updateCampaignStatus(campaignId2, Types.CampaignStatus.ACTIVE);
        vm.stopPrank();
        
        // Criar dois usuários diferentes
        Types.Interest[3] memory interests1 = [Types.Interest.TECH, Types.Interest.CRYPTO, Types.Interest.GAMING];
        _setUserProfileHelper(user1, 25, Types.Location.RIO_DE_JANEIRO, Types.Profession.DESIGNER, interests1, Types.Gender.FEMALE);
        
        Types.Interest[3] memory interests2 = [Types.Interest.SPORTS, Types.Interest.FASHION, Types.Interest.TRAVEL];
        _setUserProfileHelper(user2, 50, Types.Location.BRASILIA, Types.Profession.MARKETING, interests2, Types.Gender.OTHER);
        
        // Ambos devem fazer match
        vm.prank(user1);
        Types.MatchResult memory result1 = prevdlAds.checkAdMatch(campaignId2, user1);
        assertTrue(result1.isMatch, "User1 should match (campaign accepts all)");
        
        vm.prank(user2);
        Types.MatchResult memory result2 = prevdlAds.checkAdMatch(campaignId2, user2);
        assertTrue(result2.isMatch, "User2 should match (campaign accepts all)");
    }

    function testAgeRangeEdgeCases() public {
        vm.startPrank(advertiser);
        
        // Teste 1: Idade específica (25-25)
        Types.AdTargeting memory targeting1 = Types.AdTargeting({
            targetAgeMin: 25,
            targetAgeMax: 25,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignId3 = prevdlAds.createCampaign(keccak256("test3"), "https://example.com", targeting1, 1000000, 100000, 1000, 5000);
        prevdlAds.updateCampaignStatus(campaignId3, Types.CampaignStatus.ACTIVE);
        vm.stopPrank();
        
        // Usuário com 25 anos deve fazer match
        Types.Interest[3] memory interests = [Types.Interest.TECH, Types.Interest.CRYPTO, Types.Interest.GAMING];
        _setUserProfileHelper(user1, 25, Types.Location.ANY, Types.Profession.ANY, interests, Types.Gender.ANY);
        
        vm.prank(user1);
        Types.MatchResult memory result = prevdlAds.checkAdMatch(campaignId3, user1);
        assertTrue(result.isMatch, "User with age 25 should match campaign 25-25");
        assertTrue(result.ageMatch, "Age should match");
        
        // Usuário com 24 anos NÃO deve fazer match
        _setUserProfileHelper(user2, 24, Types.Location.ANY, Types.Profession.ANY, interests, Types.Gender.ANY);
        vm.prank(user2);
        Types.MatchResult memory result2 = prevdlAds.checkAdMatch(campaignId3, user2);
        assertFalse(result2.isMatch, "User with age 24 should NOT match campaign 25-25");
        assertFalse(result2.ageMatch, "Age should not match");
    }
}

