import styles from "./style.module.css";


const PageLoader = () => {
  return (
   <div className={styles.loaderWrapper}>
     <span className={styles.loader}></span>
   </div>
  )
}

PageLoader.propTypes = {}

export default PageLoader