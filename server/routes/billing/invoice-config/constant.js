export const  GST_STATE_CODES = {
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

export const formatWorkOrders = (woList) => {
    if (!woList || woList.length === 0) return "";

    const parsed = woList.map((wo) => {
        // Extract last numeric sequence
        const match = wo.match(/(\d+)(?!.*\d)/);

        if (!match) {
            return { prefix: wo, last: null }; // fallback
        }

        const last = match[0];
        const prefix = wo.slice(0, wo.lastIndexOf(last));

        return { prefix, last };
    });

    const uniquePrefixes = [...new Set(parsed.map(p => p.prefix))];

    // If all prefixes same → compress
    if (uniquePrefixes.length === 1) {
        const prefix = uniquePrefixes[0];

        const numbers = parsed
            .map(p => p.last)
            .filter(Boolean)
            .sort();

        return `${prefix}${numbers.join(",")}`;
    }

    // ❗ If different formats → don't break data
    return woList.join(", ");
};

// export const formatPoDisplay = (poArray = []) => {
//     if (!poArray.length) return "";

//     const first = poArray[0];

//     // detect last separator (/ or -)
//     const lastSlash = first.lastIndexOf("/");
//     const lastDash = first.lastIndexOf("-");

//     const lastIndex = Math.max(lastSlash, lastDash);

//     // if no separator found → return normal join
//     if (lastIndex === -1) return poArray.join(",");

//     const prefix = first.substring(0, lastIndex + 1);

//     return poArray
//         .map((po, index) => {
//             if (index === 0) return po;

//             return po.startsWith(prefix)
//                 ? po.substring(prefix.length)
//                 : po;
//         })
//         .join(",");
// };

export const groupItem = ({selectedItem, selectedCompany}) => {
    const groupedItems = {};
    const isCompanyAshok = selectedCompany === "ASHOK";

    if (selectedItem.length <= 4) return {finalItems: selectedItem};

    selectedItem.forEach((item, index) => {

        const resolvedRate = item.rate;
        const resolvedDescription = item.description;

        const key = isCompanyAshok ? `${resolvedDescription}-${resolvedRate}-${item.wo}` : `${resolvedDescription}-${resolvedRate}`;

        if (!groupedItems[key]) {

            groupedItems[key] = {
                sno: item.sno,
                description: resolvedDescription,
                rate: resolvedRate,
                poNumber: item.poNumber,
                totalQty: 0,
                value: 0,
                itemId: item.itemId,
                poNumbers: new Set()
            }
        };

        const qty = Number(item.qty);

        groupedItems[key].totalQty += qty;
        groupedItems[key].value += qty * Number(resolvedRate);



    });


    const finalItems = Object.values(groupedItems).map((item, i) => {
        // const workOrders = item.breakdown.map(bd => bd.wo);
      // console.log(workOrders)
        return ({
            sno: isCompanyAshok ? item.sno : i + 1,
            description: item.description,
            // description: isCompanyAshok ? item.description : `${item.description}\n${formatWorkOrders(workOrders)}`,
            qty: item.totalQty,
            rate: item.rate,
            value: item.value,
            itemId: item.itemId,
            poNumber: item.poNumber,
            // wo: isCompanyAshok ? formatWorkOrders(workOrders) : "-",
        })

    })

    // const poArray = Array.from(poSet);
    // const poDisplay = formatPoDisplay(poArray);

    return {
        finalItems,
        // poDisplay,
        // poArray,
    }
}