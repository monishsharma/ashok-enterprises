

function getRandomValues() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * (80 - 40 + 1)) + 40).join(',');
}

export const tableHeading = [
    {
        heading: "S.no",
        style: {
            border: "2px solid black"
        }
    },
    {
        heading: "CheckPoint",
        style: {
            border: "2px solid black",
             width: "200px"
        }
    },
    {
        heading: "Required",
        style: {
            border: "2px solid black",
             width: "180px"
        }
    },
    {
        heading: "Observed",
        style: {
            border: "2px solid black"
        }
    }
];

export const tableConstData = [
    {
        col1: "1",
        col2: "Raw Material",
        col3: "SHEET",
        col4: "MM",
    },
    {
        col1: "1.1",
        col2: "Make of channels",
        col3: "SAIL/VIZAC",
        col4: "6 MM",
    },
    {
        col1: "1.2",
        col2: "Channel flange out of square",
        col3: "MM",
        col4: "OK",
    },
    {
        col1: "1.3",
        col2: "Flatness of channel web",
        col3: "Concavity : MM No Convexity",
        col4: "Yes / No",
    },
    {
        col1: "1.4",
        col2: "Twist in channel",
        col3: "No Twist",
        col4: "Yes / No",
    },
    {
        col1: "1.5",
        col2: "Plate material",
        col3: "Locating plates/ lifting lugs / base feet / flitch plate are from plate material.",
        col4: "Yes / No",
    },
    {
        col1: "1.6",
        col2: "Structural",
        col3: "No cracks, laminations, slivers, dents, hammer marks",
        col4: "Yes / No",
    },
    {
        col1: "2",
        col2: "Weld leg length",
        col3: "At lifting lugs 8mm min",
        col4: "",
    },
    {
        col1: "3",
        col2: "",
        col3: "B 7016 / 7018 used at lifting lugs.",
        col4: "Yes / No",
    },
];

export const tableConstDataPageSecond = [
    {
        col1: "12",
        col2: "Pressure block location",
        col3: "N/R",
        col4: "",
    },
    {
        col1: "13",
        col2: "Surface cleaning",
        col3: "OK",
        col4: "OK",
    },
    {
        col1: "14",
        col2: "Dry paint film thickness",
        col3: "40 TO 80 MICRON",
        col4: getRandomValues(),
    },
    {
        col1: "15",
        col2: "Paint adhesion test",
        col3: "OK",
        col4: "OK",
    },
    {
        col1: "16",
        col2: "Painting quality",
        col3: "OK",
        col4: "OK",
    },
    {
        col1: "16.1",
        col2: "Welding quality",
        col3: "OK",
        col4: "OK",
    },
    {
        col1: "16.2",
        col2: "Painting quality",
        col3: "OK",
        col4: "OK",
    },
    {
        col1: "16.3",
        col2: "leveling of coil supports",
        col3: "Matching of all parts",
        col4: "OK",
    },
    {
        col1: "16.4",
        col2: "",
        col3: "OK",
        col4: "OK",
    },
    {
        col1: "16.5",
        col2: "Match marking & identification",
        col3: "OK",
        col4: "OK",
    },
    {
        col1: "16.6",
        col2: "All parts & channel",
        col3: "OK",
        col4: "OK",
    },
    {
        col1: "16.7",
        col2: "Packing list",
        col3: "OK",
        col4: "OK",
    },
]

