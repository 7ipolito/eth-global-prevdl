import { Fr } from '@aztec/aztec.js/fields';
import { getContractInstanceFromInstantiationParams, } from '@aztec/aztec.js/contracts';
import { SponsoredFPCContract } from '@aztec/noir-contracts.js/SponsoredFPC';
const SPONSORED_FPC_SALT = new Fr(0);
export async function getSponsoredFPCInstance() {
    return await getContractInstanceFromInstantiationParams(SponsoredFPCContract.artifact, {
        salt: SPONSORED_FPC_SALT,
    });
}
export async function getSponsoredFPCAddress() {
    return (await getSponsoredFPCInstance()).address;
}
export async function setupSponsoredFPC(deployer, log) {
    const [{ item: from }] = await deployer.getAccounts();
    const deployed = await SponsoredFPCContract.deploy(deployer)
        .send({
        from,
        contractAddressSalt: SPONSORED_FPC_SALT,
        universalDeploy: true,
    })
        .deployed();
    log(`SponsoredFPC: ${deployed.address}`);
}
//# sourceMappingURL=sponsored_fpc.js.map