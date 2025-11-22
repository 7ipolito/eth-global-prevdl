import { type ContractInstanceWithAddress } from '@aztec/aztec.js/contracts';
import type { Wallet } from '@aztec/aztec.js/wallet';
import type { LogFn } from '@aztec/foundation/log';
export declare function getSponsoredFPCInstance(): Promise<ContractInstanceWithAddress>;
export declare function getSponsoredFPCAddress(): Promise<import("@aztec/stdlib/aztec-address").AztecAddress>;
export declare function setupSponsoredFPC(deployer: Wallet, log: LogFn): Promise<void>;
//# sourceMappingURL=sponsored_fpc.d.ts.map