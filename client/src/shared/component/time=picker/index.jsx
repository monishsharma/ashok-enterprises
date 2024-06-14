    import {useRef, useEffect,useState, useCallback} from 'react'
    import PropTypes from 'prop-types';
    import { TimepickerUI } from "timepicker-ui";

    const TimePicker = ({
        isDisabled = false,
        callBack,
        children
    }) => {

        const tmRef = useRef(null);
        const [inputValue, setInputValue] = useState("");


    const handleTimeChange = useCallback(({ detail: { hour, minutes } }) => {
        const date = new Date().setHours(hour, minutes);(
        callBack({punchedTime: date}));
        setInputValue(`${hour}:${minutes}}`);
    }, []);

    useEffect(() => {
        const tm = tmRef && tmRef.current;
        if (tm) {
            const newPicker = new TimepickerUI(tm, {
                clockType: '24h'
            });
            newPicker.create();

            tm.addEventListener("accept", handleTimeChange);

            return () => {
                tm.removeEventListener("accept", handleTimeChange);
            };
        } else {
            console.error("tmRef.current is null");
        }
    }, [handleTimeChange, tmRef]);

    const onClick = () => {
        if (isDisabled) return true;
        const tm = tmRef && tmRef.current;
        const newPicker = new TimepickerUI(tm, {
            clockType: '24h',
            editable: true,
            switchToMinutesAfterSelectHour: true
        });
        newPicker.open();
    }

        return (
            <div className="timepicker-ui" ref={tmRef}onClick={onClick}>
            {children}
            <input
                type="hidden"
                className="timepicker-ui-input"
                defaultValue={inputValue}
            />
            </div>
        )
    }

    TimePicker.propTypes = {
        callBack: PropTypes.func,
        isDisabled: PropTypes.bool,
        children: PropTypes.any
    }

    export default TimePicker