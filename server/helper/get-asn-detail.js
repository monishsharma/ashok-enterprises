import Axios from "axios";
import * as cheerio from "cheerio";
import {CG_COOKIE} from "./app-constant.js"
import moment from "moment";

const formatDate = (dateStr) => moment(dateStr, "YYYY-MM-DD").format("DD MMM YYYY");


export const getAsnDetail = async ({poNumber, invoiceDetail}) => {

    const url = `https://itapps.cgglobal.com/CGSCM/PEN/Delivery/LIST_ASN?Type=C&param=S&PO=${poNumber}&dtFrom=&dtto=&Mat=&stts=0&VC=&_=` + Date.now();

    const { data } = await Axios.get(url, {

        headers: {
        "Cookie": CG_COOKIE, // your CG portal cookie
        "User-Agent": "Mozilla/5.0",
        },
    });



    const $ = cheerio.load(data);

    // 1️⃣ Check if "Data Not Found" message exists
    const noDataText = $('#gridContent .table:contains("Data Not Found")').text().trim();
    if (noDataText.includes("Data Not Found")) {
        // Throw error to fail API
        throw new Error(`ASN data not found for PO ${poNumber}`);
    }


    const poCell = $('td.colCenter a[target="_blank"]').first();
    const poHref = poCell.attr('href');
    const poNum = poCell.text().trim();
    const generateAsnHref = $('a:contains("Generate ASN")').attr('href') || null;

    const asnRows = $('#subT tbody tr').map((i, el) => {
        const tds = $(el).find('td');
        const invoiceNo = $(tds[0]).text().trim();
        const asnNumber = $(tds[1]).text().trim();
        const asnDate = $(tds[2]).text().trim();
        const status = $(tds[3]).text().trim();

        const links = $(tds[4]).find('a');
        const viewLink = links.filter((_, a) => $(a).text().trim() === "View").attr('href') || null;
        const printLink = links.filter((_, a) => $(a).text().trim() === "Print").attr('href') || null;
        const editLink = $(tds[4]).find('a:contains("Edit")').attr('href') || null;
        return {
            invoiceNo,
            asnNumber,
            asnDate,
            status,
            viewLink,
            printLink,
            editLink
        };
    }).get();

    // 3️⃣ Final structured output
    const result = {
    poNum,
    poHref,
    generateAsnHref,
    asnList: asnRows
    };

    return result;

}

const getPayloadForASN = ({invoiceDetail, poNumber, finalStep, asnNumber = ""}) => {

    const {
        invoiceDetail: {
            invoiceNO,
            invoiceDate
        },
        shippingDetail: {
            vehicleNo,
            eway
        }
    } = invoiceDetail;
    return {
        items: {
            "vStatus": finalStep ? "CA":"GA",
            "ASN": asnNumber ?  asnNumber : "0",
            "INVOICE_NO": invoiceNO,
            "dtINVOICE": formatDate(invoiceDate),
            "PONumber": poNumber,
            "TRANSPORT_NAME": "N/A",
            "DRIVER_NAME": "N/A",
            "DRIVER_CONTNO": "N/a",
            "VEHICLE_NO": vehicleNo,
            "LR_NO": "N/A",
            "dtLR_DATE": formatDate(invoiceDate),
            "EwayBillNo": eway || "N/A",
            "dtEwayBillDate": formatDate(invoiceDate),
            "SRN_XML": "<SRN></SRN>",
            "NONCTQ_XML": "<SRNITEM></SRNITEM>"
        }
    }
}

const getAsnNumber = async(editLink) => {
    const url = `https://itapps.cgglobal.com${editLink}`;

     const { data } = await Axios.get(url, {

        headers: {
        "Cookie": CG_COOKIE, // your CG portal cookie
        "User-Agent": "Mozilla/5.0",
        },
    });

    const $ = cheerio.load(data);
    const existingAsn = $('#hfASN_No').val();
    return existingAsn;

}

export const saveASN = async({invoiceDetail, asnDetail, poNumber, finalStep}) => {
    let asnNumber = "";
    const { asnList } = asnDetail;
    const {invoiceDetail: {invoiceNO}} = invoiceDetail;
    const parts = invoiceNO.split('-'); // splits by '-'
    const lastPart = parts[parts.length - 1];


    const asnGeneratedAlready = asnList.find(item =>  item.invoiceNO == lastPart || item.invoiceNo === invoiceNO);

    if (asnGeneratedAlready) {
        asnNumber = await getAsnNumber(asnGeneratedAlready.editLink);
    }
    const payload = getPayloadForASN({invoiceDetail, poNumber, finalStep, asnNumber});
    const url = "https://itapps.cgglobal.com/CGSCM/PEN/Delivery/SAVE_ASN";

    try {

        const { data } = await Axios.post(url, payload, {
            headers: {
            "Cookie": CG_COOKIE, // your CG portal cookie
            "User-Agent": "Mozilla/5.0",
            },
        });

        return {...data, ...asnDetail};

    } catch(error) {
        console.log("❌ SAVE_ASN error:", error.message);
        return error;
    }


}


export const fetchItemsForDispatch = async({poNumber, asnNumber, invoiceDetail}) => {


    let itemsForDispatch;
    const passedItems = [];
    const {
        goodsDescription: {
            items
        }
    } = invoiceDetail;

    try {
        const url = "https://itapps.cgglobal.com/CGSCM/PEN/Delivery/ITEM_DESPATCH";
        const payload = {
            Po: poNumber,
            ASN: asnNumber,
            dtFrom: "",
            dtTo: "",
            Item: "",
            MatCode: ""
        }
        const { data } = await Axios.post(url, payload, {
            headers: {
                "Cookie": CG_COOKIE, // your CG portal cookie
                "User-Agent": "Mozilla/5.0",
            },
        })

        itemsForDispatch = data;
    } catch (error) {
        return error;
    }

    for (const item of items) {
        // 1️⃣ Convert sno (like 10) → padded POITEM ("00010")
        const storedItemNo = item.sno.toString().padStart(5, "0");

        // 2️⃣ Find matching item in itemsForDispatch
        const match = itemsForDispatch.find(d => d.POITEM === storedItemNo);

        if (!match) {
            throw new Error(`No matching POITEM found for sno ${item.sno} (${storedItemNo})`);
        }

        // 3️⃣ Compare qty
        const invoiceQty = parseFloat(item.qty);
        const availableQty = parseFloat(match.Bal_Qty);

        if (invoiceQty > availableQty) {
            throw new Error(
                `Insufficient balance for POITEM ${match.POITEM} — trying to dispatch ${invoiceQty} but only ${availableQty} available`
            );
        }

        passedItems.push({
            SCID: match.SCID,
            ITEMCODE: match.ItemCode,
            QTY: invoiceQty,
            POITEM: storedItemNo,
        });
    }

    if (passedItems.length !== items.length) {
        throw new Error(`Validation failed: ${items.length - passedItems.length} of ${items.length} items did not pass checks.`);
    }

    for (const passItem of passedItems) {

        const payload = {
            po: poNumber,
            ASN: asnNumber,
            Param: "IN",
            item_XML: `<NCTQ><ROW><SCHID>${passItem.SCID}</SCHID><ITEM>${passItem.ITEMCODE}</ITEM><QTY>${passItem.QTY}</QTY></ROW></NCTQ>`
        };

        // 5️⃣ Post to API
        const url = "https://itapps.cgglobal.com/CGSCM/PEN/Delivery/MOVETODISP";

        try {

            const { data } = await Axios.post(url, payload, {
                headers: {
                Cookie: CG_COOKIE,
                "User-Agent": "Mozilla/5.0",
                },
            });

            return data;


        } catch (err) {
            console.error(`❌ MOVETODISP failed for POITEM:`, err.message);
            throw err;
        }

    }
}

export const generateASN = async({ invoiceDetail, poNumber }) => {
    try {
        const result = await saveASN({invoiceDetail, poNumber, finalStep: true});
        return result;
    } catch (err) {
            console.error(`❌ generateASN failed for POITEM:`, err.message);
            throw err;
        }
}


