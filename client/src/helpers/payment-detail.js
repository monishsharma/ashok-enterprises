export const getExtraAdvacnePaymentForThisMonth = (rowData) => {
    return rowData && rowData.extraAdvance && rowData.extraAdvance.deduction && rowData.extraAdvance.deduction.map(list => {
        if (new Date(list.time).getMonth() === new Date().getMonth()) {
            return list.amount;
        }
    });
}