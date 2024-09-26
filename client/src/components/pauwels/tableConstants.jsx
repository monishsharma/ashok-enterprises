import React from "react";
import TopPauwels from "../../shared/component/top-pauwels";

// This is the table constant/settings which needed to render table elements
export const tableConstants = () => {

  return [
    {
      title: "ID",
      render: (rowData) => {
        return <span>{rowData.id}</span>;
      },
    },
    {
      title: "Work Order No",
      render: (rowData) => {
        return <span>{rowData.workOrderNo}</span>;
      },
    },
    {
      title: "Size",
      render: (rowData) => {
        const length = rowData.labelA;
        const valueE = parseInt(rowData.LvLabelE) + 6;
        const valueD = parseInt(rowData.LvLabelD) + 6;
        const width =  (valueE + valueD) - 12;
        return (
          <React.Fragment>
            <p>{`${length} X ${width}`}</p>
            <p>{`${length} X ${width}`}</p>
            <p>{`${length} X ${width}`}</p>
            <p>{`${length} X ${width}`}</p>
          </React.Fragment>
        );
      },
    },
    {
      title: "Dimension",
      render: (rowData) => {
        return (
          <React.Fragment>
            <p><TopPauwels /></p>
            <p><TopPauwels /></p>
            <p><TopPauwels /></p>
            <p><TopPauwels /></p>
          </React.Fragment>
        )
      },
    },
  ];
};
