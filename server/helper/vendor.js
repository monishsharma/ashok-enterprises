import { ObjectId } from "mongodb";

export const injectId = (payload) => {
    payload.plantRows = payload.plantRows.map(branch => {
    const branchId = new ObjectId();
      if (!branch.id) {
        branch.id = branchId;
      } else {
        branch.id = new ObjectId(branch.id);
      }
      return branch;
  });
}