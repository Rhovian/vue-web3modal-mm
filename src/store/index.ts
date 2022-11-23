import { reactive } from "vue";
import type { StoreInterface } from "@/models";
import { connectWeb3 } from "@/utils";

export const store: StoreInterface = reactive({
  isConnected: false,
  activeAccount: "",
  provider: null,
  connect: async () => {
    if (store.isConnected) return;

    const { accounts, provider } = await connectWeb3();

    if (accounts && provider) {
      store.isConnected = true;
      store.activeAccount = accounts[0];
      store.provider = provider;
    }
  },
});
