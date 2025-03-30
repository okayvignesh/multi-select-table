import React, { useRef, useState, useEffect } from 'react';
import MultiSelect from './MultiDropdown';
import { countries, waysToBuy, tableData, formatDate, bagStatuses } from '../data';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

function Table() {
  const [filter1, setFilter1] = useState([]);
  const [filter2, setFilter2] = useState(formatDate(new Date()));
  const [filter3, setFilter3] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({
    filter1: [],
    filter2: formatDate(new Date()),
    filter3: []
  });
  const [dateOptions, setDateOptions] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const rightTableBodyRef = useRef(null);
  const rightTableHeadRef = useRef(null);

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

  return (
    <div className='main'>
      <div className="row mb-3 d-flex align-items-end header">
        <div className="col-2">
          <p>Country</p>
          <MultiSelect
            options={countries}
            selectedValues={filter1}
            onChange={setFilter1}
            placeholder="Select Country"
          />
        </div>
        <div className="col-2">
          <p>Ways to Buy</p>
          <MultiSelect
            options={waysToBuy}
            selectedValues={filter3}
            onChange={setFilter3}
            placeholder="Select ways to buy"
          />
        </div>
        <div className="col-2">
          <p>As of Date</p>
          <select className="form-select" onChange={(e) => setFilter2(e.target.value)}>
            {
              dateOptions && dateOptions.map((i, index) => {
                return (
                  <option key={index} value={i.value}>{i.label}</option>
                )
              })
            }
          </select>
        </div>
        <div className="col-2">
          <button className="applybtn" onClick={handleApply}>Apply</button>
        </div>
      </div>
      {
        appliedFilters.filter1.length && appliedFilters.filter3.length ?
          (
            <>
              <div className="table-container top-table pb-0">
                <div className="col-5 left-parent">
                  <table className="table table-bordered left-table">
                    <thead>
                      <tr>
                        <th style={{ width: "30%" }}>Country</th>
                        <th style={{ width: "40%" }}>Ways to Buy</th>
                        <th style={{ width: "30%" }}>As of Date</th>
                      </tr>
                      <tr className='yellow'>
                        <th style={{ width: "30%" }} >
                          <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 400 }}
                            overlay={(props) => renderTooltip(props, appliedFilters.filter1)}
                          >
                            <p className={`m-0 ${appliedFilters.filter1.length === 1
                              ? ''
                              : appliedFilters.filter1.length === countries.length
                                ? 'text-all'
                                : 'text-multiple'
                              }`}>
                              {
                                appliedFilters.filter1.length === 1
                                  ? appliedFilters.filter1[0]
                                  : appliedFilters.filter1.length === countries.length
                                    ? '[ALL]'
                                    : '[Multiple]'
                              }
                            </p>
                          </OverlayTrigger>
                        </th>
                        <th style={{ width: "40%" }}>
                          <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 400 }}
                            overlay={(props) => renderTooltip(props, appliedFilters.filter3)}
                          >
                            <p className={`m-0 ${appliedFilters.filter2.length === 1
                              ? ''
                              : appliedFilters.filter2.length === waysToBuy.length
                                ? 'text-all'
                                : 'text-multiple'
                              }`}>
                              {
                                appliedFilters.filter3.length === 1
                                  ? appliedFilters.filter3[0]
                                  : appliedFilters.filter3.length === waysToBuy.length
                                    ? '[ALL]'
                                    : '[Multiple]'
                              }
                            </p>
                          </OverlayTrigger>
                        </th>
                        <th style={{ width: "30%" }}>{appliedFilters.filter2}</th>
                      </tr>
                      <tr className='blue'>
                        <th style={{ width: "30%" }}>Country</th>
                        <th style={{ width: "40%" }}>Ways to Buy</th>
                        <th style={{ width: "30%" }}>Bags Status</th>
                      </tr>
                    </thead>
                  </table>
                </div>
                <div className="col-7 right-table" ref={rightTableHeadRef}>
                  {
                    filteredData && filteredData.filter((i) => {
                      const itemDate = new Date(i.date);
                      const filterDate = new Date(appliedFilters.filter2);
                      return itemDate <= filterDate;
                    })
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((i, index, arr) => {
                        const reverseIndex = arr.length - index;
                        return (
                          <div className="col-4" key={i.date}>
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th style={{ width: "30%" }}>Till Day {reverseIndex} EOD</th>
                                </tr>
                                <tr className='yellow'>
                                  <th style={{ width: "30%" }}>{formatDate(new Date(dateOptions[dateOptions.length - 1]['value']))} - {i.date}</th>
                                </tr>
                                <tr className='blue'>
                                  <th className='right-parent-th'>
                                    <div className='right-th col-4'>GBI</div>
                                    <div className='right-th col-4'>AOS</div>
                                    <div className='right-th col-4'>FSI</div>
                                  </th>
                                </tr>
                              </thead>
                            </table>
                          </div>
                        )
                      })
                  }
                </div>
              </div>

              <div className="bottom-table">
                <div className="table-container py-0">
                  <div className="col-5 left-parent">
                    <table className="table table-bordered left-table">
                      <tbody>
                        {
                          filteredData && filteredData.every(item => item.data.length > 1) && (
                            <>
                              <div className='gap-div'></div>
                              <tr>
                                <td style={{ width: "30%" }}>[ALL]</td>
                                <td style={{ width: "30%" }}>[ALL]</td>
                                <td style={{ width: "30%" }} className='td-parent'>
                                  {
                                    bagStatuses.map((item) => (
                                      <div key={item.name} className={`td-div ${item.className}`}>
                                        {item.name}
                                      </div>
                                    ))
                                  }
                                </td>
                              </tr>
                            </>
                          )
                        }
                        {
                          filteredData &&
                          filteredData.find((e) => e.date === appliedFilters.filter2)?.data.map((i, index) => {
                            return (
                              <React.Fragment key={index}>
                                <div className='gap-div'></div>
                                <tr>
                                  <td style={{ width: "30%" }}>{i.country}</td>
                                  <td style={{ width: "30%" }}>{i.ways_to_buy}</td>
                                  <td style={{ width: "30%" }} className='td-parent'>
                                    {
                                      bagStatuses.map((item) => (
                                        <div key={item.name} className={`td-div ${item.className}`}>
                                          {item.name}
                                        </div>
                                      ))
                                    }
                                  </td>
                                </tr>
                              </React.Fragment>
                            )
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                  <div className="col-7 right-table" ref={rightTableBodyRef}>
                    {
                      filteredData && filteredData.filter((i) => {
                        const itemDate = new Date(i.date);
                        const filterDate = new Date(appliedFilters.filter2);
                        return itemDate <= filterDate;
                      })
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((i, dateIndex) => {
                          return (
                            <div className="col-4" key={i.date}>
                              <table className="table table-bordered">
                                <tbody>
                                  {
                                    filteredData && filteredData.every(item => item.data.length > 1) && (
                                      <>
                                        <div className='gap-div'></div>
                                        <tr>
                                          {
                                            totalData[i.date] && Object.keys(totalData[i.date]).map((item, key) => {
                                              const subKeys = totalData[i.date][item];
                                              let cellClass = '';

                                              if (item === 'totalBagsCreated' || item === 'totalBagsDeleted' || item === 'totalBagsOrdered') {
                                                cellClass = 'powder-blue';
                                              } else if (item === 'openBags') {
                                                cellClass = 'powder-green';
                                              }

                                              return (
                                                <td key={key} className='right-parent-th'>
                                                  {subKeys && Object.keys(subKeys).map((subKey) => (
                                                    <div key={subKey} className={`right-th right-th-body col-4 ${cellClass}`}>
                                                      {subKeys[subKey]}
                                                    </div>
                                                  ))}
                                                </td>
                                              )
                                            })
                                          }
                                        </tr>
                                      </>
                                    )
                                  }
                                  {
                                    i.data && i.data.map((e, rowIndex) => {
                                      return (
                                        <React.Fragment key={rowIndex}>
                                          <div className='gap-div'></div>
                                          <tr>
                                            {Object.keys(e).map((key) => {
                                              if (['id', 'country', 'ways_to_buy'].includes(key)) {
                                                return null;
                                              }

                                              const subKeys = e[key];

                                              let cellClass = '';

                                              if (key === 'totalBagsCreated' || key === 'totalBagsDeleted' || key === 'totalBagsOrdered') {
                                                cellClass = 'powder-blue';
                                              }

                                              else if (key === 'openBags') {
                                                cellClass = 'powder-green';
                                              }


                                              if (typeof subKeys === 'object' && subKeys !== null) {
                                                return (
                                                  <td key={key} className='right-parent-th'>
                                                    {Object.keys(subKeys).map((subKey) => (
                                                      <div key={subKey} className={`right-th right-th-body col-4 ${cellClass}`}>
                                                        {subKeys[subKey]}
                                                      </div>
                                                    ))}
                                                  </td>
                                                );
                                              }
                                              return null;
                                            })}
                                          </tr>
                                        </React.Fragment>
                                      )
                                    })
                                  }
                                </tbody>
                              </table>
                            </div>
                          )
                        })
                    }
                  </div>
                </div>
              </div>
            </>
          )
          :
          <p className='text-center nothing'>Nothing to show</p>
      }

    </div>
  );
}

export default Table;