/**
 * MATCHING TESTS - PREVDL Ad Targeting
 * 
 * Unit tests for matching algorithms between users and ads.
 */

// ============================================
// TEST 1: PERFECT MATCH
// ============================================
#[test]
fn test_perfect_match() {
    // USER DATA (PRIVATE)
    let user_age: u8 = 28;
    let user_location: u8 = 1;  // Sao Paulo
    let user_profession: u8 = 1; // Software Engineer
    let user_interest_1: u8 = 1; // Tech
    let user_interest_2: u8 = 2; // Crypto
    let user_interest_3: u8 = 6; // Travel
    let user_gender: u8 = 1;     // Male

    // AD DATA (PUBLIC)
    let ad_min_age: u8 = 25;
    let ad_max_age: u8 = 35;
    let ad_target_location: u8 = 1; // Sao Paulo
    let ad_target_profession: u8 = 1; // Software Engineer
    let ad_required_interest: u8 = 1; // Tech
    let ad_target_gender: u8 = 0;    // Any gender

    // VERIFICATION
    let age_match = (user_age >= ad_min_age) & (user_age <= ad_max_age);
    let location_match = (ad_target_location == 0) | (user_location == ad_target_location);
    let profession_match = (ad_target_profession == 0) | (user_profession == ad_target_profession);
    let interest_match = (user_interest_1 == ad_required_interest) 
        | (user_interest_2 == ad_required_interest) 
        | (user_interest_3 == ad_required_interest);
    let gender_match = (ad_target_gender == 0) | (user_gender == ad_target_gender);
    
    let is_match = age_match & location_match & profession_match & interest_match & gender_match;
    
    // EXPECTED: TRUE
    assert(is_match);
    assert(age_match);
    assert(location_match);
    assert(profession_match);
    assert(interest_match);
}

// ============================================
// TEST 2: AGE REJECTION
// ============================================
#[test]
fn test_age_rejection() {
    let user_age: u8 = 22;        // Too young
    let ad_min_age: u8 = 25;
    let ad_max_age: u8 = 35;

    let age_match = (user_age >= ad_min_age) & (user_age <= ad_max_age);
    
    assert(!age_match); // Should be FALSE
}

// ============================================
// TEST 3: PROFESSION REJECTION
// ============================================
#[test]
fn test_profession_rejection() {
    let user_profession: u8 = 2;  // Designer
    let ad_target_profession: u8 = 1; // Software Engineer

    let profession_match = (ad_target_profession == 0) | (user_profession == ad_target_profession);
    
    assert(!profession_match); // Should be FALSE
}

// ============================================
// TEST 4: LOCATION REJECTION
// ============================================
#[test]
fn test_location_rejection() {
    let user_location: u8 = 5;    // Porto Alegre
    let ad_target_location: u8 = 1; // Sao Paulo

    let location_match = (ad_target_location == 0) | (user_location == ad_target_location);
    
    assert(!location_match); // Should be FALSE
}

// ============================================
// TEST 5: INTEREST REJECTION
// ============================================
#[test]
fn test_interest_rejection() {
    let user_interest_1: u8 = 4;  // Sports
    let user_interest_2: u8 = 5;  // Fashion
    let user_interest_3: u8 = 7;  // Food
    let ad_required_interest: u8 = 1; // Tech

    let interest_match = (user_interest_1 == ad_required_interest) 
        | (user_interest_2 == ad_required_interest) 
        | (user_interest_3 == ad_required_interest);
    
    assert(!interest_match); // Should be FALSE
}

// ============================================
// TEST 6: ANY LOCATION MATCH
// ============================================
#[test]
fn test_any_location_match() {
    let user_location: u8 = 5;    // Porto Alegre
    let ad_target_location: u8 = 0;  // ANY

    let location_match = (ad_target_location == 0) | (user_location == ad_target_location);
    
    assert(location_match); // Should be TRUE
}

// ============================================
// TEST 7: ANY PROFESSION MATCH
// ============================================
#[test]
fn test_any_profession_match() {
    let user_profession: u8 = 7;  // Student
    let ad_target_profession: u8 = 0;  // ANY

    let profession_match = (ad_target_profession == 0) | (user_profession == ad_target_profession);
    
    assert(profession_match); // Should be TRUE
}

// ============================================
// TEST 8: SECOND INTEREST MATCH
// ============================================
#[test]
fn test_second_interest_match() {
    let user_interest_1: u8 = 4;  // Sports
    let user_interest_2: u8 = 1;  // Tech (MATCH!)
    let user_interest_3: u8 = 7;  // Food
    let ad_required_interest: u8 = 1; // Tech

    let interest_match = (user_interest_1 == ad_required_interest) 
        | (user_interest_2 == ad_required_interest) 
        | (user_interest_3 == ad_required_interest);
    
    assert(interest_match); // Should be TRUE
}

// ============================================
// TEST 9: EDGE CASE - MIN AGE
// ============================================
#[test]
fn test_age_edge_min() {
    let user_age: u8 = 25;  // Exactly at minimum
    let ad_min_age: u8 = 25;
    let ad_max_age: u8 = 35;

    let age_match = (user_age >= ad_min_age) & (user_age <= ad_max_age);
    
    assert(age_match); // Should be TRUE
}

// ============================================
// TEST 10: EDGE CASE - MAX AGE
// ============================================
#[test]
fn test_age_edge_max() {
    let user_age: u8 = 35;  // Exactly at maximum
    let ad_min_age: u8 = 25;
    let ad_max_age: u8 = 35;

    let age_match = (user_age >= ad_min_age) & (user_age <= ad_max_age);
    
    assert(age_match); // Should be TRUE
}

// ============================================
// TEST 11: FULL SCENARIO - MATCH
// ============================================
#[test]
fn test_full_scenario_match() {
    // User: Dev 30 years old, SP, interested in Tech/Crypto
    let user_age: u8 = 30;
    let user_location: u8 = 1;
    let user_profession: u8 = 1;
    let user_interest_1: u8 = 1;
    let user_interest_2: u8 = 2;
    let user_interest_3: u8 = 6;
    let user_gender: u8 = 1;

    // Ad: Blockchain course for devs 25-40, any location
    let ad_min_age: u8 = 25;
    let ad_max_age: u8 = 40;
    let ad_target_location: u8 = 0;  // Any
    let ad_target_profession: u8 = 1; // Dev
    let ad_required_interest: u8 = 2; // Crypto
    let ad_target_gender: u8 = 0;    // Any

    // All verifications
    let age_ok = (user_age >= ad_min_age) & (user_age <= ad_max_age);
    let location_ok = (ad_target_location == 0) | (user_location == ad_target_location);
    let profession_ok = (ad_target_profession == 0) | (user_profession == ad_target_profession);
    let interest_ok = (user_interest_1 == ad_required_interest) 
        | (user_interest_2 == ad_required_interest) 
        | (user_interest_3 == ad_required_interest);
    let gender_ok = (ad_target_gender == 0) | (user_gender == ad_target_gender);
    
    let final_match = age_ok & location_ok & profession_ok & interest_ok & gender_ok;
    
    assert(final_match);
}

// ============================================
// TEST 12: FULL SCENARIO - REJECTION
// ============================================
#[test]
fn test_full_scenario_rejection() {
    // User: Designer 45 years old, RJ, interested in Fashion
    let user_age: u8 = 45;
    let user_location: u8 = 2;  // Rio
    let user_profession: u8 = 2; // Designer
    let user_interest_1: u8 = 5; // Fashion
    let user_interest_2: u8 = 9; // Art
    let user_interest_3: u8 = 8; // Music

    // Ad: Tech bootcamp for devs 20-30, SP
    let ad_min_age: u8 = 20;
    let ad_max_age: u8 = 30;     // Age does not match!
    let ad_target_location: u8 = 1; // SP (does not match!)
    let ad_target_profession: u8 = 1; // Dev (does not match!)
    let ad_required_interest: u8 = 1; // Tech (does not match!)

    let age_ok = (user_age >= ad_min_age) & (user_age <= ad_max_age);
    let location_ok = (ad_target_location == 0) | (user_location == ad_target_location);
    let profession_ok = (ad_target_profession == 0) | (user_profession == ad_target_profession);
    let interest_ok = (user_interest_1 == ad_required_interest) 
        | (user_interest_2 == ad_required_interest) 
        | (user_interest_3 == ad_required_interest);
    
    let final_match = age_ok & location_ok & profession_ok & interest_ok;
    
    assert(!final_match); // None of the criteria match
}
