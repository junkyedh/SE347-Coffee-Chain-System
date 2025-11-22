import { MainApiRequest } from '@/services/MainApiRequest';
import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import '../Statistic/Statistic.scss';
import { useSystemContext } from '@/hooks/useSystemContext';
import Revenue30Days from '@/components/Statistic/Revenue30Days';
import DrinkChart from '@/components/Statistic/DrinkChart';
import Top5Drinks from '@/components/Statistic/Top5Drinks';
import OrderType from '@/components/Statistic/OrderType';
import OrdersChart14 from '@/components/Statistic/OrdersChart14';
import OrdersChart30 from '@/components/Statistic/OrdersChart30';
import OrderRevenue14 from '@/components/Statistic/OrderRevenue14';
import OrderRevenue30 from '@/components/Statistic/OrderRevenue30';

const ManagerStatistic: React.FC = () => {
  const [chartData, setChartData] = useState<any>({});
  const { branchId } = useSystemContext();

  const fetchData = async () => {
    try {
      if (!branchId) return;

      const res = await MainApiRequest.get(`/report/branch/${branchId}`);
      setChartData(res.data);

      const totalPayment = document.getElementById('totalPayment');
      const totalProduct = document.getElementById('totalProduct');
      const totalStaff = document.getElementById('totalStaff');
      const totalTable = document.getElementById('totalTable');

      if (res.data.totalPayment && totalPayment) {
        totalPayment.innerText = res.data.totalPayment.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        });
      }
      if (res.data.totalProduct && totalProduct) {
        totalProduct.innerText = res.data.totalProduct;
      }
      if (res.data.totalStaff && totalStaff) {
        totalStaff.innerText = res.data.totalStaff;
      }
      if (res.data.totalTable && totalTable) {
        totalTable.innerText = res.data.totalTable;
      }
    } catch (error) {
      console.error('Error fetching branch report:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container-fluid">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">THỐNG KÊ CHI NHÁNH</h2>
      </div>
      <div className="container-fluid1">
        <div className="stat-cards">
          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Doanh Thu</Card.Title>
              <Card.Text id="totalPayment">N/A</Card.Text>
            </Card.Body>
          </Card>
          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Số Đồ Uống</Card.Title>
              <Card.Text id="totalProduct">N/A</Card.Text>
            </Card.Body>
          </Card>
          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Số Nhân Viên</Card.Title>
              <Card.Text id="totalStaff">N/A</Card.Text>
            </Card.Body>
          </Card>
          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Số Bàn</Card.Title>
              <Card.Text id="totalTable">N/A</Card.Text>
            </Card.Body>
          </Card>
        </div>

        <div className="charts">
          <div className="chart-full-width">
            <Revenue30Days data={chartData} />
          </div>
        </div>

        <div className="charts-row">
          <DrinkChart data={chartData} />
          <Top5Drinks data={chartData} />
          <OrderType data={chartData} />
        </div>

        <div className="charts-row">
          <div className="chart-left">
            <OrdersChart14 data={chartData} />
            <OrdersChart30 data={chartData} />
          </div>
          <div className="chart-right">
            <OrderRevenue14 data={chartData} />
            <OrderRevenue30 data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerStatistic;
