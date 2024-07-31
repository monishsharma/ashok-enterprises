import App from "../App";
import ErrorPage from "../shared/component/not-found";
import AttendanceView from "../pages/attendance";
import EmployeeView from "../pages/employee";
import EmployeeDetail from "../pages/employee-detail";
import Salary from "../pages/salary";
import Dashboard from "../pages/dashboard";
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
      }
    ],
    errorElement: <ErrorPage />,

  },
];

export default routes;