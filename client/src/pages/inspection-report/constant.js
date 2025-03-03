export const sanitizeKeys = (obj) => {
    const keyMapping = {};

    function generateKey(key) {
        if (key in keyMapping) return keyMapping[key];

        let words = key.split(/\s+/);
        let newKey;
        if (words.length > 1) {
            newKey = words.slice(0, 3).map(w => w.substring(0, 3).toUpperCase()).join('');
        } else {
            newKey = key.toUpperCase();
        }

        keyMapping[key] = newKey;
        return newKey;
    }

    let sanitizedObj = {};

    Object.keys(obj).forEach(key => {
        let newKey = generateKey(key);
        sanitizedObj[newKey] = obj[key];
    });

    return sanitizedObj;
}

export const keyMapping = {
        "L.V. TOP FRAME": "LVT",
        "LV TOP FRAME": "LVT",
        "L.V. BOTTOM FRAME": "LVB",
        "LV BOTTOM FRAME": "LVB",
        "H.V. TOP FRAME": "HVT",
        "HV TOP FRAME": "HVT",
        "H.V. BOTTOM FRAME": "HVB",
        "HV BOTTOM FRAME": "HVB",
        "BASEFEET": "BF",
        "BASE  FEET": "BF",
        "FLITCH PLATE": "FLITCH_PLATE",
        "LOCATING PLATE": "LP",
        "END ROD 1": "ER1",
        "END ROD 2": "ER2",
        "TIE ROD": "TR",
        "RISER CLAMPING PLATE": "RCP",
        "YOKE STUD": "YS",
        "YOKE STUD WASHER": "YSW",
        "SWITCH SUPPORT": "SS",
        "HV L SUPPORT": "HVL",
        "MOD TO FRAME": "MTF",
        "RISER CLAMPING STUD": "RCS",
        "Sujash": "SUJ",
        "undefined": "undefined",
        "DESCRIPTION": "headers"
    };

    export const headers = [
        "SR NO", "QTY", "DESCRIPTION", "DRG NO", "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "WT"
      ];