import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Advance from "./component.jsx";
import { updateEmployeePayment, markAttendance, employeeDetail } from "../../store/employee/action.js";

const mapStateToProps = ({
    employee: {
        detail
    }
}) => ({detail});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    markAttendanceConnect: markAttendance,
    employeeDetailConnect: employeeDetail,
    updateEmployeePaymentConnect: updateEmployeePayment
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Advance);
