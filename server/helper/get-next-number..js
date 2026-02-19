export const getNextNumber = (documnetNo) => {
  const [prefix, year, number] = documnetNo.split("-");
  const nextNumber = (parseInt(number, 10) + 1).toString().padStart(2, "0");
  return {
    lastDocumentNo: number,
    nextNumber,
  };
};
