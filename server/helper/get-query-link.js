import Axios from "axios";
import * as cheerio from "cheerio";


export const getPOQueryLink = async (poNumber) => {
  const url = `https://itapps.cgglobal.com/CGSCM/PEN/Delivery/LIST_ASN?Type=C&param=S&PO=${poNumber}&dtFrom=&dtto=&Mat=&stts=0&VC=&_=` + Date.now();

  const { data } = await Axios.get(url, {
    headers: {
      "Cookie": 'CKCgPen=DisplayName=ASHOK ENTERPRISES&UserID=0010000943&RoleID=VEND&EmailID=ashok_entp@rediffmail.com&dtFinyear=4/1/2025 12:00:00 AM&FinYear=2025-2026&UserType=N&Division=', // your CG portal cookie
      "User-Agent": "Mozilla/5.0",
    },
  });

  const $ = cheerio.load(data);
  const link = $("a[href*='View_PO']").attr("href"); // extract query href
  if (!link) throw new Error("PO link not found. Maybe invalid PO or cookie expired.");

  return `https://itapps.cgglobal.com${link}`;
}