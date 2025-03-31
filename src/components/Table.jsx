import React, { useRef, useState, useEffect } from 'react';
import { countries, waysToBuy, tableData, formatDate, bagStatuses } from '../data';
import { Tooltip } from 'react-bootstrap';
import Header from './Header';
import BottomTable from './BottomTable';
import TopTable from './TopTable';

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

  };
  
  console.log(filteredData)

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