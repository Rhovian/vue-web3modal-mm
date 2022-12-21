import { markRaw, reactive } from "vue";
import type { StoreInterface } from "@/models";
import { contractStore } from "./contracts";
import { fetchSigner, getProvider, getAccount } from "@wagmi/core";

export const store: StoreInterface = reactive({
  isConnected: false,
  activeAccount: `0x${""}`,
  provider: null,
  signer: null,
  connect: async () => {
    console.log("here", store.isConnected);
    if (store.isConnected) return;

    store.isConnected = true;
    store.provider = await getProvider();
    store.activeAccount = await getAccount().address;
    // @ts-ignore
    store.signer = markRaw(await fetchSigner());
    contractStore.createContractInstance(store.signer);
  },
});
