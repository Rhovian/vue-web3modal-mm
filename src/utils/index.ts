import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, providers } from "ethers";
import { ChainID } from "@/constants";
import { CONTRACTS } from "@/constants";
import { markRaw } from "vue";

export const createContractInstance = (
  contractName: string,
  abi: any,
  signer: providers.Web3Provider
) => {
  const config = CONTRACTS.filter((c) => c.network == Number(ChainID));

  // @ts-ignore
  return markRaw(new ethers.Contract(config[0][contractName], abi, signer));
};

const getEthereum = () => {
  // @ts-ignore
  return window.ethereum;
};

export const connectProvider = () => {
  const provider: any = getEthereum();

  if (provider) {
    return new ethers.providers.Web3Provider(provider);
  }
};

const checkNetwork = async () => {
  const hex = "0x" + parseInt(ChainID).toString(16);

  try {
    // check if the chain to connect to is installed
    await getEthereum().request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hex }], // chainId must be in hexadecimal numbers
    });
  } catch (error) {
    // This error code indicates that
    /// the chain has not been added to MetaMask
    // if it is not, then install it into the user MetaMask
    // @ts-ignore
    if (error.code === 4902) {
      try {
        await getEthereum().request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hex,
              rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            },
          ],
        });
      } catch (addError) {
        console.log(addError);
      }
    }
  }
};

interface ConnectResult {
  accounts: string[] | null;
  provider: ethers.providers.Web3Provider | null;
}

export const connectWeb3 = async (): Promise<ConnectResult> => {
  const ethProvider = await detectEthereumProvider();
  const provider = new providers.Web3Provider(ethProvider!);

  if (provider) {
    try {
      const accounts: string[] = await getEthereum().request({
        method: "eth_requestAccounts",
      });

      await checkNetwork();

      return { accounts, provider };
    } catch (err) {
      console.log(err);
      return { accounts: null, provider: null };
    }
  } else {
    return { accounts: null, provider: null };
  }
};
