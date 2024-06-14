import { createTypes } from "reduxsauce";

export default createTypes(
`
    SET_EMPLOYEE_DATA
`,
{
    prefix: "employees/"
}
);
