import { createTypes } from "reduxsauce";

export default createTypes(
`
    SET_EMPLOYEE_DATA
    SET_EMPLOYEE_DETAIL
`,
{
    prefix: "employees/"
}
);
