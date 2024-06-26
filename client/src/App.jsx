import SideBar from "./shared/component/sidebar";
import "./app.css";
import { useState, useEffect, useRef } from "react";
import Layout from "./shared/layout";
import { Outlet } from "react-router-dom";
import { isMobileDevice } from "./helpers/is-mobile-device";

function App() {
  const scrollableDivRef = useRef(null);
  const [isActive, setIsActive] = useState(isMobileDevice() ? true : false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  const toggleNavigation = () => {
    setIsActive(!isActive);
  };

  const handleScroll = () => {
    if (scrollableDivRef.current && scrollableDivRef.current.scrollTop > 1) {
      localStorage.setItem("scroll", scrollableDivRef.current.scrollTop)
    }
  };



  return (
    <div>
      <Layout>
        <SideBar isActive={isActive} toggleNavigation={setIsActive} />
        <div className={isActive ? "main active bigmain" : "main smallmain"}>
          <div className="topbar">
            <div className="toggle" onClick={toggleNavigation}>
              <ion-icon name="menu-outline"></ion-icon>
            </div>
          </div>
          <div
            className="scrollableDiv"
            ref={scrollableDivRef}
            onScroll={handleScroll}
          >
            <Outlet context={{ref: scrollableDivRef}} />
          </div>
        </div>
      </Layout>
    </div>
  );
}

export default App;
