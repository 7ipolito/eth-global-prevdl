use dep::aztec::macros::aztec;

/**
 * Contrato de Segmentação de Anúncios com Privacidade - PREVDL
 * 
 * Permite verificar se um usuário é compatível com um anúncio
 * sem revelar os dados pessoais do usuário publicamente.
 * 
 * FILTROS SUPORTADOS:
 * - Idade (min/max)
 * - Localização (cidade/região)
 * - Profissão
 * - Interesses (até 3 por usuário)
 * - Gênero (opcional)
 * 
 * CÓDIGOS DE LOCALIZAÇÃO:
 * 0 = Qualquer localização
 * 1 = São Paulo
 * 2 = Rio de Janeiro
 * 3 = Brasília
 * 4 = Belo Horizonte
 * 5 = Porto Alegre
 * 10 = International
 * 99 = Outras cidades Brasil
 * 
 * CÓDIGOS DE PROFISSÃO:
 * 0 = Qualquer profissão
 * 1 = Software Engineer
 * 2 = Designer
 * 3 = Product Manager
 * 4 = Marketing
 * 5 = Sales
 * 6 = Entrepreneur
 * 7 = Student
 * 8 = Freelancer
 * 99 = Outras
 * 
 * CÓDIGOS DE INTERESSE:
 * 1 = Tech
 * 2 = Crypto
 * 3 = Gaming
 * 4 = Sports
 * 5 = Fashion
 * 6 = Travel
 * 7 = Food
 * 8 = Music
 * 9 = Art
 * 10 = Business
 * 
 * CÓDIGOS DE GÊNERO:
 * 0 = Qualquer gênero
 * 1 = Masculino
 * 2 = Feminino
 * 3 = Outro
 */

#[aztec]
pub contract AdTargeting {
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

    #[storage]
    struct Storage<Context> {
        admin: PublicMutable<AztecAddress, Context>,
        // Contador de impressões por anúncio (público)
        ad_impressions: Map<Field, PublicMutable<Field, Context>, Context>,
        // Contador de matches bem-sucedidos (quando há compatibilidade)
        ad_matches: Map<Field, PublicMutable<Field, Context>, Context>,
        // Contador de rejeições (não compatível)
        ad_rejections: Map<Field, PublicMutable<Field, Context>, Context>,
    }

    #[external("public")]
    #[initializer]
    fn constructor(admin: AztecAddress) {
        storage.admin.write(admin);
    }

    /**
     * Função PRIVADA: Verifica compatibilidade completa usuário-anúncio
     * 
     * IMPORTANTE: Esta função roda PRIVADAMENTE no dispositivo do usuário.
     * Os dados pessoais (idade, profissão, localização) NUNCA são revelados publicamente.
     * Apenas o resultado (match sim/não) é exposto.
     * 
     * @param ad_id - ID do anúncio
     * @param user_age - Idade do usuário (PRIVADO)
     * @param user_location - Localização do usuário (PRIVADO)
     * @param user_profession - Profissão do usuário (PRIVADO)
     * @param user_interest_1 - Primeiro interesse (PRIVADO)
     * @param user_interest_2 - Segundo interesse (PRIVADO)
     * @param user_interest_3 - Terceiro interesse (PRIVADO)
     * @param user_gender - Gênero do usuário (PRIVADO, opcional)
     * @param ad_min_age - Idade mínima target (PÚBLICO)
     * @param ad_max_age - Idade máxima target (PÚBLICO)
     * @param ad_target_location - Localização target (PÚBLICO)
     * @param ad_target_profession - Profissão target (PÚBLICO)
     * @param ad_required_interest - Interesse requerido (PÚBLICO)
     * @param ad_target_gender - Gênero target (PÚBLICO)
     * @return 1 se compatível, 0 se não
     */
    #[external("private")]
    fn check_ad_compatibility(
        ad_id: Field,
        // DADOS PRIVADOS DO USUÁRIO (nunca revelados)
        user_age: u8,
        user_location: u8,
        user_profession: u8,
        user_interest_1: u8,
        user_interest_2: u8,
        user_interest_3: u8,
        user_gender: u8,
        // DADOS PÚBLICOS DA CAMPANHA (target audience)
        ad_min_age: u8,
        ad_max_age: u8,
        ad_target_location: u8,
        ad_target_profession: u8,
        ad_required_interest: u8,
        ad_target_gender: u8,
    ) -> Field {
        // ============================================
        // VERIFICAÇÃO DE COMPATIBILIDADE (PRIVATE)
        // ============================================
        
        // 1. Verifica IDADE
        let age_match = (user_age >= ad_min_age) & (user_age <= ad_max_age);

        // 2. Verifica LOCALIZAÇÃO (0 = qualquer localização)
        let location_match = (ad_target_location == 0) | (user_location == ad_target_location);

        // 3. Verifica PROFISSÃO (0 = qualquer profissão)
        let profession_match = (ad_target_profession == 0) | (user_profession == ad_target_profession);

        // 4. Verifica INTERESSE (usuário tem até 3 interesses)
        let interest_match = (user_interest_1 == ad_required_interest)
            | (user_interest_2 == ad_required_interest)
            | (user_interest_3 == ad_required_interest);

        // 5. Verifica GÊNERO (0 = qualquer gênero)
        let gender_match = (ad_target_gender == 0) | (user_gender == ad_target_gender);

        // ============================================
        // COMPATIBILIDADE FINAL
        // ============================================
        // Todas as condições devem ser verdadeiras para match
        let is_compatible = age_match & interest_match & location_match & gender_match & profession_match;

        // ============================================
        // ANTI-FRAUDE: NULLIFIER
        // ============================================
        // Gera um nullifier único para (usuário + anúncio)
        // Previne que o mesmo usuário seja contado múltiplas vezes
        let msg_sender_keys = get_public_keys(context.msg_sender().unwrap());
        let secret = context.request_nsk_app(msg_sender_keys.npk_m.hash());
        let nullifier = poseidon2_hash([ad_id, context.msg_sender().unwrap().to_field(), secret]);
        context.push_nullifier(nullifier);

        // ============================================
        // REGISTRO DE MÉTRICAS (PUBLIC)
        // ============================================
        // Incrementa contador de impressões (sempre)
        AdTargeting::at(context.this_address())
            .record_impression(ad_id)
            .enqueue(&mut context);

        // Se compatível, incrementa matches. Senão, incrementa rejeições
        if is_compatible {
            AdTargeting::at(context.this_address())
                .record_match(ad_id)
                .enqueue(&mut context);
        } else {
            AdTargeting::at(context.this_address())
                .record_rejection(ad_id)
                .enqueue(&mut context);
        }

        // ============================================
        // RETORNO
        // ============================================
        // Retorna 1 se compatível, 0 se não
        // IMPORTANTE: Apenas este boolean é revelado publicamente
        // Os dados do usuário permanecem privados
        if is_compatible {
            1
        } else {
            0
        }
    }

    /**
     * Função PÚBLICA: Registra uma impressão do anúncio
     */
    #[external("public")]
    #[internal]
    fn record_impression(ad_id: Field) {
        let current_impressions = storage.ad_impressions.at(ad_id).read();
        storage.ad_impressions.at(ad_id).write(current_impressions + 1);
    }

    /**
     * Função PÚBLICA: Registra um match bem-sucedido
     */
    #[external("public")]
    #[internal]
    fn record_match(ad_id: Field) {
        let current_matches = storage.ad_matches.at(ad_id).read();
        storage.ad_matches.at(ad_id).write(current_matches + 1);
    }

    /**
     * Função PÚBLICA: Registra uma rejeição (não compatível)
     */
    #[external("public")]
    #[internal]
    fn record_rejection(ad_id: Field) {
        let current_rejections = storage.ad_rejections.at(ad_id).read();
        storage.ad_rejections.at(ad_id).write(current_rejections + 1);
    }

    /**
     * Função PÚBLICA: Consulta estatísticas de um anúncio
     * @return (impressions, matches, rejections)
     */
    #[external("utility")]
    unconstrained fn get_ad_stats(ad_id: Field) -> (Field, Field, Field) {
        let impressions = storage.ad_impressions.at(ad_id).read();
        let matches = storage.ad_matches.at(ad_id).read();
        let rejections = storage.ad_rejections.at(ad_id).read();
        (impressions, matches, rejections)
    }

    /**
     * Função PÚBLICA: Calcula taxa de match (Match Rate)
     * Retorna a porcentagem multiplicada por 10000 (ex: 2500 = 25.00%)
     */
    #[external("utility")]
    unconstrained fn get_match_rate(ad_id: Field) -> Field {
        let impressions = storage.ad_impressions.at(ad_id).read();
        let matches = storage.ad_matches.at(ad_id).read();
        
        if impressions == 0 {
            0
        } else {
            // Retorna (matches * 10000) / impressions para ter 2 casas decimais
            (matches * 10000) / impressions
        }
    }

    /**
     * Função PÚBLICA: Calcula eficiência do targeting
     * Quanto maior, melhor o targeting (menos desperdício)
     */
    #[external("utility")]
    unconstrained fn get_targeting_efficiency(ad_id: Field) -> Field {
        let matches = storage.ad_matches.at(ad_id).read();
        let rejections = storage.ad_rejections.at(ad_id).read();
        let total = matches + rejections;
        
        if total == 0 {
            0
        } else {
            // Retorna eficiência em %
            (matches * 10000) / total
        }
    }
}

