/* eslint-disable react/prop-types */

import { LPT_FRAME_LIST } from "./constant"

const LptFrameList = ({workOrder}) => {

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
                LPT_FRAME_LIST.map((item, index) => {
                    return (
                        <tr key={index}>
                            <td style={{ border: "2px solid black" }}>{index+1}</td>
                            <td style={{ border: "2px solid black",textAlign: "left"  }}>&nbsp;&nbsp;&nbsp;{item.name}</td>
                            <td style={{ border: "2px solid black", height: "35px" }}></td>
                        </tr>
                    )
                })
            }
            <tr>
                <td></td>
                <td style={{ border: "2px solid black", textAlign: "left", fontSize: "20px" }}>&nbsp;&nbsp;&nbsp;Total NOS</td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
        </tbody>
    </table>
  )
}

export default LptFrameList