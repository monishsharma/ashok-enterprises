/* eslint-disable react/prop-types */

const ConsumerInfo = ({
    consumer,
    supplier,
    workOrder,
    pageNo
}) => {
  return (
    <table
          style={{
            border: "2px solid black",
            width: "700px",
            fontSize: "15.5px",
            margin: "0 auto",
          }}
        >
          <tbody>
            <tr style={{ border: "2px solid black" }}>
              <td style={{ border: "2px solid black" }}>
                {consumer}
              </td>
              <td style={{ border: "2px solid black" }}>
                INSPECTION REPORT FOR FRAME
              </td>
              <td style={{ border: "2px solid black" }}>
                Format No: PEWQA/R2 Page {pageNo} of 2
              </td>
            </tr>
            <tr style={{ border: "2px solid black" }}>
              <td style={{ border: "2px solid black" }}>
                Supplier - {supplier}
              </td>
              <td style={{ border: "2px solid black" }}>{workOrder}</td>
              <td style={{ border: "2px solid black" }}>Unit No: 1</td>
            </tr>
          </tbody>
        </table>
  )
}

export default ConsumerInfo