import CustomerRankChart from '@/components/Statistic/CustomerRankChart';
import DrinkChart from '@/components/Statistic/DrinkChart';
import OrderRevenue14 from '@/components/Statistic/OrderRevenue14';
import OrderRevenue30 from '@/components/Statistic/OrderRevenue30';
import OrderType from '@/components/Statistic/OrderType';
import OrdersChart14 from '@/components/Statistic/OrdersChart14';
import OrdersChart30 from '@/components/Statistic/OrdersChart30';
import Revenue30Days from '@/components/Statistic/Revenue30Days';
import Top5Drinks from '@/components/Statistic/Top5Drinks';
import TopBranchRevenue from '@/components/Statistic/TopBranchRevenue';
import { MainApiRequest } from '@/services/MainApiRequest';
import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import '../Statistic.scss';

const Statistic: React.FC = () => {
  const [chartData, setChartData] = useState<any>({});

  const fetchData = async () => {
    const res = await MainApiRequest.get('/report/system');
    setChartData(res.data);

    const totalProduct = document.getElementById('totalProduct');
    const totalCustomer = document.getElementById('totalCustomer');
    const totalStaff = document.getElementById('totalStaff');
    const totalOrder = document.getElementById('totalOrder');
    const totalTable = document.getElementById('totalTable');
    const totalBranch = document.getElementById('totalBranch');

    if (res.data.totalPayment && totalOrder) {
      totalOrder.innerText = res.data.totalPayment.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
      });
    }
    if (res.data.totalProduct && totalProduct) {
      totalProduct.innerText = res.data.totalProduct;
    }
    if (res.data.totalCustomer && totalCustomer) {
      totalCustomer.innerText = res.data.totalCustomer;
    }
    if (res.data.totalStaff && totalStaff) {
      totalStaff.innerText = res.data.totalStaff;
    }
    if (res.data.totalTable && totalTable) {
      totalTable.innerText = res.data.totalTable;
    }
    if (res.data.totalBranch && totalBranch) {
      totalBranch.innerText = res.data.totalBranch;
    }
  };

  useEffect(() => {
    fetchData();
    console.log(chartData);
  }, []);

  return (
    <div className="container-fluid">
      <div className="header">
        <h2 className="h2 header-custom">THỐNG KÊ QUÁN CÀ PHÊ</h2>
      </div>
      <div className="container-fluid1">
        {/* Tổng quan thống kê */}
        <div className="stat-cards">
          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Doanh Thu</Card.Title>
              <Card.Text id="totalOrder">N/A</Card.Text>
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
              <Card.Title>Tổng Số Khách</Card.Title>
              <Card.Text id="totalCustomer">N/A</Card.Text>
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
          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Số Chi Nhánh</Card.Title>
              <Card.Text id="totalBranch">N/A</Card.Text>
            </Card.Body>
          </Card>
        </div>

        {/* Biểu đồ Doanh Thu riêng */}
        <div className="charts">
          <div className="chart-full-width">
            <Revenue30Days data={chartData} />
          </div>
        </div>

        {/* Các biểu đồ còn lại */}
        <div className="charts-row">
          <DrinkChart data={chartData} />
          <CustomerRankChart data={chartData} />
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
        <div className="charts">
          <div className="chart-full-width">
            <TopBranchRevenue />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistic;
