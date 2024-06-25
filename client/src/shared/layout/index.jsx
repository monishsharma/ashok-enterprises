
import PropTypes from 'prop-types'

  const Layout = ({children}) => {
    return (
        <div className="main-wrapper">{children}</div>
    )
  }

  Layout.propTypes = {
    children: PropTypes.any
  }

  export default Layout