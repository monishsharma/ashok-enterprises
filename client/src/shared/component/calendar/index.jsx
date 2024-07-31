// import PropTypes from 'prop-types'
import CalendarDays from './calender-days';
import "./style.css";
import PropTypes from 'prop-types'


const Calender = ({employee}) => {

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = new Date();

    return (
        <div>
            <div className='customCalendar'>
                {
                    weekdays.map((weekday) => {
                        return (
                            <div key={weekday}>
                                <p className='week'>{weekday}</p>
                            </div>
                        )
                    })
                }
            </div>

            <CalendarDays day={currentDay} employee={employee} />
        </div>
    )
}

Calender.propTypes = {
    employee: PropTypes.object
}

export default Calender