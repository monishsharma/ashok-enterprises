import { useRef, useState } from "react";
import { keyMapping } from "./constant";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";
import InspectionDetail from "../../components/inspection-report-detail";
import ReactToPrint from "react-to-print";
import Papa from "papaparse";
import LptReport from "../../components/lpt-report";

const InspectionReport = () => {
  let currentHeader = [];

  const [csvData, setCsvData] = useState(null);
  const [supplier, setSupplier] = useState("");
  const [consumer, setConsumer] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [isLPTFrame, setIsLPTFrame] = useState(false);

  const componentRef = useRef();
  console.log(csvData);
  function getData(data) {
    let obj = {};
    if (
      Object.values(data).includes("DESCRIPTION") &&
      currentHeader.length === 0
    ) {
      currentHeader = Object.values(data);
    }
    console.log(currentHeader);
    data.map((item, index) => {
      obj = {
        ...obj,
        [currentHeader[index]]: item,
      };
    });
    return obj;
  }

  function convertToJSON(data) {
    // Define the header columns

    let obj;
    const index = isLPTFrame ? 1 : 2;
    // if (data[index] === "") return;
    obj = {
      [keyMapping[data[index]]]: {
        ...getData(data),
      },
    };
    return obj;
  }

  function extractNumbers(str) {
    return str.match(/\d+/g); // Extract all numbers
  }

  const parseCSV = async (event) => {
    const file = event.target.files[0];
    const WO_NO = [...new Set(extractNumbers(file.name))]; // Extract all numbers
    setWorkOrder(WO_NO);

    if (!file) {
      alert("Please upload a CSV file.");
      return;
    }

    // const reader = new FileReader();

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await window.pdfjsLib.getDocument(typedArray).promise;

      let tableData = [];

      // Loop through all the pages in the PDF
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        let rows = {};
        textContent.items.forEach((item) => {
          let y = Math.round(item.transform[5]); // Grouping by Y-coordinate
          let text = item.str.trim();

          if (text) {
            // Ignore empty strings
            if (!rows[y]) rows[y] = [];
            rows[y].push(text);
          }
        });

        // Sort rows by Y-coordinates (descending order)
        let sortedRows = Object.entries(rows)
          .sort((a, b) => b[0] - a[0])
          .map((entry) => entry[1]);

        tableData.push(...sortedRows);
      }

      // Convert structured table data to CSV format using PapaParse
      const csv = Papa.unparse(tableData, {
        skipEmptyLines: true, // Removes empty lines
      });

      // Parse the CSV string into an array format (rows of values)
      // Each element of `csvDataArray` will be an array representing a row
      let csvDataArray = Papa.parse(csv, { header: false }).data;
      let rowData = {};
      for (var i = 0; i < csvDataArray.length; i++) {
        rowData = {
          ...rowData,
          ...convertToJSON(csvDataArray[i]),
        };
      }
      setCsvData(rowData);
    };

    fileReader.readAsArrayBuffer(file);

    fileReader.onerror = function () {
      alert("Error reading the file");
    };
  };

  const getDisabledState = () => {
    return !(supplier && consumer && workOrder && csvData);
  };

  return (
    <div className="mt-4">
      <h2 className="fw-bold mb-4">Inspection Report</h2>
      <div className="mt-2 mb-4">
        {/* <Form.Check
          type="switch"
          id="custom-switch"
          label="LPT FRAME"
          checked={isLPTFrame}
          onChange={(e) => setIsLPTFrame(e.target.checked)}
        /> */}
      </div>
      <div className="row">
        <div className="col-3">
          <Form>
            <Form.Label>Select Consumer</Form.Label>
            <Form.Select
              aria-label="Default select example"
              value={consumer}
              onChange={(e) => setConsumer(e.target.value)}
            >
              <option>Open this select menu</option>
              <option value="CG POWER AND INDUSTRIAL SOLUTION LIMITED">
                CG POWER AND INDUSTRIAL SOLUTION LIMITED
              </option>
              <option value="KYRFS POWER COMPONENT LIMITED">
                KYRFS POWER COMPONENT LIMITED
              </option>
            </Form.Select>
          </Form>
        </div>
        <div className="col-3">
          <Form>
            <Form.Label>Select Supplier</Form.Label>
            <Form.Select
              aria-label="Default select example"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              <option>Open this select menu</option>
              <option value="ASHOK ENTERPRISES GWALIOR (M. P.)">
                ASHOK ENTERPRISES
              </option>
              <option value="PADMA ENGNEERING WORKS, INDUSTRAIL AREA, GWALIOR">
                PADMA ENGNEERING WORKS
              </option>
            </Form.Select>
          </Form>
        </div>
        <div className="col-3">
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload Drawing</Form.Label>
              <Form.Control type="file" accept=".pdf" onChange={parseCSV} />
            </Form.Group>
          </Form>
        </div>
        <div className="col-3">
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Work Order</Form.Label>
              <Form.Control
                type="text"
                placeholder="Work Order"
                value={workOrder}
                onChange={(e) => setWorkOrder(e.target.value)}
              />
            </Form.Group>
          </Form>
        </div>
      </div>
      <div className="col-2 mt-2 d-grid">
        <ReactToPrint
          trigger={() => (
            <Button disabled={getDisabledState()} variant="success">
              Print Report
            </Button>
          )}
          content={() => componentRef.current}
        />
      </div>
      <div ref={componentRef} className="printable">
        {
          isLPTFrame ?
          <LptReport
            supplier={supplier}
            consumer={consumer}
            workOrder={workOrder}
            csvData={csvData}
            isLPTFrame={isLPTFrame}
          />
          :
          <InspectionDetail
            supplier={supplier}
            consumer={consumer}
            workOrder={workOrder}
            csvData={csvData}
            isLPTFrame={isLPTFrame}
          />
        }

      </div>
    </div>
  );
};

export default InspectionReport;
