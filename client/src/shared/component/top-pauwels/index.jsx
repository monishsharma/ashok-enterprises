import React from 'react'

const TopPauwels = ({height, width}) => {
  return (
    <div className="axis-container">
        <div className="x-axis"></div>
        <div className="y-axis"></div>
        <div className="x-label">{width}</div>
        <div className="y-label">{height}</div>
    </div>
  )
}

export default TopPauwels;