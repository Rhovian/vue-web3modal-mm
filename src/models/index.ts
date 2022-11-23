import type { providers } from "ethers";

export interface StoreInterface {
  isConnected: boolean;
  activeAccount: string | null;
  provider: providers.Web3Provider | null;
  connect: Function;
}
