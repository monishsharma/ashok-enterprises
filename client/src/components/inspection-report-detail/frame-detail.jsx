/* eslint-disable react/prop-types */

const FrameDetail = ({
  includeHeading = false,
  style,
  includeBody = true,
  value,
  abbr = ""
}) => {


  function modifyFirstPart(str) {
    if (!str) return "_"; // Handle undefined, null, or empty cases

    const parts = str.includes("X") ? str.split("X") : [str]; // Handle both cases
    let firstNum = parseInt(parts[0]); // Convert first part to a number

    if (isNaN(firstNum)) return "Invalid input"; // Handle non-numeric input

    const change = [0, -1, -2, 1, 2]; // Possible changes
    const randomChange = change[Math.floor(Math.random() * change.length)];

    firstNum += randomChange; // Modify only the first part

    return parts.length > 1 ? `${firstNum}x${parts[1]}` : `${firstNum}`; // Reconstruct accordingly
}


  return (
    <table style={{ width: "100%", style }}>
      {includeHeading && (
        <thead>
          <th
            style={{
              width: "68px",
              borderBottom: "2px solid black",
            }}
          >
            LVT
          </th>
          <th
            style={{
              borderLeft: "2px solid black",
              width: "68px",
              borderBottom: "2px solid black",
            }}
          >
            LVB
          </th>
          <th
            style={{
              borderLeft: "2px solid black",
              width: "68px",
              borderBottom: "2px solid black",
            }}
          >
            HVT
          </th>
          <th
            style={{
              borderLeft: "2px solid black",
              width: "68px",
              borderBottom: "2px solid black",
            }}
          >
            HVB
          </th>
        </thead>
      )}
      {includeBody && (
        <tbody>
          <tr>
            <td
              style={{
                width: "68px",
                borderBottom: "2px solid black",
              }}
            >
              {`${modifyFirstPart(value)}${abbr}`}
            </td>
            <td
              style={{
                width: "68px",
                borderBottom: "2px solid black",
                borderLeft: "2px solid black",
              }}
            >
              {`${modifyFirstPart(value)}${abbr}`}
            </td>
            <td
              style={{
                width: "68px",
                borderBottom: "2px solid black",
                borderLeft: "2px solid black",
              }}
            >
              {`${modifyFirstPart(value)}${abbr}`}
            </td>
            <td
              style={{
                width: "68px",
                borderBottom: "2px solid black",
                borderLeft: "2px solid black",
              }}
            >
              {`${modifyFirstPart(value)}${abbr}`}
            </td>
          </tr>
        </tbody>
      )}
    </table>
  );
};

export default FrameDetail;
