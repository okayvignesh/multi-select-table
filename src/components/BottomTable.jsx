import React from 'react'

function BottomTable({ filteredData, bagStatuses, appliedFilters, rightTableBodyRef, showDiff, totalData, countries, waysToBuy }) {
    return (
        <>
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
                                                <td style={{ width: "30%" }}>
                                                    {
                                                appliedFilters.filter1.length === 1
                                                    ? appliedFilters.filter1[0]
                                                    : appliedFilters.filter1.length === countries.length
                                                        ? '[ALL]'
                                                        : '[Multiple]'
                                            }
                                            </td>
                                                <td style={{ width: "40%" }}>
                                                    {
                                                appliedFilters.filter3.length === 1
                                                    ? appliedFilters.filter3[0]
                                                    : appliedFilters.filter3.length === waysToBuy.length
                                                        ? '[ALL]'
                                                        : '[Multiple]'
                                            }
                                            </td>
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
                                        <div className={`${showDiff ? 'col-6' : 'col-4'}`} key={i.date}>
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
                                                                                    {
                                                                                        subKeys && (() => {
                                                                                            const keys = Object.keys(subKeys);

                                                                                            let orderedKeys = [
                                                                                                { key: keys[0], className: 'col-4', value: subKeys[keys[0]] },
                                                                                                { key: keys[1], className: 'col-4', value: subKeys[keys[1]] },
                                                                                                { key: keys[2], className: 'col-4', value: subKeys[keys[2]] },
                                                                                            ];

                                                                                            if (showDiff) {
                                                                                                orderedKeys = [
                                                                                                    { key: keys[0], className: 'col-2', value: subKeys[keys[0]] },
                                                                                                    { key: `${keys[0]} - ${keys[1]}`, className: 'col-3', value: subKeys[keys[1]] - subKeys[keys[0]] },
                                                                                                    { key: keys[1], className: 'col-2', value: subKeys[keys[1]] },
                                                                                                    { key: `${keys[1]} - ${keys[2]}`, className: 'col-3', value: subKeys[keys[1]] - subKeys[keys[2]] },
                                                                                                    { key: keys[2], className: 'col-2', value: subKeys[keys[2]] },
                                                                                                ];
                                                                                            }

                                                                                            return orderedKeys.map((item, index) => (
                                                                                                <div key={index} className={`right-th right-th-body ${item.className} ${cellClass}`}>
                                                                                                    {item.value}
                                                                                                </div>
                                                                                            ));
                                                                                        })()
                                                                                    }
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
                                                                        {
                                                                            Object.keys(e).map((key) => {
                                                                                if (['id', 'country', 'ways_to_buy'].includes(key)) {
                                                                                    return null;
                                                                                }

                                                                                const subKeys = e[key];
                                                                                let cellClass = '';

                                                                                if (key === 'totalBagsCreated' || key === 'totalBagsDeleted' || key === 'totalBagsOrdered') {
                                                                                    cellClass = 'powder-blue';
                                                                                } else if (key === 'openBags') {
                                                                                    cellClass = 'powder-green';
                                                                                }

                                                                                if (typeof subKeys === 'object' && subKeys !== null) {
                                                                                    const keys = Object.keys(subKeys);

                                                                                    let orderedKeys = keys.map((key, index) => ({
                                                                                        key,
                                                                                        className: 'col-4',
                                                                                        value: subKeys[key],
                                                                                    }));

                                                                                    if (showDiff) {
                                                                                        orderedKeys = [
                                                                                            { key: keys[0], className: 'col-2', value: subKeys[keys[0]] },
                                                                                            { key: `${keys[0]} - ${keys[1]}`, className: 'col-3', value: subKeys[keys[1]] - subKeys[keys[0]] }, // aos - gbi
                                                                                            { key: keys[1], className: 'col-2', value: subKeys[keys[1]] },
                                                                                            { key: `${keys[1]} - ${keys[2]}`, className: 'col-3', value: subKeys[keys[1]] - subKeys[keys[2]] }, // aos - fsi
                                                                                            { key: keys[2], className: 'col-2', value: subKeys[keys[2]] },
                                                                                        ];
                                                                                    }

                                                                                    return (
                                                                                        <td key={key} className='right-parent-th'>
                                                                                            {orderedKeys.map((item, index) => (
                                                                                                <div key={index} className={`right-th right-th-body ${item.className} ${cellClass}`}>
                                                                                                    {item.value}
                                                                                                </div>
                                                                                            ))}
                                                                                        </td>
                                                                                    );
                                                                                }

                                                                                return null;
                                                                            })
                                                                        }

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
}

export default BottomTable