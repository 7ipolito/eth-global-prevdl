use dep::aztec::{
    protocol_types::address::AztecAddress, test::helpers::test_environment::TestEnvironment,
};

use crate::AdTargeting;

pub unconstrained fn setup() -> (TestEnvironment, AztecAddress, AztecAddress) {
    let mut env = TestEnvironment::new();

    let admin = env.create_light_account();

    let initializer_call_interface = AdTargeting::interface().constructor(admin);
    let ad_contract_address =
        env.deploy("AdTargeting").with_public_initializer(admin, initializer_call_interface);

    (env, ad_contract_address, admin)
}


