import React from 'react'
import { OverlayTrigger } from 'react-bootstrap';
import { TbDelta } from "react-icons/tb";


function TopTable({ appliedFilters, filteredData, showDiff, dateOptions, rightTableHeadRef, renderTooltip, formatDate, countries, waysToBuy }) {
    return (
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
                                    <div className={`${showDiff ? 'col-6' : 'col-4'}`} key={i.date}>
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
                                                        <div className={`right-th ${showDiff ? 'col-2' : 'col-4'}`}>GBI</div>
                                                        {
                                                            showDiff &&
                                                            <div className='right-th col-3'><TbDelta /> (AOS - GBI)</div>
                                                        }
                                                        <div className={`right-th ${showDiff ? 'col-2' : 'col-4'}`}>AOS</div>
                                                        {
                                                            showDiff &&
                                                            <div className='right-th col-3'><TbDelta /> (AOS - FSI)</div>
                                                        }
                                                        <div className={`right-th ${showDiff ? 'col-2' : 'col-4'}`}>FSI</div>
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

        </>
    )
}

export default TopTable