import React from "react";
import { Link } from 'react-router-dom';
import "./styles.css";
import PropTypes from "prop-types";
import { useLocation } from 'react-router-dom';
import { isMobileDevice } from "../../../helpers/is-mobile-device";

const Side = ({
    isActive,
    toggleNavigation
}) => {
    const location = useLocation();
    const { pathname } = location;

    const onClick = () => {
        if (isMobileDevice()) {
            toggleNavigation(true)
        }
    }


    return (
        <React.Fragment>
            <div className={isActive ? "navigation active" : "navigation"}>
                <Link to="/" style={{textDecoration: "none"}}>
                    <span className="companyTitle">{isActive ? "AS" : "Ashok Enterprises"}</span>
                </Link>
                <ul>

                    <li className={pathname === "/" ? "activeLi" : ""} onClick={onClick}>
                        <Link to="/">
                            <span className="icon">
                                <ion-icon name="grid-outline"></ion-icon>
                            </span>
                            <span className="title">Dashboard</span>
                        </Link>
                    </li>


                    <li className={pathname === "/attendance" ? "activeLi" : ""} onClick={onClick}>
                        <Link to="/attendance">
                            <span className="icon">
                                <ion-icon name="time-outline"></ion-icon>
                            </span>
                            <span className="title">Attendance</span>
                        </Link>
                    </li>

                    <li className={pathname .includes("/employee") ? "activeLi" : ""} onClick={onClick}>
                        <Link to="/employee">
                            <span className="icon">
                                <ion-icon name="people-outline"></ion-icon>
                            </span>
                            <span className="title">Employee</span>
                        </Link>
                    </li>

                    <li className={pathname .includes("/salary") ? "activeLi" : ""} onClick={onClick}>
                        <Link to="/salary">
                            <span className="icon">
                                <ion-icon name="wallet-outline"></ion-icon>
                            </span>
                            <span className="title">Salary</span>
                        </Link>
                    </li>
                    <li className={pathname .includes("/pauwels") ? "activeLi" : ""} onClick={onClick}>
                        <Link to="/pauwels">
                            <span className="icon">
                                <ion-icon name="list-outline"></ion-icon>
                            </span>
                            <span className="title">Pauwels</span>
                        </Link>
                    </li>
                    <li className={pathname .includes("/inspection-report") ? "activeLi" : ""} onClick={onClick}>
                        <Link to="/inspection-report">
                            <span className="icon">
                                <ion-icon name="newspaper-outline"></ion-icon>
                            </span>
                            <span className="title">Inspection Report</span>
                        </Link>
                    </li>

                    {/* <li>
                        <a href="#">
                            <span className="icon">
                                <ion-icon name="log-out-outline"></ion-icon>
                            </span>
                            <span className="title">Sign Out</span>
                        </a>
                    </li> */}
                </ul>
            </div>
        </React.Fragment>

    );
};

Side.propTypes = {
    isActive: PropTypes.bool,
    toggleNavigation: PropTypes.func
}

export default Side;
