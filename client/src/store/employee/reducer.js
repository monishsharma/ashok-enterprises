import { createReducer } from "reduxsauce";
import  Types from "./actionTypes";

export const INITIAL_STATE = {
    data: [],
    detail: null
};


export const setData = (state = INITIAL_STATE, { data }) => {
    return {
        ...state,
        data,
    };
};

export const setDetail = (state = INITIAL_STATE, { data }) => {
    return {
        ...state,
        detail: data[0],
    };
};


export const HANDLERS = {
    [Types.SET_EMPLOYEE_DATA]: setData,
    [Types.SET_EMPLOYEE_DETAIL]: setDetail

};

export default createReducer(INITIAL_STATE, HANDLERS);
