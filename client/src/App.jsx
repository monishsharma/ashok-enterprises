import SideBar from "./shared/component/sidebar"
import "./app.css"
import {useState} from "react";
import Layout from "./shared/layout";
import { Outlet } from "react-router-dom";
import { isMobileDevice } from "./helpers/is-mobile-device";

function App() {

  const [isActive, setIsActive] = useState(isMobileDevice() ? true : false);

  const toggleNavigation = () => {
    setIsActive(!isActive);
  };

  return (
    <>
      <Layout>
        <SideBar isActive={isActive} toggleNavigation={setIsActive}  />
        <div className={isActive ? "main active bigmain" : "main smallmain"}>
          <div className="topbar">
            <div className="toggle" onClick={toggleNavigation}>
                <ion-icon name="menu-outline"></ion-icon>
            </div>
          </div>
         <div className="scrollableDiv">
         <Outlet />
         </div>

        </div>
      </Layout>
    </>
  )
}

export default App
