import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import SalaryCard from "./component.jsx";
import { employeeList, getSalarySlip } from "../../store/employee/action.js";

const mapStateToProps = ({
    employee: {
        data: employeeData
    }
}) => ({employeeData});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    employeeListConnect: employeeList,
    getSalarySlipConnect: getSalarySlip
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SalaryCard);
