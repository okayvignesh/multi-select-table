import React, { useState } from 'react'
import { useEffect } from 'react';
import axios from 'axios';

function Footer() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false)

    const calculateTimeAgo = (timestamp) => {
        if (!timestamp) return '';

        const [datePart, timePart] = timestamp.split(' ');
        const [day, month, year] = datePart.split('-');

        const monthMap = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
            'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6
        };

        const monthNum = monthMap[month];
        const [hours, minutes, seconds] = timePart.split(':');

        const snapshotDate = new Date(year, monthNum, day, hours, minutes, seconds);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - snapshotDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

        if (diffDays > 0) {
            return `(${diffDays} days ago)`;
        } else if (diffHours > 0) {
            return `(${diffHours} hours ago)`;
        } else {
            return `(${diffMinutes} minutes ago)`;
        }
    };

    useEffect(() => {
        setLoading(true);
        axios.get('https://run.mocky.io/v3/cb78c35d-78d9-4b7a-8336-e47f8fbe9e37')
            .then(response => {
                setData(response.data.result[0]);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <footer className="footer">
            {
                loading ? <p>loading..</p>
                    :
                    <>
                        <div className='footer-box'>
                            <p>Last Refresh Time</p>
                            <p>{data?.Last_Refresh_Time} {calculateTimeAgo(data?.Last_Refresh_Time)}</p>
                        </div>
                        <div className='footer-box'>
                            <p>AOS Last Snapshot Time</p>
                            <p>{data?.AOS_Last_Snapshot_Time} {calculateTimeAgo(data?.AOS_Last_Snapshot_Time)}</p>
                        </div>
                        <div className='footer-box'>
                            <p>GBI Last Snapshot Time</p>
                            <p>{data?.GBI_Last_Snapshot_Time} {calculateTimeAgo(data?.GBI_Last_Snapshot_Time)}</p>
                        </div>
                        <div className='footer-box'>
                            <p>FSI Last Snapshot Time</p>
                            <p>{data?.FSI_Last_Snapshot_Time} {calculateTimeAgo(data?.FSI_Last_Snapshot_Time)}</p>
                        </div>
                    </>
            }
        </footer>
    )
}

export default Footer