import { createReducer } from "reduxsauce";
import  Types from "./actionTypes";

export const INITIAL_STATE = {
    data: []
};


export const setData = (state = INITIAL_STATE, { data }) => {
    return {
        ...state,
        data,
    };
};


export const HANDLERS = {
    [Types.SET_EMPLOYEE_DATA]: setData

};

export default createReducer(INITIAL_STATE, HANDLERS);
