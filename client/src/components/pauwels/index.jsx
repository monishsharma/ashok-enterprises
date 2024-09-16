import React, { useRef, useState } from "react";
import { Button, Col, Row, Form, Table } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import TopPauwels from "../../shared/component/top-pauwels";
import { tableConstants } from "./tableConstants";
import BottomPauwels from "../../shared/component/bottom-pauwels";
import ReactToPrint from 'react-to-print';

const Pauwels = () => {
  const canvasLRef = useRef(null);
  const formRef = useRef(null);
  const componentRef = useRef();

  // Function to generate unique IDs for each data entry
  const generateId = () => "_" + Math.random().toString(36).substr(2, 9);

  // Initial data structure for a new row
  const initialData = {
    id: generateId(),
    workOrderNo: "",
    check: true,
    totalSets: "",
    labelA: "",
    labelD: "",
    LvLabelE: "",
    HvLabelE: "",
    LabelF: "",
  };

  // State to manage the list of details
  const [details, setDetails] = useState([initialData]);


  const [isValid, setIsValid] = useState(false);

  React.useEffect(() => {
        let requiredFields = [
            'workOrderNo',
            'totalSets',
            'labelA',
            'labelD',
            'LvLabelE',
            'HvLabelE',
            'LabelF',
        ];


        const valid = details.every(item =>
            requiredFields.every(field =>
                item[field] && item[field].trim() !== ''
            )
        );
        setIsValid(valid);

  }, [details])


  // Function to handle the addition of a new row
  const addNew = () => {
    setDetails((prevDetails) => [
      ...prevDetails,
      { ...initialData, id: generateId() },
    ]);
  };

  // Function to handle the deletion of a row
  const deleteItem = (id) => {
    setDetails((prevDetails) => prevDetails.filter((item) => item.id !== id));
  };

  // Function to handle changes in input fields
  const handleInputChange = (id, field, value) => {
    setDetails((prevDetails) =>
      prevDetails.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleCheckbox = (value, id) => {
    setDetails((prevDetails) =>
      prevDetails.map((item) =>
        item.id === id ? { ...item, check: value } : item
      )
    );
  };


  const pauwelsData = () => (
    <div
      className="pauwelsContainer"
      style={{
        width: "100%",
        background: "silver",
        height: "auto",
        borderRadius: "25px",
        padding: "20px",
      }}
    >
      <div ref={formRef}>
        <Row>
          {details.slice().reverse().map((item) => (
            <React.Fragment key={item.id}>
              <div className="d-flex justify-content-between">
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                  <Form.Check
                    type="checkbox"
                    checked={item.check}
                    label="Bottom Frame"
                    onChange={(e) => handleCheckbox(e.target.checked, item.id)}
                  />
                </Form.Group>
                {details.length > 1 && <span className="icon mb-2 delete">
                  <ion-icon
                    onClick={() => deleteItem(item.id)}
                    name="trash-outline"
                  ></ion-icon>
                </span>}
              </div>
              {Object.keys(initialData)
                .filter((key) => !["id", "check"].includes(key))
                .map((key, index1) => (
                  <Col key={index1} sm={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={key
                          .replace(/([A-Z])/g, " $1")
                          .toUpperCase()}
                        value={item[key]}
                        onChange={(e) =>
                          handleInputChange(item.id, key, e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                ))}
              <hr />
            </React.Fragment>
          ))}
        </Row>
      </div>
    </div>
  );

  return (
    <div className="mt-4">
      <div>
        <Row className="gy-2">
          <Col sm={3}>
            <h2 className="fw-bold">Pauwels</h2>
          </Col>
          <Col sm={{ span: 6, offset: 3 }}>
            <Row className="gy-2">
              <Col sm={6}>
                <div className="d-grid">
                  <Button variant="warning" onClick={addNew}>
                    Add New
                  </Button>
                </div>
              </Col>
              <Col sm={6}>
                <div className="d-grid">
                <ReactToPrint
                    trigger={() => <Button variant="success" disabled={!isValid}>
                    Generate PDF
                  </Button>}
                    content={() => componentRef.current}
                />
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      <div className="pt-4">{pauwelsData()}</div>
        { isValid && <div   ref={componentRef}>
          <div style={{marginTop: "100px", marginBottom: "50px"}}>
            <table className="pauwelstable" style={{width: "100%", margin: "20px"}}>
              <thead>
                <th>Work Order No</th>
                <th>Size</th>
                <th>QTY</th>
                <th>Drawing</th>
              </thead>
              <tbody>

                <React.Fragment>
                    {
                        details.map((item, index) => {

                            const length = item.labelA;

                            const findWidth = (e, d, f) => {
                                const valueE = parseInt(e) + 6;
                                const valueD = parseInt(d) + 6;
                                const topWidth = valueE + valueD - 12;
                                const zValue = parseInt(f) - parseInt(e);
                                const bottomWidth = (valueE + valueD + zValue) - 24;
                                const width = f ? bottomWidth : topWidth;
                                return `${length} X ${width}`;
                            }

                            return (
                                <React.Fragment key={index}>
                                    <tr >
                                        <td colSpan={4}><h3>W/O - {item.workOrderNo}</h3></td>
                                    </tr>
                                    <tr>
                                        <td  style={{width: "15%"}}>{item.workOrderNo}</td>
                                        <td style={{width: "20%"}}>{findWidth(item.LvLabelE, item.labelD)}</td>
                                        <td style={{width: "10%"}}>{item.check ? item.totalSets : parseInt(item.totalSets * 2)} Nos</td>
                                        <td style={{width: "30%"}}><TopPauwels height={parseInt(item.LvLabelE) + 6} width={parseInt(item.labelD) + 6}/></td>
                                    </tr>
                                    <tr>
                                        <td style={{width: "15%"}}></td>
                                        <td style={{width: "20%"}}>{findWidth(item.HvLabelE, item.labelD)}</td>
                                        <td style={{width: "10%"}}>{item.check ? item.totalSets : parseInt(item.totalSets * 2)} Nos</td>
                                        <td style={{width: "30%"}}><TopPauwels height={parseInt(item.HvLabelE) + 6} width={parseInt(item.labelD) + 6} /></td>
                                    </tr>
                                    {item.check &&
                                        <React.Fragment>
                                            <tr>
                                                <td style={{width: "15%"}}></td>
                                                <td style={{width: "20%"}}>{findWidth(item.LvLabelE, item.labelD, item.LabelF)}</td>
                                                <td>{item.check ? item.totalSets : parseInt(item.totalSets * 2)} Nos</td>
                                                <td><BottomPauwels x={parseInt(item.LvLabelE) + 6} y={parseInt(item.labelD) + 6} z={parseInt(item.LabelF) - parseInt(item.LvLabelE)} /></td>
                                            </tr>
                                            <tr>
                                                <td style={{width: "15%"}}></td>
                                                <td style={{width: "20%"}}>{findWidth(item.HvLabelE, item.labelD,item.LabelF)}</td>
                                                <td>{item.check ? item.totalSets : parseInt(item.totalSets * 2)} Nos</td>
                                                <td><BottomPauwels x={parseInt(item.HvLabelE) + 6} y={parseInt(item.labelD) + 6} z={parseInt(item.LabelF) - parseInt(item.HvLabelE)} /></td>
                                            </tr>
                                        </React.Fragment>
                                    }
                                </React.Fragment>
                            )
                        })
                    }

                </React.Fragment>

              </tbody>
            </table>
          </div>
      </div>}
    </div>
  );
};

export default Pauwels;
