// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Types
 * @notice Biblioteca de tipos e enums para o sistema PrevDL Ads
 * @dev Baseado nos tipos do SDK TypeScript
 */
library Types {
    // ============================================
    // ENUMS
    // ============================================

    enum Location {
        ANY,                  // 0
        SAO_PAULO,           // 1
        RIO_DE_JANEIRO,      // 2
        BRASILIA,            // 3
        BELO_HORIZONTE,      // 4
        PORTO_ALEGRE,        // 5
        CURITIBA,            // 6
        SALVADOR,            // 7
        FORTALEZA,           // 8
        RECIFE,              // 9
        MANAUS,              // 10
        OTHER_BRAZIL,        // 99
        INTERNATIONAL        // 100
    }

    enum Profession {
        ANY,                 // 0
        SOFTWARE_ENGINEER,   // 1
        DESIGNER,            // 2
        PRODUCT_MANAGER,     // 3
        MARKETING,           // 4
        SALES,               // 5
        ENTREPRENEUR,        // 6
        STUDENT,             // 7
        FREELANCER,          // 8
        EXECUTIVE,           // 9
        HEALTHCARE,          // 10
        EDUCATION,           // 11
        FINANCE,             // 12
        OTHER                // 99
    }

    enum Interest {
        NONE,                // 0
        TECH,                // 1
        CRYPTO,              // 2
        GAMING,              // 3
        SPORTS,              // 4
        FASHION,             // 5
        TRAVEL,              // 6
        FOOD,                // 7
        MUSIC,               // 8
        ART,                 // 9
        BUSINESS             // 10
    }

    enum Gender {
        ANY,                 // 0
        MALE,                // 1
        FEMALE,              // 2
        OTHER                // 3
    }

    enum CampaignStatus {
        PENDING,             // 0
        ACTIVE,              // 1
        PAUSED,              // 2
        BUDGET_EXCEEDED,     // 3
        COMPLETED            // 4
    }

    // ============================================
    // STRUCTS
    // ============================================

    /**
     * @notice Perfil de usuário (CRIPTOGRAFADO)
     * @dev Armazenado de forma confidencial no Sapphire
     */
    struct UserProfile {
        uint8 age;
        Location location;
        Profession profession;
        Interest[3] interests;  // Max 3 interesses
        Gender gender;
    }

    /**
     * @notice Critérios de targeting para anúncios
     */
    struct AdTargeting {
        uint8 targetAgeMin;
        uint8 targetAgeMax;
        Location targetLocation;
        Profession targetProfession;
        Interest targetInterest;
        Gender targetGender;
    }

    /**
     * @notice Campanha de anúncio
     */
    struct Campaign {
        uint256 id;
        address advertiser;
        
        // Creative (armazenado off-chain, apenas hash on-chain)
        bytes32 creativeHash;
        string ctaUrl;
        
        // Targeting
        AdTargeting targeting;
        
        // Budget e Bidding
        uint256 budgetUSDC;
        uint256 spentUSDC;
        uint256 dailyBudgetUSDC;
        uint256 bidPerImpression;  // em wei ou menor denominação
        uint256 bidPerClick;
        
        // Status
        CampaignStatus status;
        
        // Stats (públicas)
        uint256 impressions;
        uint256 clicks;
        uint256 matches;
        
        // Timestamps
        uint256 createdAt;
        uint256 activatedAt;
    }

    /**
     * @notice Resultado de matching (CRIPTOGRAFADO)
     */
    struct MatchResult {
        bool isMatch;
        bool ageMatch;
        bool locationMatch;
        bool professionMatch;
        bool interestMatch;
        bool genderMatch;
    }

    /**
     * @notice Info pública de um ad
     */
    struct AdInfo {
        uint256 id;
        bytes32 creativeHash;
        string ctaUrl;
        uint256 bidPerImpression;
        uint256 bidPerClick;
        uint256 impressions;
        uint256 clicks;
        uint256 matches;
        uint256 rankingScore;
    }
}

