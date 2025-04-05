import React from 'react'
import MultiSelect from './MultiDropdown'
import { MdOutlineDifference } from "react-icons/md";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { FaRegFilePdf } from "react-icons/fa";

function Header({ countries, filter1, setFilter1, waysToBuy, filter3, setFilter3, setFilter2, setShowDiff, dateOptions, handleApply, showDiff, exportToExcel, handlePrint }) {
    return (
        <>
            <div className="mb-3 header">
                <div className='d-flex column-gap-3 align-items-end w-100'>
                    <div className="header-section">
                        <p>Country</p>
                        <MultiSelect
                            options={countries}
                            selectedValues={filter1}
                            onChange={setFilter1}
                            placeholder="Select Country"
                        />
                    </div>
                    <div className="header-section">
                        <p>Ways to Buy</p>
                        <MultiSelect
                            options={waysToBuy}
                            selectedValues={filter3}
                            onChange={setFilter3}
                            placeholder="Select ways to buy"
                        />
                    </div>
                    <div className="header-section">
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
                    <button className="applybtn" onClick={handleApply}>Apply</button>
                </div>
                <div className='d-flex my-2 column-gap-2'>
                    <button className={`clearbtn ${showDiff && 'active'}`} onClick={() => setShowDiff(!showDiff)}>
                        <MdOutlineDifference size={25} color='#00438a' />
                    </button>
                    <button className='clearbtn' onClick={() => exportToExcel()}>
                        <PiMicrosoftExcelLogoFill size={25} color='#00438a' />
                    </button>
                    <button className='clearbtn' onClick={() => handlePrint()}>
                        <FaRegFilePdf size={20} color='#00438a' />
                    </button>
                </div>
            </div>
        </>
    )
}

export default Header