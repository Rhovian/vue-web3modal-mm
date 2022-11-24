# web3-vue-scaffolding

This template should help get you started developing with Web3, Vue3, and Vite.

## Connecting to Web3

The logic for connecting to web3 is in the ``src/utils`` folder. The function is reproduced here:

```ts
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
```

**Function explanation**<br>
- First, it checks whether web3 is enabled in the clients browser with [detectEthereumProvider](https://github.com/MetaMask/detect-provider)
- if there is a provider, we use a metamask [method](https://docs.metamask.io/guide/rpc-api.html#restricted-methods) ``eth_requestAccounts`` to prompt the user to connect our Dapp to metamask and retrieve the list of accounts a user has.
- if successful, we return the list of accounts and provider (after checking that the network is the one we specify with ``checkNetwork`` method.)


### Changing Network Configuraton

We want to the user to use a specific network for a project, such as Ethereum mainnet. We set this network in the ``constants/index`` folder, like so:

```ts
export const ChainID = import.meta.env.VITE_NETWORK_ID || "1";
```

By default, we use ethereum mainnet. If we were to target a different network, say for testing purposes, we would need to create a ``.env`` file with the following data

```
VITE_NETWORK_ID = <target network>
```

After this is done, we can look at the ``checkNetwork`` function:

```ts
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
```

**Function explanation**<br>

- first, we convert the ``ChainID`` variable to a hexadecimal version, as this is what metamask expects.
- Then, the metamask [method](https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods) to request a switch in network. If the user is currently on the correct chain, nothing happens. Otherwise a popup will appear for a chain switch.
- If the chain has not been added by a user, (error 4902), a popup will appear to add the target chain.

