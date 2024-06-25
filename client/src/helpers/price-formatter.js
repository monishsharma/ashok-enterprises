// eslint-disable-next-line max-len
export default (price, allowZero = false) => Number((price || (allowZero ? "0" : ""))).toLocaleString("en-IN");
