import LptFrameList from "./lpt-framelist";
import ConsumerInfo from "../inspection-report-detail/consumerInfo";
import { tableHeading } from "../inspection-report-detail/constant";
import { LPTtableConstData } from "./constant";

const LptReport = ({ ...rest }) => {
  return (
    <div>
      <LptFrameList {...rest} />
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
            {LPTtableConstData.map((data, index) => (
              <tr key={index}>
                <td style={{ border: "2px solid black" }}>{data.col1}</td>
                <td style={{ border: "2px solid black" }}>{data.col2}</td>
                <td style={{ border: "2px solid black" }}>{data.col3}</td>
                <td style={{ border: "2px solid black" }}>{data.col4}</td>
              </tr>
            ))}
            <tr>
                <td style={{ border: "2px solid black" }}>3</td>
                <td style={{ border: "2px solid black" }}>straightness of frames </td>
                <td style={{ border: "2px solid black" }}>Max deviation ;- <br /> Lenght wise :- 4 mm <br /> Width wise  :- 2 mm <br /> Edge wise   :- 4 mm</td>
                <td style={{ border: "2px solid black" }}><br /> Lenght wise:- 3 <br/> Width wise:- 3 <br/> Edge wise:- 2</td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}>4</td>
                <td style={{ border: "2px solid black" }}>Distrotion in frame ( After welding works is Over ) </td>
                <td style={{ border: "2px solid black" }}>No distortion or bow.</td>
                <td style={{ border: "2px solid black" }}>yes / No </td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}>Dimensional check</td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}>5.1</td>
                <td style={{ border: "2px solid black" }}>Flitch plate Fixing hole location</td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}>5.3</td>
                <td style={{ border: "2px solid black" }}>Core bolt location</td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}>5.4</td>
                <td style={{ border: "2px solid black" }}>PW Support lug location </td>
                <td style={{ border: "2px solid black" }}>OK</td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}>5.5</td>
                <td style={{ border: "2px solid black" }}>Lifting lug thickness Xlocation</td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}>5.6</td>
                <td style={{ border: "2px solid black" }}>locking bridge support location</td>
                <td style={{ border: "2px solid black" }}>OK</td>
                <td style={{ border: "2px solid black" }}>OK</td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}>5.7</td>
                <td style={{ border: "2px solid black" }}>Yoke band lug angle x hole dia</td>
                <td style={{ border: "2px solid black" }}>OK</td>
                <td style={{ border: "2px solid black" }}>OK</td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}>5.8</td>
                <td style={{ border: "2px solid black" }}>pressure screw location</td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>
            <tr>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
                <td style={{ border: "2px solid black" }}></td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LptReport;
