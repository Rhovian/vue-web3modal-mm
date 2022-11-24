# web3-vue-scaffolding

This template should help get you started developing with Web3, Vue3, and Vite.

## Connecting to Web3

The logic for connecting to web3 is in the ``utils`` folder. The function is reproducued here:

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

*Function explanation*
<br>
- First, it checks whether web3 is enabled in the clients browser with [detectEthereumProvider](https://github.com/MetaMask/detect-provider)
- if there is a provider, we use a metamask [method](https://docs.metamask.io/guide/rpc-api.html#restricted-methods) ``eth_requestAccounts`` to prompt the user to connect our Dapp to metamask and retrieve the list of accounts a user has.
- if successful, we return the list of accounts and provider (after checking that the network is the one we specify with ``checkNetwork`` method.)

