
import "./table.css"
import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'

const Table = ({ cols, data, bordered, hoverable, striped, isDark, isClickable, onClick=() => {}, canSearch = false }) => {

    const [search, setSearch] = useState("");
    const [searchData, setSearchData] = useState(data || []);

    useEffect(() => {
        setSearchData(data)
    }, [data])


    const onClickHandler = (item) => {
        if (isClickable) onClick(item);
    }

    const onSearch = (value) => {
        const copySearchData = [...data];
        setSearch(value)
        const filteredData = copySearchData.filter(item => item.name.toLowerCase().includes(value));
        console.log(filteredData)
        setSearchData(filteredData)
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
                        {canSearch && <tr>
                            <td></td>
                            <td width={"1%"}>
                                <input className="searchInput" value={search} onChange={(e)=> onSearch(e.target.value)} />
                            </td>
                        </tr>}
                        {
                            searchData.map((item, index) => (
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
    onClick: PropTypes.func,
    canSearch: PropTypes.bool
}

Table.defaultProps = {
    bordered: true,
    hoverable: false,
    striped: false,
    isDark: false,
}

export default Table;