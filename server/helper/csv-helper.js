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

export const getCSVHeader = ({ forGST, forUnpaid }) => {

    if (forGST) {
        return [
            'GSTIN/UIN of Recipient',
            'Invoice Number',
            'Invoice date',
            'Taxable Value',
            'Invoice Value',
            'Place Of Supply',
            'Reverse Charge',
            'Rate',
            'Invoice Type',
            'IGST Paid',
            'Central Tax Paid',
            'State/UT Tax Paid',
        ]
    }

    if (forUnpaid) {
        return [
            'S N0',
            'BILL',
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

export const getCsvBody = ({ forGST, forUnpaid, data }) => {
  return data.map((item, index) => {
    const billNo = item.invoiceDetail?.invoiceNO || '';
    const invoiceDate = moment(item.invoiceDate).format("DD-MMM-YY");
    const gstin = item.buyerDetail?.GSTIN || '';
    const partyName = item.buyerDetail?.customer || '';
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
        billNo.split("-")[2] || '',
        invoiceDate,
        taxableValue,
        amount,
        placeOfSupply,
        'N', // Reverse charge
        '18', // Rate
        'Regular B2B', // Invoice type
        isLocalVendor !== "23" ? igst : 0,
        isLocalVendor === "23" ? cgst : 0,
        isLocalVendor === "23" ? sgst : 0
      ];
    }

    if (forUnpaid) {
      return [
        index + 1,
        billNo.split("-")[2] || '',
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