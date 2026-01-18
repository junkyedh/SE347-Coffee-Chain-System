import AdminButton from '@/components/admin/AdminButton/AdminButton';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import { useToast } from '@/components/common/Toast/Toast';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import { DownloadOutlined } from '@ant-design/icons';
import { message, Table, Tag } from 'antd';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import '../adminPage.scss';

export const AdminOrderList = () => {
  const [adminOrderList, setAdminOrderList] = useState<any[]>([]);
  const [originalAdminOrderList, setOriginalAdminOrderList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchAdminOrderList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApiRequest.get('/order/list');
      setAdminOrderList(res.data);
      setOriginalAdminOrderList(res.data);
    } catch (error) {
      console.error('Error fetching order list:', error);
      toast.fetchError('đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSearchKeyword = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      fetchAdminOrderList();
      return;
    }
    const filtered = originalAdminOrderList.filter((order) => {
      const id = String(order.id ?? '').toLowerCase();
      const phoneCustomer = (order.phoneCustomer ?? '').toLowerCase();
      const staffName = (order.staffName ?? '').toLowerCase();

      return id.includes(keyword) || phoneCustomer.includes(keyword) || staffName.includes(keyword);
    });
    setAdminOrderList(filtered);
  };

  useEffect(() => {
    if (!searchKeyword.trim()) {
      fetchAdminOrderList();
    }
  }, [searchKeyword, fetchAdminOrderList]);

  useEffect(() => {
    fetchAdminOrderList();
  }, [fetchAdminOrderList]);

  const handleExportAdminOrderList = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      adminOrderList.map((order) => ({
        'Mã đơn': order.id,
        'Số điện thoại': order.phoneCustomer,
        'Loại phục vụ': order.serviceType,
        'Phương thức thanh toán': order.paymentMethod || 'Tiền mặt',
        'Trạng thái thanh toán': order.paymentStatus || 'Chưa thanh toán',
        'Tổng tiền': order.totalPrice,
        'Ngày đặt': moment(order.orderDate).format('DD-MM-YYYY HH:mm:ss'),
        'Nhân viên': order.staffName,
        'Trạng thái đơn': order.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Đơn Hàng');
    XLSX.writeFile(workbook, 'DanhSachDonHang.xlsx');
    message.success('Xuất danh sách đơn hàng thành công.');
  };

  const handleUpdatePaymentStatus = async (orderId: number, newStatus: string) => {
    try {
      await AdminApiRequest.put(`/order/${orderId}`, {
        paymentStatus: newStatus,
      });
      message.success('Cập nhật trạng thái thanh toán thành công!');
      fetchAdminOrderList();
    } catch (error) {
      console.error('Error updating payment status:', error);
      message.error('Không thể cập nhật trạng thái thanh toán.');
    }
  };

  return (
    <div className="container-fluid">
      <div className="sticky-header-wrapper">
        <h2 className="header-custom">DANH SÁCH ĐƠN HÀNG</h2>
        {/* Tìm kiếm và  Export */}
        <div className="header-actions">
          <div className="search-form">
            <SearchInput
              placeholder="Tìm kiếm theo SĐT, mã đơn hoặc nhân viên"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearchKeyword}
              allowClear
            />
          </div>
          <div className="d-flex">
            <AdminButton
              variant="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportAdminOrderList}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <Table
        className="custom-table"
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        dataSource={adminOrderList}
        columns={[
          {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => a.id - b.id,
          },
          {
            title: 'Số điện thoại',
            dataIndex: 'phoneCustomer',
            key: 'phoneCustomer',
          },
          {
            title: 'Loại phục vụ',
            dataIndex: 'serviceType',
            key: 'serviceType',
            sorter: (a, b) => a.serviceType.localeCompare(b.serviceType),
            render: (text) => <div>{text.toLowerCase() === 'take away' ? 'Mang đi' : 'Tại cửa hàng'}</div>,
          },
          {
            title: 'Phương thức TT',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method: string) => {
              const paymentMethod = method || 'cash';
              let color = 'blue';
              let text = 'Tiền mặt (COD)';
              if (paymentMethod === 'vnpay') {
                color = 'orange';
                text = 'VNPay';
              }
              return <Tag color={color}>{text}</Tag>;
            },
          },
          {
            title: 'Trạng thái TT',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status: string, record: any) => {
              const paymentStatus = status || 'Chưa thanh toán';
              let color = 'default';
              if (paymentStatus === 'Đã thanh toán') color = 'green';
              else if (paymentStatus === 'Chưa thanh toán') color = 'orange';

              return (
                <div className="d-flex align-items-center gap-2">
                  <Tag color={color}>{paymentStatus}</Tag>
                  {paymentStatus === 'Chưa thanh toán' && record.paymentMethod === 'cash' && (
                    <AdminButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdatePaymentStatus(record.id, 'Đã thanh toán')}
                    >
                      Xác nhận
                    </AdminButton>
                  )}
                </div>
              );
            },
          },
          {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            sorter: (a, b) => a.totalPrice - b.totalPrice,
            render: (price: number) => `${Number(price || 0).toLocaleString('vi-VN')}₫`,
          },
          {
            title: 'Ngày đặt',
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (date: string) => moment(date).format('DD-MM-YYYY HH:mm:ss'),
            sorter: (a, b) => moment(a.orderDate).unix() - moment(b.orderDate).unix(),
          },
          {
            title: 'Nhân viên',
            dataIndex: 'staffName',
            key: 'staffName',
            sorter: (a, b) => a.staffName.localeCompare(b.staffName),
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
              let color = 'default';
              if (status === 'Đang thực hiện') color = 'purple';
              else if (status === 'Hoàn thành') color = 'green';
              else if (status === 'Đã hủy') color = 'red';
              return <Tag color={color}>{status}</Tag>;
            },
            sorter: (a, b) => a.status.localeCompare(b.status),
          },
        ]}
      />
    </div>
  );
};

export default AdminOrderList;
