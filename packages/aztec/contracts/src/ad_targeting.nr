use dep::aztec::macros::aztec;

/**
 * Contrato de Segmentação de Anúncios com Privacidade
 * 
 * Permite verificar se um usuário é compatível com um anúncio
 * sem revelar os dados pessoais do usuário publicamente.
 * 
 * CÓDIGOS DE INTERESSE (exemplos):
 * 1 = Tecnologia
 * 2 = Esportes
 * 3 = Moda
 * 4 = Viagens
 * 5 = Gastronomia
 * 
 * CÓDIGOS DE LOCALIZAÇÃO (exemplos):
 * 0 = Qualquer localização
 * 1 = São Paulo
 * 2 = Rio de Janeiro
 * 3 = Brasília
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
        // Contador de conversões (quando há match)
        ad_conversions: Map<Field, PublicMutable<Field, Context>, Context>,
    }

    #[external("public")]
    #[initializer]
    fn constructor(admin: AztecAddress) {
        storage.admin.write(admin);
    }

    /**
     * Função PRIVADA: Verifica se o anúncio é compatível com o usuário
     * 
     * Esta função roda no dispositivo do usuário e mantém os dados privados.
     * Apenas o resultado (match ou não) é revelado.
     */
    #[external("private")]
    fn check_ad_compatibility(
        ad_id: Field,
        // Dados do usuário (mantidos privados)
        user_age: u8,
        user_interest_1: u8,
        user_interest_2: u8,
        user_interest_3: u8,
        user_location: u8,
        user_gender: u8,
        // Requisitos do anúncio
        ad_min_age: u8,
        ad_max_age: u8,
        ad_required_interest: u8,
        ad_target_location: u8,
        ad_target_gender: u8,
    ) -> Field {
        // Verifica idade
        let age_match = (user_age >= ad_min_age) & (user_age <= ad_max_age);

        // Verifica se o usuário tem o interesse requerido
        let interest_match = (user_interest_1 == ad_required_interest)
            | (user_interest_2 == ad_required_interest)
            | (user_interest_3 == ad_required_interest);

        // Verifica localização (0 = qualquer localização)
        let location_match = (ad_target_location == 0) | (user_location == ad_target_location);

        // Verifica gênero (0 = qualquer gênero)
        let gender_match = (ad_target_gender == 0) | (user_gender == ad_target_gender);

        // Compatibilidade total: todas as condições devem ser verdadeiras
        let is_compatible = age_match & interest_match & location_match & gender_match;

        // Gera um nullifier para garantir que o mesmo usuário
        // não seja contado múltiplas vezes para o mesmo anúncio
        let msg_sender_keys = get_public_keys(context.msg_sender().unwrap());
        let secret = context.request_nsk_app(msg_sender_keys.npk_m.hash());
        let nullifier = poseidon2_hash([ad_id, context.msg_sender().unwrap().to_field(), secret]);
        context.push_nullifier(nullifier);

        // Se compatível, incrementa contador de conversões
        if is_compatible {
            AdTargeting::at(context.this_address())
                .record_conversion(ad_id)
                .enqueue(&mut context);
        }

        // Sempre incrementa impressões
        AdTargeting::at(context.this_address())
            .record_impression(ad_id)
            .enqueue(&mut context);

        // Retorna 1 se compatível, 0 se não
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
     * Função PÚBLICA: Registra uma conversão (match bem-sucedido)
     */
    #[external("public")]
    #[internal]
    fn record_conversion(ad_id: Field) {
        let current_conversions = storage.ad_conversions.at(ad_id).read();
        storage.ad_conversions.at(ad_id).write(current_conversions + 1);
    }

    /**
     * Função PÚBLICA: Consulta estatísticas de um anúncio
     */
    #[external("utility")]
    unconstrained fn get_ad_stats(ad_id: Field) -> (Field, Field) {
        let impressions = storage.ad_impressions.at(ad_id).read();
        let conversions = storage.ad_conversions.at(ad_id).read();
        (impressions, conversions)
    }

    /**
     * Função PÚBLICA: Calcula taxa de conversão (CTR)
     * Retorna a porcentagem multiplicada por 100 (ex: 2500 = 25%)
     */
    #[external("utility")]
    unconstrained fn get_conversion_rate(ad_id: Field) -> Field {
        let impressions = storage.ad_impressions.at(ad_id).read();
        let conversions = storage.ad_conversions.at(ad_id).read();
        
        if impressions == 0 {
            0
        } else {
            // Retorna (conversions * 10000) / impressions para ter 2 casas decimais
            (conversions * 10000) / impressions
        }
    }
}

