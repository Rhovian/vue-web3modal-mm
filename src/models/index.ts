import type { Provider } from "@wagmi/core";
import type { providers, Contract } from "ethers";

export interface ContractStoreInterface {
  vrt: Contract | null;
  createContractInstance: Function;
}

export interface StoreInterface {
  isConnected: boolean;
  activeAccount: `0x${string}` | undefined;
  provider: Provider | null;
  signer: providers.JsonRpcSigner | null;
  connect: Function;
}
