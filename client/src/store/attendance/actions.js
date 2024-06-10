import { EmployeeService } from "../../services";

export const getEmployeeAttendanceList = () => {
    return new Promise((resolve, reject) => {
        EmployeeService.getEmployeeAttendanceList()
        .then((res) => {
            resolve(res.data);
        })
        .catch((err) => {
            reject(err);
        })
    })
}