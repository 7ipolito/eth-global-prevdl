// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PrevDLAds.sol";
import "../src/Types.sol";

/**
 * @title PrevDLAdsTest
 * @notice Testes completos para o sistema PrevDL Ads
 * @dev Testa funcionalidades de matching criptografado e privacidade
 */
contract PrevDLAdsTest is Test {
    PrevDLAds public prevdlAds;
    
    // Endereços de teste
    address public owner = address(1);
    address public advertiser = address(2);
    address public user1 = address(3);
    address public user2 = address(4);

    function setUp() public {
        vm.prank(owner);
        prevdlAds = new PrevDLAds();
    }

    /**
     * @dev Helper para criar perfil em testes
     * Simula criptografia usando ABI encoding simples
     */
    function _setUserProfileHelper(
        address user,
        uint8 age,
        Types.Location location,
        Types.Profession profession,
        Types.Interest[3] memory interests,
        Types.Gender gender
    ) internal {
        vm.prank(user);
        
        // Simular dados "criptografados" usando ABI encoding
        // Em produção, isso seria criptografado com AES-256-GCM no SDK
        bytes memory encryptedData = abi.encode(age, location, profession, interests, gender);
        bytes32 nonce = keccak256(abi.encodePacked(block.timestamp, user));
        
        prevdlAds.setUserProfileEncrypted(encryptedData, nonce);
    }

    // ============================================
    // TESTES DE PERFIL DE USUÁRIO
    // ============================================

    function testCreateUserProfile() public {
        Types.Interest[3] memory interests = [
            Types.Interest.TECH,
            Types.Interest.CRYPTO,
            Types.Interest.GAMING
        ];
        
        _setUserProfileHelper(
            user1,
            25,
            Types.Location.SAO_PAULO,
            Types.Profession.SOFTWARE_ENGINEER,
            interests,
            Types.Gender.MALE
        );
        
        assertTrue(prevdlAds.hasProfile(user1));
        
        vm.prank(user1);
        Types.UserProfile memory profile = prevdlAds.getUserProfile(user1);
        assertEq(profile.age, 25);
        assertEq(uint(profile.location), uint(Types.Location.SAO_PAULO));
        assertEq(uint(profile.profession), uint(Types.Profession.SOFTWARE_ENGINEER));
    }

    function testCannotViewOthersProfile() public {
        // User1 cria perfil
        Types.Interest[3] memory interests = [
            Types.Interest.TECH,
            Types.Interest.CRYPTO,
            Types.Interest.GAMING
        ];
        _setUserProfileHelper(
            user1,
            25,
            Types.Location.SAO_PAULO,
            Types.Profession.SOFTWARE_ENGINEER,
            interests,
            Types.Gender.MALE
        );
        
        // User2 tenta ver perfil de User1 (deve falhar)
        vm.startPrank(user2);
        vm.expectRevert("Can only view own profile");
        prevdlAds.getUserProfile(user1);
        vm.stopPrank();
    }

    // ============================================
    // TESTES DE CRIAÇÃO DE CAMPANHA
    // ============================================

    function testCreateCampaign() public {
        vm.startPrank(advertiser);
        
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 18,
            targetAgeMax: 35,
            targetLocation: Types.Location.SAO_PAULO,
            targetProfession: Types.Profession.SOFTWARE_ENGINEER,
            targetInterest: Types.Interest.TECH,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("campaign1"),
            "https://example.com",
            targeting,
            1000 ether,  // budget
            100 ether,   // daily budget
            0.01 ether,  // bid per impression
            0.1 ether    // bid per click
        );
        
        assertEq(campaignId, 1);
        
        Types.Campaign memory campaign = prevdlAds.getCampaign(campaignId);
        assertEq(campaign.advertiser, advertiser);
        assertEq(campaign.budgetUSDC, 1000 ether);
        assertEq(uint(campaign.status), uint(Types.CampaignStatus.ACTIVE));
        
        vm.stopPrank();
    }

    function testCannotCreateCampaignWithZeroBudget() public {
        vm.startPrank(advertiser);
        
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 18,
            targetAgeMax: 35,
            targetLocation: Types.Location.SAO_PAULO,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.TECH,
            targetGender: Types.Gender.ANY
        });
        
        vm.expectRevert("Budget must be > 0");
        prevdlAds.createCampaign(
            keccak256("campaign1"),
            "https://example.com",
            targeting,
            0,           // budget = 0 (deve falhar)
            0,
            0.01 ether,
            0.1 ether
        );
        
        vm.stopPrank();
    }

    // ============================================
    // TESTES DE MATCHING CRIPTOGRAFADO 🔐
    // ============================================

    function testAdMatchingSuccess() public {
        // Criar campanha
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 20,
            targetAgeMax: 30,
            targetLocation: Types.Location.SAO_PAULO,
            targetProfession: Types.Profession.SOFTWARE_ENGINEER,
            targetInterest: Types.Interest.TECH,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("tech_ad"),
            "https://tech.com",
            targeting,
            1000 ether,
            100 ether,
            0.01 ether,
            0.1 ether
        );
        vm.stopPrank();
        
        // Criar perfil de usuário que combina
        Types.Interest[3] memory interests = [
            Types.Interest.TECH,
            Types.Interest.CRYPTO,
            Types.Interest.GAMING
        ];
        
        _setUserProfileHelper(
            user1,
            25,  // idade entre 20-30 ✓
            Types.Location.SAO_PAULO,  // localização match ✓
            Types.Profession.SOFTWARE_ENGINEER,  // profissão match ✓
            interests,  // tem TECH ✓
            Types.Gender.MALE  // ANY aceita qualquer ✓
        );
        
        // Verificar matching
        Types.MatchResult memory result = prevdlAds.checkAdMatch(campaignId, user1);
        
        assertTrue(result.isMatch, "Should match");
        assertTrue(result.ageMatch);
        assertTrue(result.locationMatch);
        assertTrue(result.professionMatch);
        assertTrue(result.interestMatch);
        assertTrue(result.genderMatch);
    }

    function testAdMatchingFailAge() public {
        // Criar campanha para jovens (18-25)
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 18,
            targetAgeMax: 25,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("young_ad"),
            "https://young.com",
            targeting,
            1000 ether,
            100 ether,
            0.01 ether,
            0.1 ether
        );
        vm.stopPrank();
        
        // Criar perfil com idade fora do range
        Types.Interest[3] memory interests = [
            Types.Interest.TECH,
            Types.Interest.NONE,
            Types.Interest.NONE
        ];
        
        _setUserProfileHelper(
            user1,
            35,  // idade > 25 (não combina)
            Types.Location.SAO_PAULO,
            Types.Profession.SOFTWARE_ENGINEER,
            interests,
            Types.Gender.MALE
        );
        
        // Verificar matching
        Types.MatchResult memory result = prevdlAds.checkAdMatch(campaignId, user1);
        
        assertFalse(result.isMatch, "Should not match");
        assertFalse(result.ageMatch);
    }

    function testAdMatchingFailInterest() public {
        // Criar campanha para interesse CRYPTO
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0,
            targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.CRYPTO,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("crypto_ad"),
            "https://crypto.com",
            targeting,
            1000 ether,
            100 ether,
            0.01 ether,
            0.1 ether
        );
        vm.stopPrank();
        
        // Criar perfil SEM interesse em crypto
        Types.Interest[3] memory interests = [
            Types.Interest.SPORTS,
            Types.Interest.MUSIC,
            Types.Interest.FOOD
        ];
        
        _setUserProfileHelper(
            user1,
            25,
            Types.Location.SAO_PAULO,
            Types.Profession.DESIGNER,
            interests,
            Types.Gender.FEMALE
        );
        
        // Verificar matching
        Types.MatchResult memory result = prevdlAds.checkAdMatch(campaignId, user1);
        
        assertFalse(result.isMatch, "Should not match");
        assertFalse(result.interestMatch);
    }

    function testGetMatchingAds() public {
        // Criar múltiplas campanhas
        vm.startPrank(advertiser);
        
        // Campanha 1: TECH para engenheiros
        Types.AdTargeting memory targeting1 = Types.AdTargeting({
            targetAgeMin: 20,
            targetAgeMax: 35,
            targetLocation: Types.Location.SAO_PAULO,
            targetProfession: Types.Profession.SOFTWARE_ENGINEER,
            targetInterest: Types.Interest.TECH,
            targetGender: Types.Gender.ANY
        });
        prevdlAds.createCampaign(
            keccak256("tech_ad"),
            "https://tech.com",
            targeting1,
            1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        
        // Campanha 2: CRYPTO para qualquer profissão
        Types.AdTargeting memory targeting2 = Types.AdTargeting({
            targetAgeMin: 20,
            targetAgeMax: 40,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.CRYPTO,
            targetGender: Types.Gender.ANY
        });
        prevdlAds.createCampaign(
            keccak256("crypto_ad"),
            "https://crypto.com",
            targeting2,
            1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        
        // Campanha 3: SPORTS (user1 não tem)
        Types.AdTargeting memory targeting3 = Types.AdTargeting({
            targetAgeMin: 18,
            targetAgeMax: 50,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.SPORTS,
            targetGender: Types.Gender.ANY
        });
        prevdlAds.createCampaign(
            keccak256("sports_ad"),
            "https://sports.com",
            targeting3,
            1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        
        vm.stopPrank();
        
        // Criar perfil de usuário
        Types.Interest[3] memory interests = [
            Types.Interest.TECH,
            Types.Interest.CRYPTO,
            Types.Interest.GAMING
        ];
        
        _setUserProfileHelper(
            user1,
            25,
            Types.Location.SAO_PAULO,
            Types.Profession.SOFTWARE_ENGINEER,
            interests,
            Types.Gender.MALE
        );
        
        // Obter ads matching
        Types.AdInfo[] memory matchedAds = prevdlAds.getMatchingAds(user1);
        
        // Deve retornar 2 ads (TECH e CRYPTO)
        assertEq(matchedAds.length, 2, "Should match 2 ads");
    }

    // ============================================
    // TESTES DE ANALYTICS
    // ============================================

    function testRecordImpression() public {
        // Criar campanha
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 20,
            targetAgeMax: 30,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.TECH,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("tech_ad"),
            "https://tech.com",
            targeting,
            1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        vm.stopPrank();
        
        // Criar perfil
        Types.Interest[3] memory interests = [
            Types.Interest.TECH,
            Types.Interest.NONE,
            Types.Interest.NONE
        ];
        _setUserProfileHelper(
            user1,
            25,
            Types.Location.SAO_PAULO,
            Types.Profession.SOFTWARE_ENGINEER,
            interests,
            Types.Gender.MALE
        );
        
        // Registrar impressão
        vm.prank(user1);
        prevdlAds.recordImpression(campaignId);
        
        // Verificar stats
        (uint256 impressions, , uint256 matches, , ) = prevdlAds.getCampaignStats(campaignId);
        assertEq(impressions, 1);
        assertEq(matches, 1);
    }

    function testRecordClick() public {
        // Criar campanha e perfil
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0, targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("ad"), "https://example.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        vm.stopPrank();
        
        Types.Interest[3] memory interests;
        _setUserProfileHelper(
            user1,
            25,
            Types.Location.SAO_PAULO,
            Types.Profession.ANY,
            interests,
            Types.Gender.MALE
        );
        
        // Registrar click
        vm.prank(user1);
        prevdlAds.recordClick(campaignId);
        
        // Verificar stats
        (, uint256 clicks, , , ) = prevdlAds.getCampaignStats(campaignId);
        assertEq(clicks, 1);
    }

    function testCampaignStats() public {
        // Criar campanha
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0, targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("ad"), "https://example.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        vm.stopPrank();
        
        // Criar 2 usuários e registrar atividade
        Types.Interest[3] memory interests;
        
        _setUserProfileHelper(
            user1,
            25,
            Types.Location.SAO_PAULO,
            Types.Profession.ANY,
            interests,
            Types.Gender.MALE
        );
        vm.prank(user1);
        prevdlAds.recordImpression(campaignId);
        vm.prank(user1);
        prevdlAds.recordClick(campaignId);
        
        _setUserProfileHelper(
            user2,
            30,
            Types.Location.RIO_DE_JANEIRO,
            Types.Profession.ANY,
            interests,
            Types.Gender.FEMALE
        );
        vm.prank(user2);
        prevdlAds.recordImpression(campaignId);
        
        // Verificar stats
        (uint256 impressions, uint256 clicks, uint256 matches, 
         uint256 matchRate, uint256 ctr) = prevdlAds.getCampaignStats(campaignId);
        
        assertEq(impressions, 2);
        assertEq(clicks, 1);
        assertEq(ctr, 50); // 50% CTR
    }

    // ============================================
    // TESTES DE AUTORIZAÇÃO
    // ============================================

    function testUpdateCampaignStatus() public {
        // Criar campanha
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0, targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("ad"), "https://example.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        
        // Pausar campanha
        prevdlAds.updateCampaignStatus(campaignId, Types.CampaignStatus.PAUSED);
        
        Types.Campaign memory campaign = prevdlAds.getCampaign(campaignId);
        assertEq(uint(campaign.status), uint(Types.CampaignStatus.PAUSED));
        
        vm.stopPrank();
    }

    function testCannotUpdateOthersCampaign() public {
        // Advertiser cria campanha
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0, targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("ad"), "https://example.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        vm.stopPrank();
        
        // User1 tenta pausar (deve falhar)
        vm.startPrank(user1);
        vm.expectRevert("Not authorized");
        prevdlAds.updateCampaignStatus(campaignId, Types.CampaignStatus.PAUSED);
        vm.stopPrank();
    }

    // ============================================
    // TESTES DE EDGE CASES E CRIPTOGRAFIA
    // ============================================

    function testMultipleUsersPrivacy() public {
        // Criar campanha
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 20, targetAgeMax: 30,
            targetLocation: Types.Location.SAO_PAULO,
            targetProfession: Types.Profession.SOFTWARE_ENGINEER,
            targetInterest: Types.Interest.TECH,
            targetGender: Types.Gender.ANY
        });
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("tech_ad"), "https://tech.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        vm.stopPrank();
        
        // User1 cria perfil matching
        Types.Interest[3] memory interests1 = [
            Types.Interest.TECH, Types.Interest.CRYPTO, Types.Interest.NONE
        ];
        _setUserProfileHelper(
            user1,
            25,
            Types.Location.SAO_PAULO,
            Types.Profession.SOFTWARE_ENGINEER,
            interests1,
            Types.Gender.MALE
        );
        
        // User2 cria perfil NÃO matching
        Types.Interest[3] memory interests2 = [
            Types.Interest.SPORTS, Types.Interest.MUSIC, Types.Interest.NONE
        ];
        _setUserProfileHelper(
            user2,
            45,
            Types.Location.RIO_DE_JANEIRO,
            Types.Profession.DESIGNER,
            interests2,
            Types.Gender.FEMALE
        );
        
        // User1 deve fazer match
        vm.prank(user1);
        Types.MatchResult memory result1 = prevdlAds.checkAdMatch(campaignId, user1);
        assertTrue(result1.isMatch, "User1 should match");
        
        // User2 NÃO deve fazer match
        vm.prank(user2);
        Types.MatchResult memory result2 = prevdlAds.checkAdMatch(campaignId, user2);
        assertFalse(result2.isMatch, "User2 should not match");
        
        // Garantir que perfis são privados (não podem ser acessados por outros)
        vm.startPrank(user1);
        vm.expectRevert("Can only view own profile");
        prevdlAds.getUserProfile(user2);
        vm.stopPrank();
    }

    function testCannotDoubleRecordImpression() public {
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0, targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("ad"), "https://example.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        vm.stopPrank();
        
        Types.Interest[3] memory interests;
        _setUserProfileHelper(
            user1,
            25,
            Types.Location.SAO_PAULO,
            Types.Profession.ANY,
            interests,
            Types.Gender.MALE
        );
        
        // Primeira impressão: OK
        vm.prank(user1);
        prevdlAds.recordImpression(campaignId);
        
        // Segunda impressão: deve falhar
        vm.prank(user1);
        vm.expectRevert("Already viewed");
        prevdlAds.recordImpression(campaignId);
    }

    function testCannotDoubleRecordClick() public {
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0, targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("ad"), "https://example.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        vm.stopPrank();
        
        Types.Interest[3] memory interests;
        _setUserProfileHelper(
            user1,
            25,
            Types.Location.SAO_PAULO,
            Types.Profession.ANY,
            interests,
            Types.Gender.MALE
        );
        
        // Primeiro click: OK
        vm.prank(user1);
        prevdlAds.recordClick(campaignId);
        
        // Segundo click: deve falhar
        vm.prank(user1);
        vm.expectRevert("Already clicked");
        prevdlAds.recordClick(campaignId);
    }

    function testMatchingWithAllTargetingNone() public {
        // Campanha sem targeting específico (ANY/NONE em tudo)
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0, targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("broad_ad"), "https://broad.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        vm.stopPrank();
        
        // Qualquer usuário deve fazer match
        Types.Interest[3] memory interests = [
            Types.Interest.GAMING, Types.Interest.NONE, Types.Interest.NONE
        ];
        _setUserProfileHelper(
            user1,
            55,
            Types.Location.INTERNATIONAL,
            Types.Profession.EXECUTIVE,
            interests,
            Types.Gender.OTHER
        );
        
        Types.MatchResult memory result = prevdlAds.checkAdMatch(campaignId, user1);
        assertTrue(result.isMatch, "Should match with broad targeting");
        vm.stopPrank();
    }

    function testGetActiveCampaigns() public {
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0, targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        // Criar 3 campanhas
        uint256 id1 = prevdlAds.createCampaign(
            keccak256("ad1"), "https://1.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        uint256 id2 = prevdlAds.createCampaign(
            keccak256("ad2"), "https://2.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        uint256 id3 = prevdlAds.createCampaign(
            keccak256("ad3"), "https://3.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        
        // Pausar a segunda campanha
        prevdlAds.updateCampaignStatus(id2, Types.CampaignStatus.PAUSED);
        vm.stopPrank();
        
        // Verificar campanhas ativas (deve retornar 2)
        uint256[] memory active = prevdlAds.getActiveCampaigns();
        assertEq(active.length, 2, "Should have 2 active campaigns");
        assertEq(active[0], id1);
        assertEq(active[1], id3);
    }

    function testCannotMatchWithoutProfile() public {
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0, targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        uint256 campaignId = prevdlAds.createCampaign(
            keccak256("ad"), "https://example.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        vm.stopPrank();
        
        // User1 tenta fazer match sem ter perfil
        vm.startPrank(user1);
        vm.expectRevert("User has no profile");
        prevdlAds.checkAdMatch(campaignId, user1);
        vm.stopPrank();
    }

    function testGetTotalCampaigns() public {
        assertEq(prevdlAds.getTotalCampaigns(), 0);
        
        vm.startPrank(advertiser);
        Types.AdTargeting memory targeting = Types.AdTargeting({
            targetAgeMin: 0, targetAgeMax: 0,
            targetLocation: Types.Location.ANY,
            targetProfession: Types.Profession.ANY,
            targetInterest: Types.Interest.NONE,
            targetGender: Types.Gender.ANY
        });
        
        prevdlAds.createCampaign(
            keccak256("ad1"), "https://1.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        assertEq(prevdlAds.getTotalCampaigns(), 1);
        
        prevdlAds.createCampaign(
            keccak256("ad2"), "https://2.com",
            targeting, 1000 ether, 100 ether, 0.01 ether, 0.1 ether
        );
        assertEq(prevdlAds.getTotalCampaigns(), 2);
        
        vm.stopPrank();
    }
}

