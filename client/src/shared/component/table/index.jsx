import "./table.css"
import PropTypes from 'prop-types'

const Table = ({ cols, data, bordered, hoverable, striped, isDark, isClickable, onClick=() => {} }) => {

    const onClickHandler = (item) => {
        if (isClickable) onClick(item);
    }
    return (
        <div className="table-responsive">
            <table className={`table ${bordered ? 'table-bordered' : 'table-borderless'} ${hoverable && 'table-hover'} ${striped && 'table-striped'} ${isDark && 'table-dark'} ${isClickable && 'pointer-cursor'}`}>
                <thead>
                    <tr>
                        {cols.map((headerItem, index) => (
                            <th  key={index}>{headerItem.title}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                        {
                            data.map((item, index) => (
                                <tr onClick={() => onClickHandler(item)} key={index}>
                                    {cols.map((col, key) => (
                                        <td key={key}>{col.render({...item, id: index+1})}</td>
                                    ))}
                                </tr>
                            ))
                        }
                </tbody>
            </table>
            {
                !(data.length) &&
                    <p className="text-danger text-center ">No Date Found</p>
            }
        </div>
    )
}

Table.propTypes = {
    cols: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    bordered: PropTypes.bool,
    hoverable: PropTypes.bool,
    striped: PropTypes.bool,
    isDark: PropTypes.bool,
    isClickable: PropTypes.bool,
    onClick: PropTypes.func
}

Table.defaultProps = {
    bordered: true,
    hoverable: false,
    striped: false,
    isDark: false,
}

export default Table;