import { getCsvBody, getCSVHeader, getHsnHeaders, getHSNRows, totalInvoiceValue, totalTaxableValue, uniqueRecipients } from "./csv-helper.js";

const styleHeaderRow = ({ sheet, rowNumber, color = "F8CBAD" }) => {
    const columnCount = 13;
    const row = sheet.getRow(rowNumber);

    if (rowNumber === 1) {
        row.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: color,
                },
            };
            cell.alignment = {
                horizontal: "center",
                vertical: "middle",
            };
            cell.font = {
                bold: true,
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
        return;
    };

    for (let col = 1; col <= columnCount; col++) {
        const cell = row.getCell(col);

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: color,
            },
        };

        cell.alignment = {
            horizontal: "center",
            vertical: "middle",
        };

        cell.font = {
            bold: true,
            color: {
                argb: rowNumber === 4 ? "FFFFFF" : "000000"
            },
        };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
    };
}



const setCells = (sheet, cells) => {
    Object.entries(cells).forEach(([cell, value]) => {
        sheet.getCell(cell).value = value;
    });
};

const formatColumns = (sheet, formats) => {
    Object.entries(formats).forEach(([column, format]) => {
        sheet.getColumn(Number(column)).numFmt = format;
    });
};

const getHsnSummary = (rows) => {
    return {
        uniqueHSNCount: new Set(
            rows.map((row) => row[0])
        ).size,

        totalValue: rows.reduce(
            (sum, row) => sum + Number(row[4] || 0),
            0
        ),

        totalTaxableValue: rows.reduce(
            (sum, row) => sum + Number(row[6] || 0),
            0
        ),

        totalIGST: rows.reduce(
            (sum, row) => sum + Number(row[7] || 0),
            0
        ),

        totalCGST: rows.reduce(
            (sum, row) => sum + Number(row[8] || 0),
            0
        ),

        totalSGST: rows.reduce(
            (sum, row) => sum + Number(row[9] || 0),
            0
        ),

        totalCess: rows.reduce(
            (sum, row) => sum + Number(row[10] || 0),
            0
        ),
    };
};

export const addB2BSheet = ({
    workbook,
    invoices,
    company,
}) => {
    const sheet = workbook.addWorksheet("b2b,sez,de");

    setCells(sheet, {
        A1: "Summary For B2B, SEZ, DE (4A, 4B, 6B, 6C)",

        A2: "No. of Recipients",
        C2: "No. of Invoices",
        E2: "Total Invoice Value",
        L2: "Total Taxable Value",
        M2: "Total Cess",

        A3: uniqueRecipients(invoices),
        C3: invoices.length,
        E3: totalInvoiceValue(invoices),
        L3: totalTaxableValue(invoices),
        M3: 0,
    });

    styleHeaderRow({ sheet, rowNumber: 1, color: "F8CBAD" });
    styleHeaderRow({ sheet, rowNumber: 2, color: "F8CBAD" });

    const headers = getCSVHeader({
        forGST: true,
        forUnpaid: false,
        company,
    });

    sheet.addRow(headers);

    styleHeaderRow({ sheet, rowNumber: 4, color: "8727F5" });


    const rows = getCsvBody({
        forGST: true,
        forUnpaid: false,
        data: invoices,
        company,
    });

    rows.forEach((row) => {
        sheet.addRow(row);
    });

    formatColumns(sheet, {
        4: "dd-mmm-yy",
        5: "0.00",
        11: "0.00",
        12: "0.00",
        13: "0.00",
    });
};

export const addHsnSheet = ({
    workbook,
    invoices,
    appConfig
}) => {
    const sheet = workbook.addWorksheet("hsn(b2b)");

    const hsnRows = getHSNRows(invoices, appConfig);

    const summary = getHsnSummary(hsnRows);

    setCells(sheet, {
        A1: "Summary For HSN(12)",

        A2: "No. of HSN",
        E2: "Total Value",
        G2: "Total Taxable Value",
        H2: "Total Integrated Tax",
        I2: "Total Central Tax",
        J2: "Total State/UT Tax",
        K2: "Total Cess",

        A3: summary.uniqueHSNCount,
        E3: summary.totalValue,
        G3: summary.totalTaxableValue,
        H3: summary.totalIGST,
        I3: summary.totalCGST,
        J3: summary.totalSGST,
        K3: summary.totalCess,
    });

    styleHeaderRow({ sheet, rowNumber: 1, color: "F8CBAD" });
    styleHeaderRow({ sheet, rowNumber: 2, color: "F8CBAD" });

    sheet.addRow(getHsnHeaders());

    styleHeaderRow({ sheet, rowNumber: 4, color: "8727F5" });



    hsnRows.forEach((row) => {
        sheet.addRow(row);
    });

    formatColumns(sheet, {
        4: "0.00",
        5: "0.00",
        6: "0.00",
        7: "0.00",
        8: "0.00",
        9: "0.00",
        10: "0.00",
        11: "0.00",
    });
};
