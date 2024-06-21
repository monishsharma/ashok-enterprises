import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EmployeeDetail from "./component.jsx";
import { employeeDetail, markAttendance } from "../../store/employee/action.js";

const mapStateToProps = ({
    employee: {
        detail
    }
}) => ({detail});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    employeeDetailConnect: employeeDetail,
    markAttendanceConnect: markAttendance
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeDetail);
