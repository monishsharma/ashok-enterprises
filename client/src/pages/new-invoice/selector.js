import TransparentInput from "../../components/transparent-input";
import TransparentSelect from "../../components/transparent-select";

const COMPANY_NAME = {
    CROMPTON: "CROMPTON",
    ATLANTA: "ATLANTA",
};

export const ITEM_TYPE = {
    BAKELITE: "BAKELITE",
    ROLLER: "ROLLER",
    FRAME: "FRAME",
};

export const FRAME_TYPE = {
    LPT: "LPT",
    PAUWELS: "PAUWELS",
    CHANNEL: "CHANNEL"
};

export const ITEM_LIST = {
    [FRAME_TYPE.LPT]: {
        label: FRAME_TYPE.LPT,
        placeholder: "Core Frame Assembly",
        rate: 116.52
    },
    [FRAME_TYPE.PAUWELS]:{
        label: FRAME_TYPE.PAUWELS,
        placeholder: "Core Frame Assembly",
        rate: 119.48
    },
    [FRAME_TYPE.CHANNEL]: {
        label: FRAME_TYPE.CHANNEL,
        placeholder: "Core Frame Assembly",
        rate: 118.00
    }
}

export const INTIAL_ROW = {
    sno: {

    },
    description: TransparentSelect,
    wo: TransparentInput,
    qty: TransparentInput,
    rate: TransparentInput,
    value: TransparentInput
}

export const ROLLER_SIZE = {
    125: 125,
    150: 150,
    200: 200,
    250: 250,
    300: 300,
    380: 380
}

export const ROLLER_TYPE = {
    "DIA 125MM" : 125
}

export const BILL_BY = {
    ASHOK_ENTERPRISES: "ASHOK ENTERPISES",
    PADMA: "PADMA"
};

export const INFO = [
    {
        label: "VENDOR <BR /> CODE NO",
        isEditable: false,
        name: "vendorCode"
    },
    {
        label: "MATERIAL CODE",
        isEditable: true,
        name: "materialCode"
    },
    {
        label: "PURCHASE <BR /> ORDER NO",
        isEditable: true,
        name: "PONumber"
    },
    {
        label: "SERIAL NO",
        isEditable: true,
        name: "serial"
    },
    {
        label: "VEHICLE NO",
        isEditable: true,
        name: "vehicle"
    },
    {
        label: "ASN NUMBER",
        isEditable: true,
        name: "ASN"
    }
]

export const ITEM_DESCRIPTION = [
    {
        label: "S.No",
        isEditable: true,
        name: "sno",
        component: TransparentInput
    },
    {
        label: "Description",
        isEditable: true,
        name: "description",
        component: TransparentSelect
    },
    {
        label: "W.O.No / DRG",
        isEditable: true,
        name: "workOrder",
        component: TransparentInput
    },
    {
        label: "QTY/KGS/NOS",
        isEditable: true,
        name: "qty",
        component: TransparentInput
    },
    {
        label: "Rate per KG/NOS",
        isEditable: true,
        name: "rate",
        component: TransparentInput
    },
    {
        label: "VALUE",
        isEditable: true,
        name: "amount",
        component: TransparentInput
    }
]

export const MY_COMPANY_INFO = {
    [COMPANY_NAME.CROMPTON]: {
        address : " M/S C.G. POWER AND INDUSTRIAL SOLUTION LTD <br /> T2 MALANPUR MFG PLANT <br /> INDUSTRIAL AREA MALANPUR DISST :- BHIND (M.P.)",
        gst_no: "23AAACC384OK3ZV",
        state: "MADHYA PRADESH",
        HSN: "85049010",
        code: "10000943",
        materialCode: "283051012",
        paymentTerms: "2 DAY BDS"
    },
}