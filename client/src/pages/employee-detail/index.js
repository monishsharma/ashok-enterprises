import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EmployeeDetail from "./component.jsx";
import { employeeDetail } from "../../store/employee/action.js";

const mapStateToProps = ({
    employee: {
        detail
    }
}) => ({detail});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    employeeDetailConnect: employeeDetail
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeDetail);
