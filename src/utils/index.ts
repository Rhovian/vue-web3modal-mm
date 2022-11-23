import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, providers } from "ethers";
import { ChainID } from "@/constants";

const getEthereum = () => {
  // @ts-ignore
  return window.ethereum;
};

const checkNetwork = async () => {
  if (getEthereum()) {
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
  }
};

export const connectWeb3 = async (isConnected: boolean) => {
  if (isConnected) return;

  const ethProvider = await detectEthereumProvider();
  const provider = new providers.Web3Provider(ethProvider!);

  if (provider) {
    const { isUnlocked } = getEthereum()._metamask;

    if (await isUnlocked()) {
      try {
        const accounts: string[] = await getEthereum().request({
          method: "eth_requestAccounts",
        });

        await checkNetwork();

        return [accounts, provider];
      } catch (err) {
        console.log(err);
        return [null, null];
      }
    } else {
      await getEthereum().request({
        method: "eth_requestAccounts",
      });
    }
  }
};
