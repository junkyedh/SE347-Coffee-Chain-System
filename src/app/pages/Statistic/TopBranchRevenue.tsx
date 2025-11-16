import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { MainApiRequest } from '@/app/services/MainApiRequest';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BranchRevenue {
    branchId: number;
    branchName: string;
    totalRevenue: number;
    totalOrders: number;
    totalSold: number;
}

const TopBranchRevenue = () => {
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await MainApiRequest.get('/report/monthly-branch-compare');
                const rawData: BranchRevenue[] = res.data;

                const top5 = rawData
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .slice(0, 5);

                setChartData({
                    labels: top5.map(b => b.branchName),
                    datasets: [
                        {
                            label: 'Doanh thu (VND)',
                            data: top5.map(b => b.totalRevenue),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            yAxisID: 'y1',
                        },
                        {
                            label: 'Số đơn hàng',
                            type: 'line',
                            data: top5.map(b => b.totalOrders),
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            fill: false,
                            tension: 0.2,
                            yAxisID: 'y2',
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching top branch revenue:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="chart">
            {chartData ? (
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Top 5 chi nhánh có doanh thu cao nhất tháng này',
                            },
                        },
                        scales: {
                            y1: {
                                beginAtZero: true,
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Doanh thu (VND)',
                                },
                            },
                            y2: {
                                beginAtZero: true,
                                position: 'right',
                                grid: {
                                    drawOnChartArea: false, // không vẽ đường kẻ của trục y2 lên chart
                                },
                                title: {
                                    display: true,
                                    text: 'Số đơn hàng',
                                },
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Chi nhánh',
                                },
                            },
                        },
                    }}
                />
            ) : (
                <p>Đang tải dữ liệu...</p>
            )}
        </div>
    );
};

export default TopBranchRevenue;
