import axios from "axios";
import * as cheerio from "cheerio";

const clean = s => s.replace(/^0+/, '') || "0";

const headers = {
  Cookie: 'CKCgPen=DisplayName=ASHOK ENTERPRISES&UserID=0010000943&RoleID=VEND&EmailID=ashok_entp@rediffmail.com&dtFinyear=4/1/2025 12:00:00 AM&FinYear=2025-2026&UserType=N&Division=',
  "User-Agent": "Mozilla/5.0",
};

async function fetchPage(url) {
  const { data } = await axios.get(url, { headers });
  return cheerio.load(data);
}

function extractItems($) {
  const items = [];

  $("#gridContent table tbody tr").each((i, el) => {
    const tds = $(el).find("td").map((i, td) => $(td).text().trim()).get();

    if (tds.length > 5) {
      const qty = parseFloat(tds[7]) || 0;

      items.push({
        itemNo: clean(tds[1]),
        itemCode: clean(tds[2]),
        description: tds[3],
        uom: tds[4],
        drgNo: tds[5]?.split("/")?.[0].trim(),
        totalQty: qty,
        dispatchedQty: qty - parseFloat(tds[8] || 0),
        openQty: parseFloat(tds[8] || 0),
        status: tds[9],
      });
    }
  });

  return items;
}

async function getAllPaginationLinks($, baseUrl) {
  const links = new Set();  // avoid duplicates

  $("tfoot a[data-swhglnk='true']").each((idx, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("page=")) {
      const fullUrl = new URL(href, baseUrl).href;
      links.add(fullUrl);
    }
  });

  return [...links];
}

export const fetchPoDetail = async (detailUrl) => {
  const $ = await fetchPage(detailUrl);

  // Extract page 1 items
  const allItems = [...extractItems($)];

  // Detect pagination URLs
  const pageLinks = await getAllPaginationLinks($, detailUrl);

  // Fetch page 2, 3, ...
  for (const link of pageLinks) {
    const $page = await fetchPage(link);
    const pageItems = extractItems($page);
    allItems.push(...pageItems);
  }

  // Extract header info
  const getLabelValue = (labelText) => {
    const label = $(`label:contains("${labelText}")`);
    return label.parent().contents().last().text().trim();
  };

  const poNumber = getLabelValue("Po Number");
  const poDate = getLabelValue("Po Date");
  const vendor = getLabelValue("Vendor");
  const division = getLabelValue("Divison");
  const paymentTerm = getLabelValue("Payment Term");

  return {
    poNumber,
    poDate,
    vendor,
    division,
    paymentTerm,
    items: allItems,
    createdAt: new Date(),
  };
};
