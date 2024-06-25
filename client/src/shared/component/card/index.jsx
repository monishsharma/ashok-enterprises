import PropTypes from 'prop-types';
import "./style.css";

const Card = ({
    icon,
    color,
    number,
    cardName,
    children
}) => {
  return (

        <div className="customCard" style={{background: color}}>
            <div>
                <div className="numbers">{number}</div>
                <div className="cardName">{cardName}</div>
            </div>

            <div className="iconBx">
                {
                    icon?  <ion-icon name={icon}></ion-icon> : children
                }

            </div>
        </div>
  )
}

Card.propTypes = {
    icon: PropTypes.any,
    color: PropTypes.string,
    number: PropTypes.any,
    children: PropTypes.any,
    cardName: PropTypes.string
}

export default Card