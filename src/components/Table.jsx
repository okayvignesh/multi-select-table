import React, { useRef, useState, useEffect } from 'react';
import { countries, waysToBuy, tableData, formatDate, bagStatuses } from '../data';
import { Tooltip } from 'react-bootstrap';
import Header from './Header';
import BottomTable from './BottomTable';
import TopTable from './TopTable';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function Table() {
  const [filter1, setFilter1] = useState([]);
  const [filter2, setFilter2] = useState(formatDate(new Date()));
  const [filter3, setFilter3] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const rightTableBodyRef = useRef(null);
  const rightTableHeadRef = useRef(null);
  const [showDiff, setShowDiff] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    filter1: [],
    filter2: formatDate(new Date()),
    filter3: []
  });

  const handleApply = () => {
    setAppliedFilters({ filter1, filter2, filter3 });
    applyFilters();
  };

  const applyFilters = () => {
    let filtered = tableData.filter((item) => {
      const itemDate = new Date(item.date);
      const filterDate = new Date(filter2);
      return itemDate <= filterDate;
    });

    filtered = filtered.map(dateEntry => {
      const newDateEntry = { ...dateEntry };

      if (filter1 && filter1.length > 0) {
        newDateEntry.data = newDateEntry.data.filter(item =>
          filter1.includes(item.country)
        );
      }

      if (filter3 && filter3.length > 0) {
        newDateEntry.data = newDateEntry.data.filter(item =>
          filter3.includes(item.ways_to_buy)
        );
      }

      return newDateEntry;
    });

    setFilteredData(filtered);

    calculateTotals(filtered);
  };

  useEffect(() => {
    setFilter1(countries.map((i) => i.label));
    setFilter3(waysToBuy.map((i) => i.label));

    setFilteredData(tableData);
    calculateTotals(tableData);

    setAppliedFilters((prevState) => ({
      ...prevState,
      filter1: countries.map((i) => i.label),
      filter3: waysToBuy.map((i) => i.label)
    }));


    setTimeout(() => {
      const leftTableContainer = rightTableBodyRef.current;
      const rightTableContainer = rightTableHeadRef.current;

      if (!leftTableContainer || !rightTableContainer) return;

      const handleLeftScroll = () => {
        rightTableContainer.scrollLeft = leftTableContainer.scrollLeft;
      };

      const handleRightScroll = () => {
        leftTableContainer.scrollLeft = rightTableContainer.scrollLeft;
      };

      leftTableContainer.addEventListener('scroll', handleLeftScroll);
      rightTableContainer.addEventListener('scroll', handleRightScroll);

      return () => {
        leftTableContainer.removeEventListener('scroll', handleLeftScroll);
        rightTableContainer.removeEventListener('scroll', handleRightScroll);
      };
    }, 1000);
  }, []);

  useEffect(() => {
    const options = [];
    const today = new Date();

    options.push({
      value: formatDate(today),
      label: formatDate(today)
    });

    for (let i = 1; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      options.push({
        value: formatDate(date),
        label: formatDate(date)
      });
    }

    setDateOptions(options);
  }, [filter2]);


  const calculateTotals = (data) => {
    const newTotalData = {};

    data.forEach(item => {
      let totals = {
        "bagsApproved": { "gbi": 0, "aos": 0, "fsi": 0 },
        "bagsPending": { "gbi": 0, "aos": 0, "fsi": 0 },
        "bagsDeclined": { "gbi": 0, "aos": 0, "fsi": 0 },
        "totalBagsCreated": { "gbi": 0, "aos": 0, "fsi": 0 },
        "bagsDeleted": { "gbi": 0, "aos": 0, "fsi": 0 },
        "massDeleted": { "gbi": 0, "aos": 0, "fsi": 0 },
        "totalBagsDeleted": { "gbi": 0, "aos": 0, "fsi": 0 },
        "bagsOrdered": { "gbi": 0, "aos": 0, "fsi": 0 },
        "paymentsFailed": { "gbi": 0, "aos": 0, "fsi": 0 },
        "totalBagsOrdered": { "gbi": 0, "aos": 0, "fsi": 0 },
        "openBags": { "gbi": 0, "aos": 0, "fsi": 0 }
      };

      item.data.forEach(e => {
        Object.keys(totals).forEach(key => {
          Object.keys(totals[key]).forEach(subKey => {
            totals[key][subKey] += e[key][subKey];
          });
        });
      });

      newTotalData[item.date] = totals;
    });

    setTotalData(newTotalData);
  };

  const renderTooltip = (props, content) => {
    if (Array.isArray(content) && content.length > 1) {
      return (
        <Tooltip id="button-tooltip" {...props}>
          <ul>
            {content.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </Tooltip>
      );
    } else {
      return <></>;
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Excel Report");

    const dates = [...new Set(filteredData.map(entry => entry.date))]
      .sort((a, b) => new Date(b) - new Date(a));

    const getFilterValue = (filter, allValues) => {
      return filter.length === 1
        ? filter[0]
        : filter.length === allValues.length
          ? "[ALL]"
          : "[Multiple]";
    };

    const countryValue = getFilterValue(appliedFilters.filter1, countries);
    const waysToBuyValue = getFilterValue(appliedFilters.filter3, waysToBuy);

    const headerRow1 = ["Country", "Ways to Buy", "As of Date"];
    dates.forEach((_, index) => {
      const labelIndex = dates.length - index;
      headerRow1.push(`Till Day ${labelIndex} EOD`);

      const extraCells = showDiff ? 4 : 2;
      for (let i = 0; i < extraCells; i++) {
        headerRow1.push(null);
      }
    });

    worksheet.addRow(headerRow1);

    const oldestDate = dates[dates.length - 1];

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
        `${date.getDate().toString().padStart(2, '0')}/` +
        `${date.getFullYear()}`;
    };

    const headerRow2 = [countryValue, waysToBuyValue, formatDate(dates[0])];

    dates.forEach(date => {
      const dateRangeLabel = `${formatDate(oldestDate)} - ${formatDate(date)}`;
      headerRow2.push(dateRangeLabel);
      const extraCells = showDiff ? 4 : 2;
      for (let i = 0; i < extraCells; i++) {
        headerRow2.push(null);
      }
    });
    worksheet.addRow(headerRow2);

    let colIndexForRow2 = 4;
    dates.forEach(() => {
      worksheet.mergeCells(2, colIndexForRow2, 2, colIndexForRow2 + (showDiff ? 4 : 2));
      colIndexForRow2 += showDiff ? 5 : 3;
    });

    worksheet.getRow(2).eachCell(cell => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });


    const headerRow3 = ["Country", "Ways to Buy", "Bag Status"];
    dates.forEach(() => {
      headerRow3.push("GBI");
      if (showDiff) headerRow3.push("Δ (AOS - GBI)");
      headerRow3.push("AOS");
      if (showDiff) headerRow3.push("Δ (AOS - FSI)");
      headerRow3.push("FSI");
    });
    worksheet.addRow(headerRow3);


    const headerStyles = [
      { color: "000000", bgColor: "FFFFFF" }, 
      { color: "000000", bgColor: "FFFF99" },
      { color: "FFFFFF", bgColor: "0070C0" }
    ];

    for (let i = 0; i < 3; i++) {
      worksheet.getRow(i + 1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: headerStyles[i].color } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: headerStyles[i].bgColor }
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    }

    let colIndex = 4;
    dates.forEach(() => {
      worksheet.mergeCells(1, colIndex, 1, colIndex + (showDiff ? 4 : 2));
      colIndex += showDiff ? 5 : 3;
    });


    const rowMap = new Map();

    filteredData.forEach(({ date, data }) => {
      data.forEach(entry => {
        const key = `${entry.country}||${entry.ways_to_buy}`;
        if (!rowMap.has(key)) rowMap.set(key, {});
        const bags = rowMap.get(key);
        bags[date] = bags[date] || {};

        bagStatuses.forEach(({ key: statusKey }) => {
          bags[date][statusKey] = entry[statusKey] || { aos: "", fsi: "", gbi: "" };
        });
      });
    });

    if (filteredData.every(item => item.data.length > 1)) {
      bagStatuses.forEach(({ key: statusKey, name, className }) => {
        const row = [];
        row.push(countryValue, waysToBuyValue, name);

        dates.forEach(date => {
          const statusData = totalData[date]?.[statusKey];
          const gbi = parseFloat(statusData?.gbi ?? "") || 0;
          const aos = parseFloat(statusData?.aos ?? "") || 0;
          const fsi = parseFloat(statusData?.fsi ?? "") || 0;

          row.push(gbi || "");
          if (showDiff) row.push(aos - gbi || "");
          row.push(aos || "");
          if (showDiff) row.push(aos - fsi || "");
          row.push(fsi || "");
        });
        const summaryRow = worksheet.addRow(row);

        summaryRow.eachCell((cell, colNum) => {
          if (colNum >= 3) {
            if (className === "powder-blue") {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF84BFFF" }
              };
              cell.font = { bold: true };
            }
            if (className === "powder-green") {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFB2FFBF" }
              };
              cell.font = { bold: true };
            }
          }
        });
      });
    }

    rowMap.forEach((dateData, key) => {
      const [country, way] = key.split("||");

      bagStatuses.forEach(({ key: statusKey, name, className }, index) => {
        const row = [];
        row.push(country, way, name);

        dates.forEach(date => {
          const statusData = dateData[date]?.[statusKey];
          const gbi = parseFloat(statusData?.gbi ?? "") || 0;
          const aos = parseFloat(statusData?.aos ?? "") || 0;
          const fsi = parseFloat(statusData?.fsi ?? "") || 0;

          row.push(gbi || "");
          if (showDiff) row.push(aos - gbi || "");
          row.push(aos || "");
          if (showDiff) row.push(aos - fsi || "");
          row.push(fsi || "");
        });

        const newRow = worksheet.addRow(row);

        newRow.eachCell((cell, colNum) => {
          if (colNum >= 3) {
            if (className === "powder-blue") {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF84BFFF" }
              };
              cell.font = { bold: true };
            }
            if (className === "powder-green") {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFB2FFBF" }
              };
              cell.font = { bold: true };
            }
          }

        });
      });
    });

    worksheet.columns.forEach((column, index) => {
      column.width = index < 3 ? 20 : 15;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(blob, "excel_report.xlsx");
  };

  const handlePrint = () => {
    window.print();
  };


  return (
    <div className='main'>
      <Header countries={countries}
        filter1={filter1}
        filter3={filter3}
        setFilter1={setFilter1}
        setFilter2={setFilter2}
        setFilter3={setFilter3}
        waysToBuy={waysToBuy}
        showDiff={showDiff}
        handlePrint={handlePrint}
        exportToExcel={exportToExcel}
        dateOptions={dateOptions}
        handleApply={handleApply}
        setShowDiff={setShowDiff} />
      {
        appliedFilters.filter1.length && appliedFilters.filter3.length ?
          (
            <>
              <TopTable appliedFilters={appliedFilters}
                filteredData={filteredData}
                showDiff={showDiff}
                dateOptions={dateOptions}
                rightTableHeadRef={rightTableHeadRef}
                renderTooltip={renderTooltip}
                formatDate={formatDate}
                countries={countries}
                waysToBuy={waysToBuy} />
              <BottomTable filteredData={filteredData}
                bagStatuses={bagStatuses}
                countries={countries}
                waysToBuy={waysToBuy}
                appliedFilters={appliedFilters}
                rightTableBodyRef={rightTableBodyRef}
                showDiff={showDiff}
                totalData={totalData} />
            </>
          )
          :
          <p className='text-center nothing'>Nothing to show</p>
      }

    </div>
  );
}

export default Table;