import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css';

import {
  RouterProvider,
  createBrowserRouter
} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import routes from "./routes";
import { Provider } from 'react-redux'
import {store}  from './store';

const router = createBrowserRouter(routes);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
     <Provider store={store}>
       <RouterProvider router={router} />
     </Provider>
  </React.StrictMode>,
)
