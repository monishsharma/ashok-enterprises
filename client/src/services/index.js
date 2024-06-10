import baseApi from "./baseApi";
import employeeApi from "./employeeApi";

const employee = employeeApi(baseApi);

export {
    baseApi,
    employee as EmployeeService
};
