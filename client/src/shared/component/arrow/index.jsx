import PropTypes from "prop-types";
import Arrow from "./images/right-arrow.svg";
import GreyArrow from "./images/arrow-grey.svg";

const ArrowIcon = ({ grey, rotateBy, width, height, ...props }) => {
    const transform = typeof rotateBy === "string" ? rotateBy : `rotate(${rotateBy}deg)`;
    const style = {
        width,
        height,
        transform
    };

    let icon = Arrow;
    if (grey) {
        icon = GreyArrow;
    }

    const handleClick = () => {
        if (props.onClick) {
            props.onClick();
        }
    };

    return (
        <img onClick={handleClick} src={icon} style={style} {...props} />
    );
};

ArrowIcon.propTypes = {
    rotateBy: PropTypes.any,
    width: PropTypes.number,
    height: PropTypes.number,
    grey: PropTypes.string,
    onClick: PropTypes.func
};

export default ArrowIcon;
