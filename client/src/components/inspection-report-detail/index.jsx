/* eslint-disable react/prop-types */
import React from "react";
import ConsumerInfo from "./consumerInfo";
import { tableConstData, tableConstDataPageSecond, tableHeading } from "./constant";
import FrameDetail from "./frame-detail";
import FrameList from "./frame-list";

const InspectionDetail = ({
    csvData,
    ...rest
}) => {

    const {
        LVT = {},
        LP= {},
        TR: TIEROD = {},
        BF: BASEFEET = {},
        SS: switchBracket = {}
    } = csvData || {}


    function modifyNumber(n) {
        const change = [0, -1, -2, 1, 2]; // Possible changes
        const randomChange = change[Math.floor(Math.random() * change.length)];
        return parseInt(n) + randomChange;
    }

    const getTieRodValue = (modify) => {
        if (modify) {
            return TIEROD && TIEROD.D && TIEROD.D == 12 ? `${modifyNumber(TIEROD.L)}X100X${TIEROD.D}` : `${modifyNumber(TIEROD.L)}X${TIEROD.A}X${TIEROD.D}`
        } else {
            return TIEROD && TIEROD.D && TIEROD.D == 12 ? `${TIEROD.L}X100X${TIEROD.D}` : `${TIEROD.L}X${TIEROD.A}X${TIEROD.D}`
        }
    }


  return (
    <React.Fragment>
      <div>
      <FrameList {...rest} csvData={csvData} />

        <div className="mt-4">
        <ConsumerInfo {...rest} pageNo={1} />
        </div>
        <div className="mt-4">
          <table
            style={{
              border: "2px solid black",
              width: "700px",
              fontSize: "15.7px",
              margin: "0 auto",
            }}
          >
            <thead>
              {tableHeading.map((item, index) => (
                <th key={index} style={item.style}>
                  {item.heading}
                </th>
              ))}
            </thead>
            <tbody>
              {tableConstData.map((data, index) => (
                <tr key={index}>
                  <td style={{ border: "2px solid black" }}>{data.col1}</td>
                  <td style={{ border: "2px solid black" }}>{data.col2}</td>
                  <td style={{ border: "2px solid black" }}>{data.col3}</td>
                  <td style={{ border: "2px solid black" }}>{data.col4}</td>
                </tr>
              ))}

              <tr>
                <td style={{ border: "2px solid black" }}>4</td>
                <td style={{ border: "2px solid black" }}>Frame dimension</td>
                <td style={{ border: "2px solid black" }}>MM</td>
                <td>
                  <FrameDetail includeHeading={true} includeBody={false} />
                </td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>4.1</td>
                <td style={{ border: "2px solid black" }}>Frame Length</td>
                <td style={{ border: "2px solid black" }}>{`${LVT.A}MM`}</td>
                <td>
                  <FrameDetail csvData={csvData} value={LVT.A} abbr="MM"/>
                </td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>4.2</td>
                <td style={{ border: "2px solid black" }}>Tie rod location</td>
                <td style={{ border: "2px solid black" }}>
                    {
                        `${parseInt(LVT.A) - 70}X${LVT.P}`
                    }
                </td>
                <td>
                  <FrameDetail
                    csvData={csvData}
                    value={`${(parseInt(LVT.A)) - 70}X${LVT.P}`}
                    style={{ borderBottom: "2px solid black", width: "100%" }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>4.3</td>
                <td style={{ border: "2px solid black" }}>
                  Core bolt location
                </td>
                <td style={{ border: "2px solid black" }}>
                    {`${(parseInt(LVT.B)+parseInt(LVT.C))*2}X${LVT.P}`}
                </td>
                <td>
                  <FrameDetail
                    csvData={csvData}
                    value={`${(parseInt(LVT.B)+parseInt(LVT.C))*2}X${LVT.P}`}
                    style={{ borderBottom: "2px solid black", width: "100%" }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>4.4</td>
                <td style={{ border: "2px solid black" }}>
                  Cutout width x depth
                </td>
                <td style={{ border: "2px solid black" }}>{`${LVT.J}X30`}</td>
                <td>
                  <FrameDetail
                    csvData={csvData}
                    value={`${LVT.J}X30`}
                    style={{ borderBottom: "2px solid black", width: "100%" }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>4.5</td>
                <td style={{ border: "2px solid black" }}>
                  PW Support lug Location
                </td>
                <td style={{ border: "2px solid black" }}></td>
                <td>
                  <FrameDetail
                    csvData={csvData}
                    style={{ borderBottom: "2px solid black", width: "100%" }}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>5</td>
                <td style={{ border: "2px solid black" }}>
                  Tie rod/ core bolt Length x Dia x thick
                </td>
                <td style={{ border: "2px solid black" }}>
                {
                    getTieRodValue()
                }
                </td>
                <td>{getTieRodValue(true)}</td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>6</td>
                <td style={{ border: "2px solid black" }}>
                  Base feet length x width x thick
                </td>
                <td style={{ border: "2px solid black" }}>{`${BASEFEET.A}X75X40`}</td>
                <td style={{ border: "2px solid black" }}>{`${modifyNumber(BASEFEET.A)}X75X40`}</td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>7</td>
                <td style={{ border: "2px solid black" }}>
                  Bottom Pin Hole Distance
                </td>
                <td style={{ border: "2px solid black" }}>{`${BASEFEET.B}x${LVT.P}`}</td>
                <td style={{ border: "2px solid black" }}>{`${modifyNumber(BASEFEET.B)}x${LVT.P}`}</td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>8</td>
                <td style={{ border: "2px solid black" }}>
                  Locating flat x length x hole
                </td>
                <td style={{ border: "2px solid black" }}>
                    {`${LP.A}X${LP.B}X${LP.D}`}
                </td>
                <td style={{ border: "2px solid black" }}>{`${modifyNumber(LP.A)}X${LP.B}X${LP.D}`}</td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>9</td>
                <td style={{ border: "2px solid black" }}>Switch Bracket</td>
                <td style={{ border: "2px solid black" }}>
                    {
                        switchBracket.A !== "0" ?
                        `${switchBracket.A}/${switchBracket.B}/${switchBracket.C}/${switchBracket.D}`
                        :
                        "N/R"
                    }
                </td>
                <td style={{ border: "2px solid black" }}>
                    {
                        switchBracket.A !== "0" ?
                        `${switchBracket.A}/${switchBracket.B}/${switchBracket.C}/${switchBracket.D}`
                        :
                        "N/R"
                    }
                </td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>10</td>
                <td style={{ border: "2px solid black" }}>
                  Flitch plate boss distance
                </td>
                <td style={{ border: "2px solid black" }}>N/R</td>
                <td style={{ border: "2px solid black" }}>N/R</td>
              </tr>
              <tr>
                <td style={{ border: "2px solid black" }}>11</td>
                <td style={{ border: "2px solid black" }}>
                  Flitch plate leg centers
                </td>
                <td style={{ border: "2px solid black" }}>N/R</td>
                <td style={{ border: "2px solid black" }}>N/R</td>
              </tr>
            </tbody>
          </table>
        </div>
        <React.Fragment>
              <div className="mt-4">
                <ConsumerInfo {...rest} pageNo={2} />
              </div>
              <div className="mt-4">
              <table
                    style={{
                    border: "2px solid black",
                    width: "700px",
                    fontSize: "15.7px",
                    margin: "0 auto",
                    }}
                >
                    <thead>
                    {tableHeading.map((item, index) => (
                        <th key={index} style={item.style}>
                        {item.heading}
                        </th>
                    ))}
                    </thead>
                    <tbody>
                    {tableConstDataPageSecond.map((data, index) => (
                        <tr key={index}>
                        <td style={{ border: "2px solid black" }}>{data.col1}</td>
                        <td style={{ border: "2px solid black" }}>{data.col2}</td>
                        <td style={{ border: "2px solid black" }}>{data.col3}</td>
                        <td style={{ border: "2px solid black" }}>{data.col4}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
        </React.Fragment>
      </div>
      <div className="mt-4">
        <p>&nbsp;&nbsp;&nbsp;Inspection Observations</p>
      </div>
    </React.Fragment>
  );
};

export default InspectionDetail;
