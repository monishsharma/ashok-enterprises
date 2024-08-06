import React, { useState } from "react";
import PropTypes from "prop-types";
import "./style.css";
import TransparentInput from "../transparent-input";
import { INFO, INTIAL_ROW, ITEM_DESCRIPTION } from "../../pages/new-invoice/selector";
import { Button } from "react-bootstrap";

const Bill = (props) => {

  const [billDetail, setBillDetail] = useState({});
  const [items, setItems] = useState([
    {
      id: "row1",
      content: [...ITEM_DESCRIPTION]
    }
  ])

  const onchange = (e) => {
    setBillDetail({
      ...billDetail,
      [e.target.name]: e.target.value
    })
  }

  const addMoreRow = () => {
    let oldItems = [...items];
    const newObj = {
      id: `row${items.length+1}`,
      content: [...ITEM_DESCRIPTION]
    }
    oldItems.push(newObj);
    setItems(oldItems);
  }

  const deleteRow = () => {
    let oldItems = [...items];
    oldItems.pop();
    setItems(oldItems);
  }

  return (
    <div className="tablecontainer ">
      <table className="header-table invoiceTable">
        <thead>
          <tr>
            <th colSpan="2">GSTIN:-</th>
            <th>PAN:-</th>
            <th>State & Code:-</th>
            <th>Invoice No:-</th>
            <th>Invoice Date:-</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="2">23AQGPS4032C1ZA</td>
            <td>AQGPS4032C</td>
            <td>MP & 23</td>
            <td>AE/24-25-1627</td>
            <td>31/7/2024</td>
          </tr>
          <tr>
            <th colSpan="6" style={{ borderTop: "none", borderBottom: "none" }}>
              DETAIL OF BUYER
            </th>
          </tr>
          <tr>
            <th colSpan="4" rowSpan="4" style={{ textAlign: "left" }}>
              M/S C.G. POWER AND INDUSTRIAL SOLUTION LTD
              <br />
              T2 MALANPUR MFG PLANT <br />
              INDUSTRIAL AREA MALANPUR DISST :- BHIND (M.P.)
            </th>
            <th>BUYER GSTIN:- </th>
            <td>23AAACC384OK3ZV</td>
          </tr>
          <tr>
            <th>BUYER STATE:- </th>
            <td>MADHYA PRADESH</td>
          </tr>
          <tr>
            <th>MAT HSN CODE:-</th>
            <td>85049010</td>
          </tr>
          <tr>
            <th>EWAY BILL NO:-</th>
            <td>
            <TransparentInput
              type="text"
              name={"eway"}
              onChange={onchange}
            />
            </td>
          </tr>
          <tr style={{ height: "50px" }}>
            {
              INFO.map((list, index) => (
                <th dangerouslySetInnerHTML={{__html: list.label}} key={index} />
              ))
            }
          </tr>
          <tr style={{ height: "50px" }}>
            <td>10000943</td>
            {
              INFO.filter(item => item.isEditable).map((list, index) => (
                <td key={index}>
                  <TransparentInput
                    type="text"
                    name={list.name}
                    onChange={onchange}
                  />
                </td>
              ))
            }
          </tr>
          <tr style={{ height: "50px" }}>
            {
              ITEM_DESCRIPTION.map((list, index) => (
                <React.Fragment key={index}>
                  <th dangerouslySetInnerHTML={{__html:list.label}} />
                </React.Fragment>
              ))
            }
          </tr>

            {
              items.map((item, index) => {
                return (
                  <tr key={index}>
                    {
                      item.content.map((con, idx) => {
                        return (
                          <td key={idx}>
                            <con.component />
                          </td>
                        )
                      })
                    }

                  </tr>
                )
              })
            }
          <tr>
            <td colSpan={6}>
              <div className="d-flex justify-content-around">
                <Button  size="sm" onClick = {addMoreRow} >Add</Button>
                <Button  size="sm" onClick = {deleteRow} variant="danger">Delete</Button>
              </div>
            </td>
          </tr>
          {/* Add more rows as needed */}
          <tr>
            <td colSpan="2"></td>
            <td>TOTAL NOS/Kg</td>
            <td>168.00</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td style={{ textAlign: "left" }} colSpan="3">
              Rs: - 21154.00
            </td>
            <td>Assessable value</td>
            <td></td>
            <td>17927.00</td>
          </tr>
          <tr>
            <th
              style={{ textAlign: "left", padding: "10px" }}
              rowSpan={4}
              colSpan="4"
            >
              Invoice value (in words): - <br />
              <h4 style={{ fontSize: "18px" }}>
                Indian Rupee twenty one thousand one <br />
                hundred fifty-four rupees
              </h4>
            </th>
            <th>SGS TAX 9%</th>
            <td>1613.44</td>
          </tr>
          <tr>
            <th>CGS TAX 9%</th>
            <td>1613.44</td>
          </tr>
          <tr>
            <th>IGS TAX 9%</th>
            <td></td>
          </tr>
          <tr>
            <th>ROUND OFF</th>
            <td></td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left' }} colSpan="4">
              Payment terms:- 2 day BDS
            </th>
            <th rowSpan="2">GRAND TOTAL</th>
            <td rowSpan="2">Rs 21,154.00</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'left' }} colSpan="4">Terms & Condition of Sales</td>
          </tr>
          <tr>
            <td colSpan="4">
              <p>TIN: 23495207141</p>
              <p>Our Bank:</p>
              <p>1. STATE BANK OF INDIA (SME BRANCH PATANKAR BAZAR LASHKAR)</p>
              <p>A/C NO: 63008044566</p>
              <p>IFSC CODE: SBIN0030119</p>
              <p>2. Goods once sold will not be back</p>
              <p>3. Subject to Gwalior jurisdiction only</p>
            </td>
            <td colSpan="2">
              Ashok Enterprises
              <br />
              <br />
              (ASHOK SHARMA)
              <br />
              AUTHORISED SIGNATORY
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

Bill.propTypes = {};

export default Bill;
