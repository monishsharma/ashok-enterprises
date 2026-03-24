export const calculateDispatch = ({ poItems, invoices, company }) => {

  return poItems.map(item => {

    let dispatchedQty = 0;

    for (const inv of invoices) {

      const invItems = inv.goodsDescription?.items || [];

      for (const i of invItems) {

        let match = false;

        // NEW invoices
        if (i.poItemId) {
          match = i.poItemId === item.itemId;
        }

        // OLD invoices fallback
        else {

          if (company === "ASHOK") {

            if (Number(i.sno) === item.itemNo || Number(i.sno) === item.itemNo * 10) {
              match = true;
            }

          } else {

            if (Number(i.rate) === item.rate && dispatchedQty < item.qty) {
              match = true;
            }

          }

        }

        if (match) {
          if (company === "ASHOK") {
            dispatchedQty = Number(i.qty || 0)
          } else {

            dispatchedQty += Number(i.qty || 0);

          }
        }

      }

    }

    return {
      ...item,
      dispatchedQty,
      pendingQty: Math.max(item.qty - dispatchedQty, 0)
    };

  });

};