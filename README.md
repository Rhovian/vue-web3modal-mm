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

We the user to use a specific network for a project, such as Ethereum mainnet. We set this network in the ``constants/index`` folder, like so:

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

## Vue Store

The ``connectWeb3`` function above is called from a vue component ``Connect.vue`` found in ``src/components``. It is copied below:

```vue
<script setup lang="ts">
import { store } from "@/store";

const connect = async () => {
  await store.connect();
};
</script>

<template>
  <div id="connect-wrap">
    <button v-if="!store.isConnected" @click="connect">Connect</button>
    <button v-if="store.isConnected">
      {{ store.activeAccount }}
    </button>
  </div>
</template>
```

You can see that the function ``connectWeb3`` in the ``src/utils`` folder we have previously discussed is not called directly. Instead, it passes through our state management system. The system is intutive, and is found in ``src/store/index``. It's reproduced here:

```ts
import { markRaw, reactive } from "vue";
import type { StoreInterface } from "@/models";
import { connectWeb3 } from "@/utils";
import { contractStore } from "./contracts";

export const store: StoreInterface = reactive({
  isConnected: false,
  activeAccount: "",
  provider: null,
  signer: null,
  connect: async () => {
    if (store.isConnected) return;

    const { accounts, provider } = await connectWeb3();

    if (accounts && provider) {
      store.isConnected = true;
      store.activeAccount = accounts[0];
      store.provider = markRaw(provider);
      store.signer = markRaw(provider.getSigner());
      contractStore.createContractInstance(store.signer);
    }
  },
});
```

Here, you can see the ``connect`` function that is called when a user clicks the connect button from the ``Connect.vue`` component we defined above.  This connect function first checks if we are already connected, and returns if so. If we are not, then the ``connectWeb3`` function is called from the ``utils`` folder. We then check if the ``accounts`` and ``provider`` are valid, and then populate state based on that.

## State After Connection
populating the state is project dependant, but for this example, we do the following things: <br>

- set ``isConnected`` to ``true``, so that this function will not run this logic again in the same session.
- set the ``activeAccount`` to the first account returned from metamask
- set the ``provider`` field to a [raw](https://vuejs.org/api/reactivity-advanced.html#markraw) provider returned from metamask
- set the ``signer`` field to the user via the ``provider.getSigner()`` function. This is then used to instantiate contracts.

## Contract Instantiation

In order to instantiate a contract, we need three pieces of information:
- The address
- The ABI
- The signer or provider

We define the metadata of contracts relevant to our project in the ``src/constants`` folder like so:

```ts
export const CONTRACTS = [
  {
    network: 1,
    vrt: "0xBE682C3E3beB8e82623D30e9608Ca2313e47bA4D",
  },
];
```

You'll also find the ``abi`` folder in ``src/constants``, where the VRT token (as an example) is defined. Having all of these pieces of information, we can then inspect the ``createContractInstance`` function in the ``src/utils`` folder:

```ts
export const createContractInstance = (
  contractName: string,
  abi: any,
  signer: providers.Web3Provider
) => {
  const config = CONTRACTS.filter((c) => c.network == Number(ChainID));

  // @ts-ignore
  return markRaw(new ethers.Contract(config[0][contractName], abi, signer));
};
```

**function explanation** <br>

- We get the right network config based on the target chain ``ChainID``
- The new contract instance is then returned using the ethers [contract](https://docs.ethers.io/v5/api/contract/contract/) method. <br>

We can then circle back to our state management system, and fully define the last line in the ``connect`` function: <br>
``contractStore.createContractInstance(store.signer)`` <br>

Here what we are doing is calling a seperate store, namely the ``contractStore`` found in ``src/store/contracts``, defined below:

```ts
import { markRaw, reactive } from "vue";
import type { ContractStoreInterface } from "@/models";
import type { providers } from "ethers";
import { createContractInstance } from "@/utils";
import { vrtABI } from "@/constants/abi/vrt";

export const contractStore: ContractStoreInterface = reactive({
  vrt: null,
  createContractInstance: async (signer: providers.Web3Provider) => {
    contractStore.vrt = markRaw(createContractInstance("vrt", vrtABI, signer));
  },
});
```

This store will house all of our contracts, and showcases that we do not need a monolithic state management system, we can separate app logic into different stores!<br>
The ``createContractInstance`` function calls the function by the same name, that we've defined above and in the ``utils`` folder, and assign that contract to the ``vrt`` field in the contract store. From here, contract functions can be called as regular, with the signer attached.






