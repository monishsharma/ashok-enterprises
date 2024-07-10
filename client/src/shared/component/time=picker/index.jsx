    import {useRef, useEffect,useState, useCallback} from 'react'
    import PropTypes from 'prop-types';
    import { TimepickerUI } from "timepicker-ui";

    const TimePicker = ({
        isDisabled = false,
        callBack,
        children,
        dateValue,
        keyType,
        hoursin24 = true
    }) => {

        const tmRef = useRef(null);
        const [inputValue, setInputValue] = useState("");


    const handleTimeChange = useCallback(({ detail: { hour, minutes } }) => {
        let date = "";
        if (keyType === "checkinTime") {
            let updatedMin = parseInt(minutes) > 15  ? minutes : "00";
            if (dateValue){
                date =  new Date(`${dateValue}`).setHours(parseInt(hour), parseInt(updatedMin), 0);
            } else {
                date = {
                    hour, minutes
                }
            }
        } else {
            if (dateValue){
                date =  new Date(`${dateValue}`).setHours(parseInt(hour), parseInt(minutes), 0);
            } else {
                date = {
                    hour, minutes
                }
            }
        }

        callBack({punchedTime: date});
        setInputValue(`${hour}:${minutes}}`);
    }, []);

    useEffect(() => {
        const tm = tmRef && tmRef.current;
        if (tm) {
            // const newPicker = new TimepickerUI(tm, {
            //     clockType: '24h'
            // });
            // newPicker.create();

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
            clockType: hoursin24 ? '24h' : '12h',
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
        keyType: PropTypes.string,
        callBack: PropTypes.func,
        isDisabled: PropTypes.bool,
        children: PropTypes.any,
        hoursin24: PropTypes.bool,
        dateValue: PropTypes.string
    }

    export default TimePicker