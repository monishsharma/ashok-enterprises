import App from "../App";
import ErrorPage from "../shared/component/not-found";
import AttendanceView from "../pages/attendance";
import EmployeeView from "../pages/employee";
import EmployeeDetail from "../pages/employee-detail";
import Salary from "../pages/salary";
import Dashboard from "../pages/dashboard";
import SalaryCard from "../components/salary-card";
import Pauwels from "../components/pauwels";
import InspectionReport from "../pages/inspection-report";
const routes = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Dashboard />
      },
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
      },
      {
        path: "pauwels",
        element: <Pauwels/>
      },
      {
        path: "inspection-report",
        element: <InspectionReport/>
      }
    ],
    errorElement: <ErrorPage />,

  },
];

export default routes;