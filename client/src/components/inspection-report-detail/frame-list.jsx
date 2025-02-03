/* eslint-disable react/prop-types */

const FrameList = ({workOrder, csvData}) => {

    const {
        LVT = {},
        LVB = {},
        HVT = {},
        HVB = {},
        BF: BASEFEET = {},
        LP: LOCATION_PLATE = {},
        ER1: ENDROAD1 = {},
        ER2: ENDROD2 = {},
        TR: TIEROD = {},
        YS: YOKE_STUD = {},
        RCP: RISER_CLAMPING_PLATE = {},
        YSW: YOKE_STUD_WASHER = {},
        SS: SWITCH_SUPPORT = {},
        HVL: HV_SUPPORT = {}
    } = csvData || {}

    const FRAME_LIST = [
        { "name": "HV TOP FRAME", "key": LVT },
        { "name": "LV TOP FRAME", "key": LVB },
        { "name": "HV BOTTOM FRAME", "key": HVT },
        { "name": "LV BOTTOM FRAME", "key": HVB },
        { "name": "BASE FEET", "key": BASEFEET },
        { "name": "LOCATING PLATE", "key": LOCATION_PLATE },
        { "name": "END ROD", "key": ENDROAD1 },
        { "name": "YOKE ROD", "key": ENDROD2 },
        { "name": "TIE ROD", "key": TIEROD },
        { "name": "YOKE STUD", "key": YOKE_STUD },
        { "name": "RISER CLAMPING PLATE", "key": RISER_CLAMPING_PLATE },
        { "name": "YOKE STUD WASHER", "key": YOKE_STUD_WASHER },
        { "name": "SWITCH SUPPORT", "key": SWITCH_SUPPORT },
        { "name": "HV L SUPPORT", "key": HV_SUPPORT }
    ]

    const totalQty = FRAME_LIST.reduce((sum, item) => {
        const qty = parseInt(item.key?.QTY) || 0; // Convert QTY to a number, default to 0 if not present
        return sum + qty;
    }, 0);


  return (
    <table
    style={{
        border: "2px solid black",
        width: "700px",
        margin: "0 auto",
        marginBottom: "750px",
        height: "50vh",
        textAlign: 'left',
        captionSide: "top center",

      }}>
        <caption style={{
            captionSide: "top", // Moves caption above the table
            fontWeight: "bold",
            padding: "10px",
            color: "black",
            textAlign: "center", // Centers the text
            fontSize: "18px",
            border: "2px solid black",
            borderBottom: 0
            }}
        >
            WO-{workOrder}
        </caption>
        <thead>
            <th style={{ border: "2px solid black" }}>S.no</th>
            <th style={{ border: "2px solid black", textAlign: "left" }}>&nbsp;&nbsp;&nbsp;Description</th>
            <th style={{ border: "2px solid black" }}>Qty in NOS</th>
        </thead>
        <tbody >
            {
                FRAME_LIST.map((item, index) => {
                    return (
                        <tr key={index}>
                            <td style={{ border: "2px solid black" }}>{index+1}</td>
                            <td style={{ border: "2px solid black",textAlign: "left"  }}>&nbsp;&nbsp;&nbsp;{item.name}</td>
                            <td style={{ border: "2px solid black" }}>{item.key.QTY ? item.key.QTY : 0} NOS</td>
                        </tr>
                    )
                })
            }
            <tr>
                <td></td>
                <td style={{ border: "2px solid black", textAlign: "left", fontSize: "20px" }}>&nbsp;&nbsp;&nbsp;Total NOS</td>
                <td style={{ border: "2px solid black" }}>{totalQty} NOS</td>
            </tr>
        </tbody>
    </table>
  )
}

export default FrameList