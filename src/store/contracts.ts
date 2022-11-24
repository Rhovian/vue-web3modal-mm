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
