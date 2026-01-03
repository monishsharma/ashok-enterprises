export const getQuery = ({month, year, previous, company}) => {

    const currentMonth = parseInt(month);
    const currentYear = parseInt(year);
    let queryMonth, queryYear, startDate, endDate;
    let currentQuery = {};

    if (previous) {
        queryMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        queryYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        startDate = new Date(queryYear, queryMonth - 1, 1);
        endDate = new Date(queryYear, queryMonth, 1);

        currentQuery = {company, invoiceDate: { $gte: startDate, $lt: endDate } };
    } else {
        startDate = new Date(currentYear, currentMonth - 1, 1);
        endDate = new Date(currentYear, currentMonth, 1);
        currentQuery = {company, invoiceDate: { $gte: startDate, $lt: endDate } };
    }



    return currentQuery;
}

export const calculateTotalSales = (invoices) =>
  invoices.reduce(
    (acc, inv) => {
      const amount = parseFloat(inv.goodsDescription.Total || 0);
      acc.total += amount;
      if (inv.paid) {
        acc.paid += parseFloat(inv.paymentAmount || 0);
        acc.due += parseFloat(inv.duePayment || 0);
      } else {
        acc.unpaid += amount;
      }
      return acc;
    },
    { total: 0, paid: 0, unpaid: 0, due: 0 }
);

const calculateGrowthPercentage = (currentTotal, previousTotal) => {
    if (previousTotal === 0) return {
        hasGrow: true,
        growthPercentage: 100
    };
    return {
        hasGrow: currentTotal > previousTotal,
        growthPercentage: parseFloat(((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1)
    };
}

export const calculateGrowth = (current, previous) => {
    if (previous.total < 0) return {hasGrow: true, growthPercentage: 100};
    return calculateGrowthPercentage(current.total, previous.total);
}

export const calculateTotalTons = (invoices) => {
    return invoices.reduce((totalQty, inv) => {
        if (inv.goodsDescription?.type === "KGS" && Array.isArray(inv.goodsDescription.items)) {
        const qty = inv.goodsDescription.items.reduce(
            (sum, item) => sum + (parseFloat(item.qty) || 0),
            0
        );
        return totalQty + qty;
        }
        return totalQty;
    }, 0);
}

export const calculateTonsGrowth = ({currentMonthInvoices, prevMonthInvoices}) => {

    const currentTons = calculateTotalTons(currentMonthInvoices);
    const previousTons = calculateTotalTons(prevMonthInvoices);

    return calculateGrowthPercentage(currentTons, previousTons);

}

export const monthlySalesQuery = ({company, year}) => {
  const currentYear = parseInt(year);
      const currentMonth = new Date().getMonth();
     const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const fyStart = new Date(fyStartYear, 3, 1); // April 1
      const fyEnd = new Date(fyStartYear + 1, 3, 1); // April 1 next year
      return {
        company,
        invoiceDate: { $gte: fyStart, $lt: fyEnd }
      }

}

export const calculateFYSales = (invoices) => {
    const monthlyTotals = Array(12).fill(0); // Initialize an array for 12 months

    invoices.forEach((inv) => {
        const amount = parseFloat(inv.goodsDescription.Total || 0);
        const actualMonth = new Date(inv.invoiceDate).getMonth();
        const fiscalMonthIndex = (actualMonth + 9) % 12;
        monthlyTotals[fiscalMonthIndex] += amount;
      });

    return monthlyTotals;
}

export const calcualteCustomerTotals = (invoices) => {
    const customerTotals = {};

  // Define grouping rules (you can add more later easily)
  const groupMap = {
    "rajasthan explosives / emul trek": "Rajasthan Explosives",
    "rajasthan explosives": "Rajasthan Explosives",

    "atlanta anand": "Atlanta Group",
    "atlanta banglore": "Atlanta Group",
    "atlanta": "Atlanta Group",

    "telawne ambernath": "Telawne Group",
    "telwane rabale": "Telawne Group",
    "telwane taloja": "Telawne Group",
    "telwane": "Telawne Group",
  };

  invoices.forEach((inv) => {
    let customer = (inv.buyerDetail.customerName || inv.buyerDetail.customer)?.trim() || "Unknown";
    const amount = parseFloat(inv.goodsDescription.Total || 0);

    // Normalize to lowercase for matching
    const normalized = customer.toLowerCase();

    // Replace with group name if found
    const groupName = groupMap[normalized] || customer;

    if (!customerTotals[groupName]) {
      customerTotals[groupName] = 0;
    }

    customerTotals[groupName] += amount;
  });

  return customerTotals;
}

export const getYear = (year) => {
    const currentYear = parseInt(year);
    const currentMonth = new Date().getMonth();
    const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;
    return fyStart;
}

export const getFYCustomerTotals = async ({ invoiceCollection, company }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;

  // Use your aggregation helper for consistent filtering
  const projection = {
    "buyerDetail.customer": 1,
    "goodsDescription.Total": 1,
  };
  const condition = [{}, {}, 0];

  await getInvoiceCollectionAgg({
    invoiceCollection,
    company,
    fyStart,
    projection,
    condition,
  });

  // Fetch all invoices for this FY
  const startDate = new Date(`${fyStart}-04-01`);
  const endDate = new Date(`${fyStart + 1}-03-31`);

  const invoices = await invoiceCollection
    .find({
      company,
      invoiceDate: { $gte: startDate, $lte: endDate },
    })
    .toArray();

  // ♻️ Reuse your same calculation logic
  const customerTotals = calcualteCustomerTotals(invoices);

  return customerTotals;
};

export const yearlyTotals = ({monthlyTotals, year}) => {
    // return response like 2025-2026: amount
    const total = monthlyTotals.reduce((acc, val) => acc + val, 0);
    return {
        [`${year}-${year + 1}`]: total
    }

}

const getInvoiceCollectionAgg = async({
  invoiceCollection, company, fyStart,
  projection,
  condition,
  match = {}
}) => {


  // Query all invoices from this FY onward (5 years range)
  const startDate = new Date(`${fyStart}-04-01`);
  const endDate = new Date(`${fyStart + 5}-03-31`);

  const result = await invoiceCollection.aggregate([
    {
      $match: {
        company,
        invoiceDate: { $gte: startDate, $lte: endDate },
        ...match
      }
    },
    {
      $project: {
        year: { $year: "$invoiceDate" },
        month: { $month: "$invoiceDate" },
        ...projection,
      }
    },
    {
      $addFields: {
        fyStart: {
          $cond: [
            { $gte: ["$month", 4] },
            "$year",
            { $subtract: ["$year", 1] }
          ]
        },
        qty: {
          $cond: [...condition]
        }
      }
    },
    {
      $group: {
        _id: "$fyStart",
        yearlyTotal: { $sum: "$total" },
        yearlyQty: { $sum: "$qty" }
      }
    },
    { $sort: { _id: 1 } }
  ]).toArray();

return result;;
}


export const getFYYearlyTotals = async (invoiceCollection, company) => {
  const projection = {
    total: { $toDouble: "$goodsDescription.Total" },
  };
  const condition = [{}, {}, 0]
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;
  const result = await getInvoiceCollectionAgg({invoiceCollection, company, fyStart, condition, projection});


  // Convert to object and fill missing FYs with 0
  const yearlyTotals = {};
  for (let i = 0; i < 5; i++) {
    const yearLabel = `${fyStart + i}-${fyStart + i + 1}`;
    const found = result.find(r => r._id === fyStart + i);
    yearlyTotals[yearLabel] = found ? parseInt(found.yearlyTotal) :0;
  }
  return yearlyTotals ;
};

export const calculateYearlyGrowth = ({yearlyTotals, year}) => {
    const currentYear = parseInt(year);
    const currentMonth = new Date().getMonth();
    const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;
    const years = Object.keys(yearlyTotals)
        .sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]));

    const selectedIndex = years.findIndex(y => y.split("-")[0] == fyStart);

    const currYear = years[selectedIndex];
    const currentYearSalesTotal = yearlyTotals[currYear] || 0;

    if (selectedIndex === 0) {
        return { hasGrow: true, growthPercentage: 100 };
    }

    const prevYear = years[selectedIndex - 1];
    const prevYearSalesTotal = yearlyTotals[prevYear] || 0;

    return calculateGrowthPercentage(currentYearSalesTotal, prevYearSalesTotal);


}


export const getItemBreakdown = (invoices) => {
    const itemDetails = {};

    invoices.forEach((inv) => {
        const type = inv.buyerDetail.orderType || "";
        const amount = parseFloat(inv.goodsDescription.Total || 0);
        const items = inv.goodsDescription.items || [];
        const totalItemQty = items.reduce(
            (sum, item) => sum + (parseFloat(item.qty) || 0),0);

         if (!itemDetails[type]) {
            itemDetails[type] = { total: 0, qty: 0 };
        }

        itemDetails[type].total += amount;
        itemDetails[type].qty += totalItemQty;

    });

    return itemDetails;
}

export const getYearlySales = ({yearlyTotals, year}) => {
    const selectedYear = getYear(year);
    const yearKey = `${selectedYear}-${selectedYear + 1}`;
    return yearlyTotals[yearKey] || 0;
}


export const getYearlyTons = async ({ invoiceCollection, company, needObj = false, year }) => {
  const projection = {
    type: "$goodsDescription.type",
    items: "$goodsDescription.items"
  };

  const condition = [
    { $eq: ["$type", "KGS"] },
    {
      $sum: {
        $map: {
          input: "$items",
          as: "item",
          in: { $toDouble: "$$item.qty" }
        }
      }
    },
    0
  ];

  const currentYear = getYear(year);
  const currentMonth = new Date().getMonth();
  const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;

  // Fetch aggregate data for next 5 FYs
  const result = await getInvoiceCollectionAgg({
    invoiceCollection,
    company,
    fyStart,
    projection,
    condition
  });

  if (!needObj) {
    const found = result.find(r => r._id === currentYear);
    return found ? parseInt(found.yearlyQty) :0;
  };

  // Convert Mongo result to { "2025-26": qty, ... } format
  const yearMap = {};

  for (let i = 0; i < 5; i++) {
    const fy = fyStart + i;
    const fyLabel = `${fy}-${String((fy + 1) % 100).padStart(2, "0")}`;

    const found = result.find(r => r._id === fy);
    yearMap[fyLabel] = found ? parseInt(found.yearlyQty.toFixed(0)) : 0;
  }

  return yearMap;
};

export const calculateYearlyPayment = async({
  invoiceCollection,
  company,
  paid,
  year
}) => {
  const currentYear = parseInt(year);
  const currentMonth = new Date().getMonth();
  const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;

  const match = {
    paid
  };

  const projection = {
    total: { $toDouble: "$goodsDescription.Total" },
  };

  const condition = [{}, {}, 0]

  const result = await getInvoiceCollectionAgg({
    invoiceCollection,
    company,
    fyStart,
    projection,
    condition,
    match
  });
  return parseInt(result?.[0]?.yearlyTotal);
}

export const getFYItemBreakdown = async ({ invoiceCollection, company, year }) => {
  const currentYear = parseInt(year);
  const currentMonth = new Date().getMonth();
  const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;

  // call your common aggregation helper (keeps consistency)
  const projection = {
    "buyerDetail.orderType": 1,
    "goodsDescription.Total": 1,
    "goodsDescription.items": 1,
  };
  const condition = [{}, {}, 0];

  await getInvoiceCollectionAgg({
    invoiceCollection,
    company,
    fyStart,
    projection,
    condition,
  });

  // Fetch all invoices for this FY
  const startDate = new Date(`${fyStart}-04-01`);
  const endDate = new Date(`${fyStart + 1}-03-31`);

  const invoices = await invoiceCollection
    .find({
      company,
      invoiceDate: { $gte: startDate, $lte: endDate },
    })
    .toArray();

  // ♻️ Reuse your same item breakdown logic
  const itemBreakdown = getItemBreakdown(invoices);

  return itemBreakdown;
};
