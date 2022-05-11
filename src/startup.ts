import { create_sequence } from "./modules/sequence/service";

export const initializeSequences = () => {
  create_sequence("assetId", null, 1);
  create_sequence("companyId", null, 1);
};
