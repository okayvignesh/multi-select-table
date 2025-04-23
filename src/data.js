import { v4 as uuidv4 } from 'uuid';

export const countries = [
    { id: 1, label: 'United States' },
    { id: 2, label: 'Canada' },
    { id: 3, label: 'United Kingdom' },
    { id: 4, label: 'Australia' },
    { id: 5, label: 'Germany' },
    { id: 6, label: 'France' },
    { id: 7, label: 'Japan' },
    { id: 8, label: 'India' },
    { id: 9, label: 'Brazil' },
    { id: 10, label: 'South Africa' }
];

export const waysToBuy = [
    { id: 1, label: 'Online' },
    { id: 2, label: 'In-Store' },
    { id: 3, label: 'Phone Order' },
    { id: 4, label: 'Subscription' },
    { id: 5, label: 'Direct Purchase' }
];

const generateRandomData = () => ({
    gbi: Math.floor(Math.random() * 10000) + 1000,
    aos: Math.floor(Math.random() * 10000) + 1000,
    fsi: Math.floor(Math.random() * 10000) + 1000
});

export const bagStatuses = [
    { key: "bagsApproved", name: "Bags Approved", className: "" },
    { key: "bagsPending", name: "Bags Pending", className: "" },
    { key: "bagsDeclined", name: "Bags Declined", className: "" },
    { key: "totalBagsCreated", name: "Total Bags Created", className: "powder-blue" },
    { key: "bagsDeleted", name: "Bags Deleted", className: "" },
    { key: "massDeleted", name: "Mass Deleted", className: "" },
    { key: "totalBagsDeleted", name: "Total Bags Deleted", className: "powder-blue" },
    { key: "bagsOrdered", name: "Bags Ordered", className: "" },
    { key: "paymentsFailed", name: "Payments Failed", className: "" },
    { key: "totalBagsOrdered", name: "Total Bags Ordered", className: "powder-blue" },
    { key: "openBags", name: "Open Bags", className: "powder-green" }
];

export const tableData = Array.from({ length: 8 }, (_, dayOffset) => {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${month}/${day}/${year}`;

    const dayData = countries.flatMap(country =>
        waysToBuy.map(way => {
            const randomData = {
                bagsApproved: generateRandomData(),
                bagsPending: generateRandomData(),
                bagsDeclined: generateRandomData(),
                totalBagsCreated: generateRandomData(),
                bagsDeleted: generateRandomData(),
                massDeleted: generateRandomData(),
                totalBagsDeleted: generateRandomData(),
                bagsOrdered: generateRandomData(),
                paymentsFailed: generateRandomData(),
                totalBagsOrdered: generateRandomData(),
                openBags: generateRandomData(),
            };

            const orderedData = bagStatuses.reduce((acc, { key }) => {
                acc[key] = randomData[key];
                return acc;
            }, {});

            return {
                id: uuidv4(),
                country: country.label,
                ways_to_buy: way.label,
                asofdate: formattedDate,
                ...orderedData
            };
        })
    );

    return {
        date: formattedDate,
        data: dayData.map(({ asofdate, ...data }) => data)
    };
});

export function formatDate(d) {
    const date = new Date(d);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
}
