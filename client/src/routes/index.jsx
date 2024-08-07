import App from "../App";
import ErrorPage from "../shared/component/not-found";
import AttendanceView from "../pages/attendance";
import EmployeeView from "../pages/employee";
import EmployeeDetail from "../pages/employee-detail";
import Salary from "../pages/salary";
import SalaryCard from "../components/salary-card";
const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "attendance",
        element: <AttendanceView />
      },
      {
        path: "employee",
        element: <EmployeeView />
      },
      {
        path: 'salary/detail/:id/:month/:year',
        element: <EmployeeDetail />
      },
      {
        path: 'salary',
        element: <Salary />
      },
      {
        path: "salary/distribution/:month/:year",
        element: <SalaryCard/>
      }
    ],
    errorElement: <ErrorPage />,

  },
];

export default routes;