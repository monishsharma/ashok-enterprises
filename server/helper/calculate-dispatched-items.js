export const calculateDispatch = ({ poItems, invoices, company }) => {

  return poItems.map(item => {

    let dispatchedQty = 0;

    for (const inv of invoices) {

      const invItems = inv.goodsDescription?.items || [];

      for (const i of invItems) {

        let match = false;

        // NEW invoices
        if (i.itemId) {
          match = i.itemId == item.itemId;
        }

        // OLD invoices fallback
        if (match) {
          dispatchedQty += Number(i.qty || 0);
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