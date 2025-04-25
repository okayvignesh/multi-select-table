import React, { useRef, useState, useEffect } from 'react';
import { formatDate, bagStatuses } from '../data';
import { Tooltip } from 'react-bootstrap';
import Header from './Header';
import BottomTable from './BottomTable';
import TopTable from './TopTable';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Footer from './Footer';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { BeatLoader } from 'react-spinners';

function Table() {
  const [filter1, setFilter1] = useState([]);
  const [filter2, setFilter2] = useState(null);
  const [filter3, setFilter3] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [waysToBuy, setWaysToBuy] = useState([]);
  const rightTableBodyRef = useRef(null);
  const rightTableHeadRef = useRef(null);
  const [showDiff, setShowDiff] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    filter1: [],
    filter2: null,
    filter3: []
  });
  const [loadingCount, setLoadingCount] = useState(0);
  const hasFetchedInitialData = useRef(false);
  const loading = loadingCount > 0;

  const handleApply = () => {
    setAppliedFilters({ filter1, filter2, filter3 });
    fetchRowData();
  };

  const incrementLoading = () => setLoadingCount(prev => prev + 1);
  const decrementLoading = () => setLoadingCount(prev => prev - 1);


  // API CALL FOR ROW DATA
  const fetchRowData = () => {
    incrementLoading();

    // GET REQUEST FOR CHECKING 
    axios.get('https://run.mocky.io/v3/a4ffccfb-1ef9-4c49-a736-a632f168b407')
      .then(response => transformBagData(response.data.result))
      .catch(console.error)
      .finally(() => decrementLoading());


    // const sortedDates = [...dateOptions].sort((a, b) => new Date(a.value) - new Date(b.value));
    // const selectedDate = filter2;
    // const reportingDates = sortedDates
    //   .filter(option => new Date(option.value) <= new Date(selectedDate))
    //   .map(option => option.label);

    // const isAllDatesSelected = reportingDates.length === sortedDates.length;
    // const finalReportingDates = isAllDatesSelected ? [""] : reportingDates;

    // // BELOW IS THE REQUIRED POST REQUEST 
    // const filters = {
    //   COUNTRY_CD: filter1.length === countries.length ? ["ALL"] : filter1,
    //   WAYS_TO_BUY_CD: filter3.length === waysToBuy.length ? ["ALL"] : filter3,
    //   REPORTING_DATE: finalReportingDates
    // };

    // const requestBody = {
    //   dimensions: [],
    //   filters
    // };

    // axios.post(<API_ENDPOINT_FOR_POST_REQUEST>, requestBody)
    //   .then(response => transformBagData(response.data.result))
    //   .catch(console.error)
    //   .finally(() => decrementLoading());
  };


  // API CALL FOR GEO DROPDOWN
  const fetchGeoDropdownData = () => {
    incrementLoading();
    axios.get('https://run.mocky.io/v3/504150cc-b8cf-4e88-99ac-5326d628f8f0')
      .then(response => extractData(response.data.result))
      .catch(console.error)
      .finally(() => decrementLoading());
  };


  useEffect(() => {
    fetchGeoDropdownData();
  }, []);


  useEffect(() => {
    if (countries.length === 0 || waysToBuy.length === 0) return;
    setFilter1(countries.map((i) => i.id));
    setFilter3(waysToBuy.map((i) => i.id));
    setFilter2(dateOptions.reduce((max, curr) =>
      new Date(curr.value) > new Date(max.value) ? curr : max
    ).label)

    setAppliedFilters(prev => ({
      ...prev,
      filter1: countries.map((i) => i.id),
      filter2: dateOptions.reduce((max, curr) =>
        new Date(curr.value) > new Date(max.value) ? curr : max
      ).label,
      filter3: waysToBuy.map((i) => i.id),
    }));

  }, [countries, waysToBuy]);



  useEffect(() => {
    if (countries.length && waysToBuy.length) {
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
    }
  }, [rightTableBodyRef.current, rightTableHeadRef.current])


  useEffect(() => {
    if (
      !hasFetchedInitialData.current &&
      filter1.length &&
      filter2 &&
      filter3.length
    ) {
      fetchRowData();
      hasFetchedInitialData.current = true;
    }
  }, [filter1, filter2, filter3]);


  const transformBagData = (data) => {
    const waysToBuy = new Set();
    const comboOrder = [];
    const seenCombos = new Set();
    const comboStatusMap = {};
    const bagStatusMap = {
      "Bags Approved": "bagsApproved",
      "Bags Declined": "bagsDeclined",
      "Bags Deleted": "bagsDeleted",
      "Bags Ordered": "bagsOrdered",
      "Bags Pending": "bagsPending",
      "Mass Deleted": "massDeleted",
      "Open Bags": "openBags",
      "Payments Failed": "paymentsFailed",
      "Total Bags Created": "totalBagsCreated",
      "Total Bags Deleted": "totalBagsDeleted",
      "Total Bags Ordered": "totalBagsOrdered",
    };

    const dateGroups = {};

    data.forEach(item => {
      waysToBuy.add(JSON.stringify({ id: item.Ways_To_Buy, label: item.Ways_To_Buy }));

      const [_, endDate] = item.Day_Range.split(" - ");
      const formattedDate = endDate.trim();
      const countryKey = item.Country;
      const waysKey = item.Ways_To_Buy;
      const groupKey = `${countryKey}__${waysKey}`;
      const statusKey = bagStatusMap[item.Bag_Status];

      if (!seenCombos.has(groupKey)) {
        seenCombos.add(groupKey);
        comboOrder.push(groupKey);
      }

      if (!comboStatusMap[groupKey]) comboStatusMap[groupKey] = new Set();
      if (statusKey) comboStatusMap[groupKey].add(statusKey);

      if (!dateGroups[formattedDate]) {
        dateGroups[formattedDate] = {};
      }

      if (!dateGroups[formattedDate][groupKey]) {
        dateGroups[formattedDate][groupKey] = {
          id: uuidv4(),
          country: countryKey,
          ways_to_buy: waysKey,
        };
      }

      if (statusKey) {
        dateGroups[formattedDate][groupKey][statusKey] = {
          gbi: item.GBI_Cnt,
          aos: item.AOS_Cnt,
          fsi: item.FSI_Cnt,
        };
      }
    });

    Object.keys(dateGroups).forEach(date => {
      const groupData = dateGroups[date];

      comboOrder.forEach(combo => {
        const [country, ways_to_buy] = combo.split("__");

        if (!groupData[combo]) {
          groupData[combo] = {
            id: uuidv4(),
            country,
            ways_to_buy,
          };
        }

        const requiredStatuses = comboStatusMap[combo];
        requiredStatuses.forEach(status => {
          if (!groupData[combo][status]) {
            groupData[combo][status] = {
              gbi: '-',
              aos: '-',
              fsi: '-',
            };
          }
        });
      });
    });

    const finalResult = Object.entries(dateGroups).map(([date, groupData]) => ({
      date,
      data: comboOrder.map(combo => groupData[combo]),
    }));

    setFilteredData(finalResult);
    calculateTotals(finalResult);
  };

  const extractData = (data) => {
    const countries = new Set();
    const waysToBuy = new Set();
    const dateOptions = new Set()

    data.forEach((item) => {
      countries.add(JSON.stringify({ id: item.Country.split(':')[0], label: item.Country.split(':')[1] }));
      waysToBuy.add(JSON.stringify({ id: item.Ways_To_Buy.split(':')[0], label: item.Ways_To_Buy.split(':')[1] }));
      dateOptions.add(JSON.stringify({ value: formatDate(item.As_of_Date), label: formatDate(item.As_of_Date) }));
    });

    setCountries([...countries].map(item => JSON.parse(item)));
    setWaysToBuy([...waysToBuy].map(item => JSON.parse(item)));
    setDateOptions([...dateOptions].map(item => JSON.parse(item)));
  }


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
          const current = e?.[key];
          if (current) {
            Object.keys(totals[key]).forEach(subKey => {
              const value = current?.[subKey];
              if (typeof value === "number") {
                totals[key][subKey] += value;
              }
            });
          }
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

    const safeValue = (val) =>
      val === undefined || val === null || val === "" ? "-" : val;


    const parseOrDash = (val) => {
      if (val === "-" || val === undefined || val === null || val === "") return "-";
      const parsed = parseFloat(val);
      return isNaN(parsed) ? "-" : parsed;
    };


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
          bags[date][statusKey] = entry[statusKey] || { aos: "-", fsi: "-", gbi: "-" };
        });
      });
    });

    if (filteredData.every(item => item.data.length > 1)) {
      bagStatuses.forEach(({ key: statusKey, name, className }) => {
        const row = [];
        row.push(countryValue, waysToBuyValue, name);

        dates.forEach(date => {
          const statusData = totalData[date]?.[statusKey];
          const gbi = parseOrDash(statusData?.gbi);
          const aos = parseOrDash(statusData?.aos);
          const fsi = parseOrDash(statusData?.fsi);

          row.push(safeValue(gbi));
          if (showDiff) row.push(safeValue(aos - gbi));
          row.push(safeValue(aos));
          if (showDiff) row.push(safeValue(aos - fsi));
          row.push(safeValue(fsi));
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

      bagStatuses.forEach(({ key: statusKey, name, className }) => {
        let hasData = false;

        for (const date of dates) {
          const s = dateData[date]?.[statusKey];
          if (s && (s.gbi !== "-" || s.aos !== "-" || s.fsi !== "-")) {
            hasData = true;
            break;
          }
        }

        if (!hasData) return;

        const row = [];
        row.push(country, way, name);

        dates.forEach(date => {
          const statusData = dateData[date]?.[statusKey];
          const gbi = parseOrDash(statusData?.gbi);
          const aos = parseOrDash(statusData?.aos);
          const fsi = parseOrDash(statusData?.fsi);

          row.push(safeValue(gbi));
          if (showDiff) row.push(safeValue(aos - gbi));
          row.push(safeValue(aos));
          if (showDiff) row.push(safeValue(aos - fsi));
          row.push(safeValue(fsi));
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

  console.log()

  return (
    <div className='main'>
      <Header countries={countries}
        filter1={filter1}
        filter3={filter3}
        filter2={filter2}
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
        loading ?
          <div className='loader'>
            <BeatLoader color="#00438a" height={4} width={100} />
          </div>
          :
          <>
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
          </>
      }
      <Footer />
    </div>
  );
}

export default Table;