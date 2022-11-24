import type { providers, Contract } from "ethers";

export interface ContractStoreInterface {
  vrt: Contract | null;
  createContractInstance: Function;
}

export interface StoreInterface {
  isConnected: boolean;
  activeAccount: string | null;
  provider: providers.Web3Provider | null;
  signer: providers.JsonRpcSigner | null;
  connect: Function;
}
