import App from "../App";
import ErrorPage from "../shared/component/not-found";
import AttendanceView from "../pages/attendance";
import EmployeeView from "../pages/employee";
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
    }
    ],
    errorElement: <ErrorPage />,

  },
];

export default routes;