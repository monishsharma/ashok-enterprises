import moment from "moment";

const GST_STATE_CODES = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh'
};

export const getFileName = ({ forGST, forUnpaid }) => {
    if (forGST) {
        return "GST";
    }
    if (forUnpaid) {
        return "Unpaid Invoices";
    }
    return "Sales";
}

export const getCSVHeader = ({ forGST, forUnpaid, company }) => {
  const isCompanyAshok = company === "ASHOK";
    if (forGST) {
        return [
            'GSTIN/UIN of Recipient',
            'Receiver Name',
            'Invoice Number',
            'Invoice date',
            'Invoice Value',
            'Place Of Supply',
            'Reverse Charge',
            'Applicable % of Tax Rate',
            'Invoice Type',
            'E-Commerce GSTIN',
            'Rate',
            'Taxable Value',
            'Cess Amount',
        ]
    }

    if (forUnpaid) {
        return [
            'S N0',
            'BILL',
            isCompanyAshok ? 'PO NUMBER' : 'PARTY NAME',
            'DATE',
            'AMOUNT',
        ]
    }

    return [
        'S N0',
        'BILL',
        'DATE',
        'PARTY NAME',
        'GSTIN',
        'HSN',
        'QTY',
        "TYPE",
        'SGST 9%',
        'CGST 9%',
        'IGST 18%',
        'TAXABLE VALUE',
        'AMOUNT',
        'FREIGHT'
    ];

}

export const getCsvBody = ({ forGST, forUnpaid, data, company }) => {
  const isCompanyAshok = company === "ASHOK";
  return data.map((item, index) => {
    const billNo = item.invoiceDetail?.invoiceNO || '';
    const poNumber = item.goodsDescription?.po || '';
    const invoiceDate = moment(item.invoiceDate).format("DD-MMM-YY");
    const excelInvoiceDate = new Date(item.invoiceDate);
    const gstin = item.buyerDetail?.GSTIN || '';
    const partyName = item.buyerDetail?.customerName || item.buyerDetail?.customer || '';
    const hsn = item.goodsDescription?.HSN || '';
    const freight = item.goodsDescription?.freight || 0;
    const amount = parseFloat(item.goodsDescription?.Total || 0);
    const items = item.goodsDescription?.items || [];
    const sgst = item.goodsDescription?.SGST || 0;
    const cgst = item.goodsDescription?.CGST || sgst;
    const igst = item.goodsDescription?.IGST || sgst * 2;
    const type = item.goodsDescription?.type || '';
    const taxableValue = item.goodsDescription?.taxableValue || 0;
    const isLocalVendor = gstin?.substring(0, 2) || '';
    const placeOfSupply = `${isLocalVendor}-${GST_STATE_CODES[isLocalVendor] || 'Unknown'}`;

    const totalQty = items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);

    if (forGST) {
      return [
        gstin,
        partyName,
        Number(billNo.split("-")[2] || ''),
        excelInvoiceDate,
        Number(amount),
        placeOfSupply,
        'N', // Reverse charge
        '',
        'Regular B2B',
        '',
        Number(18.00), // Rate
        Number(taxableValue),
        Number(0.00)
      ];
    }

    if (forUnpaid) {
      return [
        index + 1,
        billNo.split("-")[2] || '',
        ...(isCompanyAshok ? [poNumber] : [partyName]),
        invoiceDate,
        amount
      ];
    }

    return [
      index + 1,
      billNo.split("-")[2] || '',
      invoiceDate,
      partyName,
      gstin,
      hsn,
      totalQty,
      type,
      isLocalVendor === "23" ? sgst : 0,
      isLocalVendor === "23" ? cgst : 0,
      isLocalVendor !== "23" ? igst : 0,
      taxableValue,
      amount,
      freight
    ];
  });
};

export const getHsnHeaders = () => {
    return [
      "HSN",
      "Description",
      "UQC",
      "Total Quantity",
      "Total Value",
      "Rate",
      "Taxable Value",
      "Integrated Tax Amount",
      "Central Tax Amount",
      "State/UT Tax Amount",
      "Cess Amount",
  ]
};

export const getHSNRows = (invoices, appConfig) => {
  const hsnMap = {};
  let uqcMap = {
    SQFT: "SQF-SQUARE FEET"
  };
  const {data: {uqc = {}} = {}} = appConfig || {};
  uqc.values.map((val) => {
    uqcMap = {
      ...uqcMap,
      [val.uqc]: `${val.uqc}-${val.desc}`
    }
  })


  invoices.forEach((invoice) => {
    const goods = invoice.goodsDescription || {};
    const buyer = invoice.buyerDetail || {};

    const hsn = goods.HSN || "";
    const type = goods.type || "";

    if (!hsn) return;


    const uqc = uqcMap[type.toUpperCase()] || type;

    const totalQty = (goods.items || []).reduce(
      (sum, item) => sum + (parseFloat(item.qty) || 0),
      0
    );

    const totalValue = parseFloat(goods.Total) || 0;
    const taxableValue = parseFloat(goods.taxableValue) || 0;

    const stateCode =
      buyer.stateCode ||
      buyer.GSTIN?.substring(0, 2) ||
      "";

    const isLocal = stateCode === "23";

    const cgst = isLocal
      ? parseFloat(goods.CGST) || 0
      : 0.00;

    const sgst = isLocal
      ? parseFloat(goods.SGST) || 0
      : 0;

    const igst = !isLocal
      ? parseFloat(goods.CGST) + parseFloat(goods.SGST) || 0
      : 0.00;

    const rate = 18.00;

    // Same HSN but different UQC must be separate
    const key = `${hsn}_${uqc}_${rate}`;

    if (!hsnMap[key]) {
      hsnMap[key] = {
        hsn,
        description: "",
        uqc,
        totalQty: 0,
        totalValue: 0,
        rate,
        taxableValue: 0,
        igst: 0,
        cgst: 0,
        sgst: 0,
        cess: 0.00,
      };
    }

    hsnMap[key].totalQty += totalQty;
    hsnMap[key].totalValue += totalValue;
    hsnMap[key].taxableValue += taxableValue;
    hsnMap[key].igst += igst;
    hsnMap[key].cgst += cgst;
    hsnMap[key].sgst += sgst;
  });

  return Object.values(hsnMap).map((item) => [
    item.hsn,
    item.description,
    item.uqc,
    Number(item.totalQty.toFixed(2)),
    Number(item.totalValue.toFixed(2)),
    item.rate,
    Number(item.taxableValue.toFixed(2)),
    Number(item.igst.toFixed(2)),
    Number(item.cgst.toFixed(2)),
    Number(item.sgst.toFixed(2)),
    (item.cess),
  ]);
};

export const uniqueRecipients = (invoices) => {
    return new Set(
      invoices
        .map((item) => item.buyerDetail?.GSTIN)
        .filter(Boolean)
    ).size;
}

export const totalInvoiceValue = (invoices) => {
    return invoices.reduce(
      (sum, item) =>
        sum + Number(item.goodsDescription?.Total || 0),
      0
    );
}

export const totalTaxableValue = (invoices) => {
    return invoices.reduce(
      (sum, item) =>
        sum + Number(item.goodsDescription?.taxableValue || 0),
      0
    );
}