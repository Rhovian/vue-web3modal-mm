import { markRaw, reactive } from "vue";
import type { ContractStoreInterface } from "@/models";
import { createContractInstance } from "@/utils";
import { vrtABI } from "@/constants/abi/vrt";

export const contractStore: ContractStoreInterface = reactive({
  vrt: null,
  createContractInstance: async (signer: any) => {
    contractStore.vrt = markRaw(createContractInstance("vrt", vrtABI, signer));
    console.log(contractStore.vrt);
  },
});
