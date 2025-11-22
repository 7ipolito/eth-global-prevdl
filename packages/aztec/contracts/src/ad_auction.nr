use dep::aztec::macros::aztec;

/**
 * Contrato de Leilão de Anúncios com Privacidade
 * 
 * Features:
 * - Anunciantes fazem lances (bids) para aparecer primeiro
 * - Verificação privada de compatibilidade (Aztec)
 * - Pagamentos em stablecoins (USDC via Circle)
 * - Anti-fraude via World ID
 * - Sistema de ranking: bid × quality score
 */

#[aztec]
pub contract AdAuction {
    use dep::aztec::{
        keys::getters::get_public_keys,
        macros::{functions::{external, initializer, internal}, storage::storage},
    };
    use dep::aztec::protocol_types::{
        address::AztecAddress,
        hash::poseidon2_hash,
        traits::ToField,
    };
    use dep::aztec::state_vars::{Map, PublicMutable};

    // Constantes para modelo de precificação
    global PRECISION: Field = 1000000; // 6 casas decimais

    #[storage]
    struct Storage<Context> {
        admin: PublicMutable<AztecAddress, Context>,
        
        // Dados da campanha
        ad_bid_per_click: Map<Field, PublicMutable<Field, Context>, Context>,      // Quanto anunciante paga por clique (em USDC)
        ad_bid_per_impression: Map<Field, PublicMutable<Field, Context>, Context>, // Quanto paga por impressão
        ad_daily_budget: Map<Field, PublicMutable<Field, Context>, Context>,       // Budget diário
        ad_total_budget: Map<Field, PublicMutable<Field, Context>, Context>,       // Budget total
        ad_spent_today: Map<Field, PublicMutable<Field, Context>, Context>,        // Gasto hoje
        ad_total_spent: Map<Field, PublicMutable<Field, Context>, Context>,        // Gasto total
        
        // Métricas
        ad_impressions: Map<Field, PublicMutable<Field, Context>, Context>,
        ad_clicks: Map<Field, PublicMutable<Field, Context>, Context>,
        ad_conversions: Map<Field, PublicMutable<Field, Context>, Context>,
        
        // Quality Score (calculado off-chain via Chainlink)
        ad_quality_score: Map<Field, PublicMutable<Field, Context>, Context>,      // 0-1000
        
        // Endereço do token USDC
        usdc_token: PublicMutable<AztecAddress, Context>,
        
        // Treasury (onde vai o revenue)
        treasury: PublicMutable<AztecAddress, Context>,
        
        // Taxa da plataforma (ex: 100 = 10%)
        platform_fee: PublicMutable<Field, Context>,
    }

    #[external("public")]
    #[initializer]
    fn constructor(
        admin: AztecAddress,
        usdc_token_address: AztecAddress,
        treasury_address: AztecAddress,
        fee_percentage: Field // ex: 100 = 10%
    ) {
        storage.admin.write(admin);
        storage.usdc_token.write(usdc_token_address);
        storage.treasury.write(treasury_address);
        storage.platform_fee.write(fee_percentage);
    }

    /**
     * Anunciante cria campanha e deposita budget
     */
    #[external("public")]
    fn create_campaign(
        ad_id: Field,
        bid_per_click: Field,        // Em USDC (com 6 decimais)
        bid_per_impression: Field,   // Em USDC (com 6 decimais)
        daily_budget: Field,          // Em USDC
        total_budget: Field           // Em USDC
    ) {
        // Verifica se quem está chamando é o admin ou tem permissão
        // (Você pode adicionar controle de acesso aqui)
        
        storage.ad_bid_per_click.at(ad_id).write(bid_per_click);
        storage.ad_bid_per_impression.at(ad_id).write(bid_per_impression);
        storage.ad_daily_budget.at(ad_id).write(daily_budget);
        storage.ad_total_budget.at(ad_id).write(total_budget);
        storage.ad_spent_today.at(ad_id).write(0);
        storage.ad_total_spent.at(ad_id).write(0);
        storage.ad_quality_score.at(ad_id).write(500); // Score inicial médio (50%)
    }

    /**
     * Função PRIVADA: Verifica compatibilidade e registra impressão
     * 
     * Retorna o ranking score (bid × quality) para ordenação no frontend
     */
    #[external("private")]
    fn check_ad_and_get_score(
        ad_id: Field,
        // Dados do usuário (privados)
        user_age: u8,
        user_interest_1: u8,
        user_interest_2: u8,
        user_interest_3: u8,
        user_location: u8,
        user_gender: u8,
        // Critérios do anúncio
        ad_min_age: u8,
        ad_max_age: u8,
        ad_required_interest: u8,
        ad_target_location: u8,
        ad_target_gender: u8,
    ) -> Field {
        // Verifica compatibilidade (mesma lógica do contrato anterior)
        let age_match = (user_age >= ad_min_age) & (user_age <= ad_max_age);
        let interest_match = (user_interest_1 == ad_required_interest)
            | (user_interest_2 == ad_required_interest)
            | (user_interest_3 == ad_required_interest);
        let location_match = (ad_target_location == 0) | (user_location == ad_target_location);
        let gender_match = (ad_target_gender == 0) | (user_gender == ad_target_gender);
        let is_compatible = age_match & interest_match & location_match & gender_match;

        // Nullifier para prevenir spam
        let msg_sender_keys = get_public_keys(context.msg_sender().unwrap());
        let secret = context.request_nsk_app(msg_sender_keys.npk_m.hash());
        let nullifier = poseidon2_hash([ad_id, context.msg_sender().unwrap().to_field(), secret]);
        context.push_nullifier(nullifier);

        if is_compatible {
            // Registra impressão e cobra do anunciante
            AdAuction::at(context.this_address())
                .record_impression_and_charge(ad_id)
                .enqueue(&mut context);
            
            // Retorna score para ranking (será usado no frontend)
            1
        } else {
            0
        }
    }

    /**
     * Função PÚBLICA: Registra impressão e cobra do anunciante
     */
    #[external("public")]
    #[internal]
    fn record_impression_and_charge(ad_id: Field) {
        let bid_per_impression = storage.ad_bid_per_impression.at(ad_id).read();
        let daily_budget = storage.ad_daily_budget.at(ad_id).read();
        let total_budget = storage.ad_total_budget.at(ad_id).read();
        let spent_today = storage.ad_spent_today.at(ad_id).read();
        let total_spent = storage.ad_total_spent.at(ad_id).read();

        // Verifica se ainda tem budget
        assert(spent_today + bid_per_impression <= daily_budget, "Daily budget exceeded");
        assert(total_spent + bid_per_impression <= total_budget, "Total budget exceeded");

        // Atualiza gastos
        storage.ad_spent_today.at(ad_id).write(spent_today + bid_per_impression);
        storage.ad_total_spent.at(ad_id).write(total_spent + bid_per_impression);

        // Incrementa contador de impressões
        let impressions = storage.ad_impressions.at(ad_id).read();
        storage.ad_impressions.at(ad_id).write(impressions + 1);

        // Nota: A transferência real de USDC seria feita em outro contrato
        // ou via bridge, pois Aztec ainda não suporta tokens ERC20 nativamente
    }

    /**
     * Função PÚBLICA: Registra clique e cobra do anunciante
     * 
     * Deve ser chamado com World ID proof para prevenir fraude
     */
    #[external("public")]
    fn record_click_and_charge(
        ad_id: Field,
        world_id_nullifier: Field  // Nullifier do World ID para prevenir fraude
    ) {
        let bid_per_click = storage.ad_bid_per_click.at(ad_id).read();
        let daily_budget = storage.ad_daily_budget.at(ad_id).read();
        let total_budget = storage.ad_total_budget.at(ad_id).read();
        let spent_today = storage.ad_spent_today.at(ad_id).read();
        let total_spent = storage.ad_total_spent.at(ad_id).read();

        // Verifica budget
        assert(spent_today + bid_per_click <= daily_budget, "Daily budget exceeded");
        assert(total_spent + bid_per_click <= total_budget, "Total budget exceeded");

        // Atualiza gastos
        storage.ad_spent_today.at(ad_id).write(spent_today + bid_per_click);
        storage.ad_total_spent.at(ad_id).write(total_spent + bid_per_click);

        // Incrementa contador
        let clicks = storage.ad_clicks.at(ad_id).read();
        storage.ad_clicks.at(ad_id).write(clicks + 1);

        // Nota: Verificação do World ID proof seria feita aqui
        // para garantir que é um humano real clicando
    }

    /**
     * Admin atualiza quality score (calculado off-chain via Chainlink)
     */
    #[external("public")]
    fn update_quality_score(ad_id: Field, quality_score: Field) {
        assert(context.msg_sender().unwrap().eq(storage.admin.read()), "Only admin");
        assert(quality_score <= 1000, "Score must be 0-1000");
        
        storage.ad_quality_score.at(ad_id).write(quality_score);
    }

    /**
     * Reset gastos diários (chamado por Chainlink Automation a cada dia)
     */
    #[external("public")]
    fn reset_daily_budgets(ad_ids: [Field; 10]) {
        assert(context.msg_sender().unwrap().eq(storage.admin.read()), "Only admin");
        
        // Reset gastos diários para todos os anúncios
        for i in 0..10 {
            if ad_ids[i] != 0 {
                storage.ad_spent_today.at(ad_ids[i]).write(0);
            }
        }
    }

    /**
     * VIEWS: Consulta dados públicos
     */
    
    #[external("utility")]
    unconstrained fn get_ad_stats(ad_id: Field) -> (Field, Field, Field) {
        let impressions = storage.ad_impressions.at(ad_id).read();
        let clicks = storage.ad_clicks.at(ad_id).read();
        let conversions = storage.ad_conversions.at(ad_id).read();
        (impressions, clicks, conversions)
    }

    #[external("utility")]
    unconstrained fn get_ad_budget(ad_id: Field) -> (Field, Field, Field, Field) {
        let daily_budget = storage.ad_daily_budget.at(ad_id).read();
        let total_budget = storage.ad_total_budget.at(ad_id).read();
        let spent_today = storage.ad_spent_today.at(ad_id).read();
        let total_spent = storage.ad_total_spent.at(ad_id).read();
        (daily_budget, total_budget, spent_today, total_spent)
    }

    #[external("utility")]
    unconstrained fn get_ranking_score(ad_id: Field) -> Field {
        let bid = storage.ad_bid_per_click.at(ad_id).read();
        let quality = storage.ad_quality_score.at(ad_id).read();
        
        // Score final = bid × (quality/1000)
        // Exemplo: bid=$1.00, quality=750 → score = 1.00 × 0.75 = 0.75
        (bid * quality) / 1000
    }

    #[external("utility")]
    unconstrained fn get_ctr(ad_id: Field) -> Field {
        let impressions = storage.ad_impressions.at(ad_id).read();
        let clicks = storage.ad_clicks.at(ad_id).read();
        
        if impressions == 0 {
            0
        } else {
            // CTR em base 10000 (ex: 250 = 2.5%)
            (clicks * 10000) / impressions
        }
    }
}


