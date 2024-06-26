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
                <div>
                    <span className="companyTitle">{isActive ? "AS" : "Ashok Enterprises"}</span>
                </div>
                <ul>

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

                    <li>
                        <a href="#">
                            <span className="icon">
                                <ion-icon name="log-out-outline"></ion-icon>
                            </span>
                            <span className="title">Sign Out</span>
                        </a>
                    </li>
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
