import PropTypes from "prop-types";
import priceFormatter from "../../../helpers/price-formatter";

const Timeline = ({
  date,
  name,
  balance,
  amount = 0,
  isDeposited
}) => {
  return (
    <li className="timeline-item" style={{position: "relative"}}>
      <div className="circle" style={{backgroundColor: isDeposited ? "#198754" : "#ffc107"}}></div>
      <div className="timeline-body">
        <div className="timeline-content">
          <div className="card border-0 d-flex flex-row align-items-center">
            <div className="card-body p-0">
              <p className="card-subtitle text-secondary mb-1">{date}</p>
              <h5 className="card-title mb-3">
                {
                  isDeposited ?
                  `${name} paid ₹${priceFormatter(amount)}`
                  :
                  `${name} took ₹${priceFormatter(amount)}`
                }
              </h5>
            </div>
            <p>Balance: {`₹${priceFormatter(balance)}`}</p>
          </div>
        </div>
      </div>
    </li>
  );
};

Timeline.propTypes = {
  date: PropTypes.any,
  total: PropTypes.any,
  balance: PropTypes.any,
  name: PropTypes.string,
  amount: PropTypes.number,
  isDeposited: PropTypes.bool
};

export default Timeline;
