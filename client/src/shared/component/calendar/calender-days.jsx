import { getMonth, month } from "../../../helpers/today-date";
import "./style.css";
import PropTypes from 'prop-types'


const CalendarDays = (props) => {

    let firstDayOfMonth = new Date(props.day.getFullYear(), props.day.getMonth(), 1);
    let weekdayOfFirstDay = firstDayOfMonth.getDay();
    let currentDays = [];

    for (let day = 0; day < 42; day++) {
        if (day === 0 && weekdayOfFirstDay === 0) {
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
        } else if (day === 0) {
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() + (day - weekdayOfFirstDay));
        } else {
          firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
        }

        let calendarDay = {
          currentMonth: (firstDayOfMonth.getMonth() === props.day.getMonth()),
          date: (new Date(firstDayOfMonth)),
          month: firstDayOfMonth.getMonth(),
          number: firstDayOfMonth.getDate(),
          selected: (firstDayOfMonth.toDateString() === props.day.toDateString()),
          year: firstDayOfMonth.getFullYear()
        }

        currentDays.push(calendarDay);
      }

      const isPresent = (day) => {
        const filteredData = props.employee.attendance.filter((emp) => emp.month &&  month[day.month] &&  parseInt(new Date(emp.date).getDate()) === parseInt(day.number))
        if (filteredData && filteredData[0]) {
          if (filteredData[0].checkinTime) {
            if (filteredData[0].checkoutTime) {
              return "present";
            }
            return "checkoutNotMarked"
          }
          return "absent"
        } else {
          return "N/A"
        }
      }

      const getStyle = (day) => {
        const result = isPresent(day);
        if (result === "N/A") return "";
        if (result === "present") return "present";
        if (result === "absent") return "absent";
        if (result === "checkoutNotMarked") return "checkoutNotMarked";
      }

      return (

        <div className="customCalendar">
            {
                currentDays.map((day) => {
                    return (
                        <div key={day} className={` ${day.currentMonth ? " current" : "disabled"}  ${day.selected ? " selected" : ""}`}>
                            <p className={`${day.currentMonth ? getStyle(day) : ""}`}>{day.number}</p>
                        </div>
                    )
                })
            }
        </div>
    )
}

CalendarDays.propTypes = {
    day: PropTypes.any,
    employee: PropTypes.object
}


export default CalendarDays