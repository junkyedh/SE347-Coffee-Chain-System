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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import '../Statistic.scss';

type SystemReport = {
  totalPayment?: number;
  totalProduct?: number;
  totalCustomer?: number;
  totalStaff?: number;
  totalTable?: number;
  totalBranch?: number;

  [key: string]: any;
};

const Statistic: React.FC = () => {
  const [chartData, setChartData] = useState<SystemReport>({});
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await MainApiRequest.get('/report/system', {
        signal: controller.signal,
      });

      setChartData(res.data ?? {});
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.name === 'CanceledError') return;

      setChartData({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  const summary = useMemo(() => {
    const totalOrderText =
      typeof chartData.totalPayment === 'number'
        ? chartData.totalPayment.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })
        : 'N/A';

    return {
      totalOrderText,
      totalProductText:
        chartData.totalProduct != null ? String(chartData.totalProduct) : 'N/A',
      totalCustomerText:
        chartData.totalCustomer != null ? String(chartData.totalCustomer) : 'N/A',
      totalStaffText:
        chartData.totalStaff != null ? String(chartData.totalStaff) : 'N/A',
      totalTableText:
        chartData.totalTable != null ? String(chartData.totalTable) : 'N/A',
      totalBranchText:
        chartData.totalBranch != null ? String(chartData.totalBranch) : 'N/A',
    };
  }, [chartData]);

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
              <Card.Text>
                {loading ? 'Đang tải...' : summary.totalOrderText}
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Số Đồ Uống</Card.Title>
              <Card.Text>{loading ? 'Đang tải...' : summary.totalProductText}</Card.Text>
            </Card.Body>
          </Card>

          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Số Khách</Card.Title>
              <Card.Text>{loading ? 'Đang tải...' : summary.totalCustomerText}</Card.Text>
            </Card.Body>
          </Card>

          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Số Nhân Viên</Card.Title>
              <Card.Text>{loading ? 'Đang tải...' : summary.totalStaffText}</Card.Text>
            </Card.Body>
          </Card>

          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Số Bàn</Card.Title>
              <Card.Text>{loading ? 'Đang tải...' : summary.totalTableText}</Card.Text>
            </Card.Body>
          </Card>

          <Card className="card">
            <Card.Body>
              <Card.Title>Tổng Số Chi Nhánh</Card.Title>
              <Card.Text>{loading ? 'Đang tải...' : summary.totalBranchText}</Card.Text>
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
