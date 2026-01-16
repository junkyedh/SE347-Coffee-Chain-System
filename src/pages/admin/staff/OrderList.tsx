import AdminButton from '@/components/admin/AdminButton/AdminButton';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import StatusDropdown from '@/components/common/StatusDropdown/StatusDropdown';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import { DownloadOutlined } from '@ant-design/icons';
import { Form, Input, message, Table, Tag } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import '../adminPage.scss';

export const OrderList = () => {
  const [managerOrderList, setManagerOrderList] = useState<any[]>([]);
  const [originalManagerOrderList, setOriginalManagerOrderList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [staffInput, setStaffInput] = useState<{ [orderId: number]: string }>({});

  const fetchManagerOrderList = async () => {
    const res = await AdminApiRequest.get('/branch-order/list');
    setManagerOrderList(res.data);
    setOriginalManagerOrderList(res.data);
  };

  useEffect(() => {
    fetchManagerOrderList();
  }, []);

  const handleSearchKeyword = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      fetchManagerOrderList();
      return;
    }
    const filtered = originalManagerOrderList.filter((order) => {
      const id = String(order.id ?? '').toLowerCase();
      const phoneCustomer = (order.phoneCustomer ?? '').toLowerCase();
      const staffName = (order.staffName ?? '').toLowerCase();

      return id.includes(keyword) || phoneCustomer.includes(keyword) || staffName.includes(keyword);
    });
    setManagerOrderList(filtered);
  };

  useEffect(() => {
    if (!searchKeyword.trim()) {
      fetchManagerOrderList();
    }
  }, [searchKeyword]);

  const handleExportManagerOrderList = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      managerOrderList.map((order) => ({
        'Mã đơn': order.id,
        'Số điện thoại': order.phoneCustomer,
        'Loại phục vụ': order.serviceType,
        'Phương thức thanh toán': order.paymentMethod || 'Tiền mặt',
        'Trạng thái thanh toán': order.paymentStatus || 'Chưa thanh toán',
        'Tổng tiền': order.totalPrice,
        'Ngày đặt': moment(order.orderDate).format('DD-MM-YYYY HH:mm:ss'),
        'Nhân viên': order.staffName,
        'Trạng thái': statusMap[order.status]?.label || order.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Đơn Hàng');
    XLSX.writeFile(workbook, 'DanhSachDonHang.xlsx');
    message.success('Xuất danh sách đơn hàng thành công.');
  };

  const handleChangeStatus = async (id: number, newStatus: string) => {
    // Tim đơn hàng hiện tại
    const currentOrder = managerOrderList.find((o) => o.id === id);
    if (!currentOrder) {
      message.error('Đơn hàng không tồn tại.');
      return;
    }

    const inputName = staffInput[id];
    const existingStaffName = currentOrder.staffName;

    // Nếu chưa có nhân viên được gán
    if (!existingStaffName && !inputName) {
      message.warning('Vui lòng nhập tên nhân viên trước khi đổi trạng thái!');
      return;
    }

    try {
      await AdminApiRequest.put(`/branch-order/status/${id}`, {
        status: newStatus,
        staffName: existingStaffName || inputName,
      });

      message.success('Cập nhật trạng thái và nhân viên thành công.');
      fetchManagerOrderList();

      // Clear input after successful update
      setStaffInput((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      message.error('Không thể cập nhật trạng thái.');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: number, newStatus: string) => {
    try {
      await AdminApiRequest.put(`/order/${orderId}`, {
        paymentStatus: newStatus,
      });
      message.success('Cập nhật trạng thái thanh toán thành công!');
      fetchManagerOrderList();
    } catch (error) {
      console.error('Error updating payment status:', error);
      message.error('Không thể cập nhật trạng thái thanh toán.');
    }
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    Nháp: { label: 'Nháp', color: 'default' },
    'Chờ xác nhận': { label: 'Chờ xác nhận', color: 'orange' },
    'Đã xác nhận': { label: 'Đã xác nhận', color: 'blue' },
    'Đang chuẩn bị': { label: 'Đang chuẩn bị', color: 'purple' },
    'Sẵn sàng': { label: 'Sẵn sàng', color: 'cyan' },
    'Đang giao': { label: 'Đang giao', color: 'geekblue' },
    'Hoàn thành': { label: 'Hoàn thành', color: 'green' },
    'Đã hủy': { label: 'Đã hủy', color: 'red' },
  };

  return (
    <div className="container-fluid m-2">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">DANH SÁCH ĐƠN HÀNG</h2>
        <div className="header-actions d-flex me-3 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            <Form layout="inline" className="search-form d-flex">
              <SearchInput
                placeholder="Tìm kiếm theo SĐT, mã đơn hoặc nhân viên"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearchKeyword}
                allowClear
              />
            </Form>
          </div>
          <div className="d-flex">
            <AdminButton
              variant="primary"
              size="sm"
              icon={<DownloadOutlined />}
              onClick={handleExportManagerOrderList}
              title="Tải xuống danh sách"
            />
          </div>
        </div>
      </div>

      <Table
        className="custom-table"
        dataSource={managerOrderList}
        rowKey="id"
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
            render: (staffName: string, record: any) => {
              if (staffName) {
                return <span style={{ fontWeight: 500, color: '#1890ff' }}>{staffName}</span>;
              }

              return (
                <Input
                  value={staffInput[record.id] || ''}
                  placeholder="Tên nhân viên"
                  size="small"
                  style={{ width: 140 }}
                  onChange={(e) =>
                    setStaffInput((prev) => ({
                      ...prev,
                      [record.id]: e.target.value,
                    }))
                  }
                />
              );
            },
          },

          {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
              const map = statusMap[status];
              return map ? <Tag color={map.color}>{map.label}</Tag> : <Tag>{status}</Tag>;
            },
            sorter: (a, b) => {
              const labelA = statusMap[a.status]?.label || a.status;
              const labelB = statusMap[b.status]?.label || b.status;
              return labelA.localeCompare(labelB);
            },
          },
          {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
              <StatusDropdown
                value={record.status}
                onChange={(newStatus) => handleChangeStatus(record.id, newStatus)}
                statusMap={statusMap}
              ></StatusDropdown>
            ),
          },
        ]}
      />
    </div>
  );
};

export default OrderList;
