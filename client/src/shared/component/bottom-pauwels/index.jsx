import React from 'react';
import styles from "./style.module.css";

const BottomPauwels = ({y, x, z}) => {
  return (

<div className={styles.axiscontainer}>
        <div className={styles.xaxis}></div>
        <div className={styles.yaxis}></div>
        <div className={styles.zaxis}></div>
        <div className={styles.xlabel}>{x}</div>
        <div className={styles.ylabel}>{y}</div>
        <div className={styles.zlabel}>{z}</div>
    </div>
  )
}

export default BottomPauwels