import { configureChains, createClient } from "@wagmi/core";

import { mainnet, goerli } from "@wagmi/core/chains";

import { Web3Modal } from "@web3modal/html";
import { store } from "@/store";

const ID = import.meta.env.VITE_APP_ID;

import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";

const chains = [mainnet, goerli];

// Wagmi Core Client
const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId: ID }),
]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: "web3Modal", chains }),
  provider,
});

wagmiClient.subscribe(async (state) => {
  console.log(state.status);
  if (state.status === "connected") {
    await store.connect();
  }
});
// Web3Modal and Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains);

export const web3modal = new Web3Modal({ projectId: ID }, ethereumClient);
