import { AdminApiRequest } from '@/services/AdminApiRequest';
import { message, Table, Tag } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import '../adminPage.scss';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import AdminButton from '@/components/admin/AdminButton/AdminButton';
import AdminPopConfirm from '@/components/admin/PopConfirm/AdminPopConfirm';

export const ManagerOrderList = () => {
  const [managerOrderList, setManagerOrderList] = useState<any[]>([]);
  const [originalManagerOrderList, setOriginalManagerOrderList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

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
        'Tổng tiền': order.totalPrice,
        'Ngày đặt': moment(order.orderDate).format('DD-MM-YYYY HH:mm:ss'),
        'Nhân viên': order.staffName,
        'Trạng thái': order.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Đơn Hàng');
    XLSX.writeFile(workbook, 'DanhSachDonHang.xlsx');
    message.success('Xuất danh sách đơn hàng thành công.');
  };

  const handleCompleteOrder = async (id: number) => {
    try {
      await AdminApiRequest.put(`/branch-order/complete/${id}`);
      message.success('Đơn hàng đã được cập nhật thành hoàn thành.');
      fetchManagerOrderList();
    } catch (error) {
      console.error('Error completing order:', error);
      message.error('Không thể cập nhật trạng thái hoàn thành.');
    }
  };

  const handleCancelOrder = async (id: number) => {
    try {
      await AdminApiRequest.put(`/branch-order/cancel/${id}`);
      message.success('Đơn hàng đã được hủy.');
      fetchManagerOrderList();
    } catch (error) {
      console.error('Error canceling order:', error);
      message.error('Không thể hủy đơn hàng.');
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
            dataIndex: ['staff', 'name'],
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
          {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => {
              const isCompleted = record.status === 'Hoàn thành';
              const isCanceled = record.status === 'Đã hủy';

              return (
                <div className="d-flex gap-2">
                  <AdminButton
                    variant="primary"
                    size="sm"
                    disabled={isCompleted || isCanceled}
                    icon={<i className="fas fa-check"></i>}
                    onClick={() => handleCompleteOrder(record.id)}
                  ></AdminButton>

                  <AdminPopConfirm
                    title="Bạn có chắc chắn muốn hủy đơn hàng này?"
                    onConfirm={() => handleCancelOrder(record.id)}
                    okText="Đồng ý"
                    cancelText="Hủy"
                  >
                    <AdminButton
                      variant="destructive"
                      size="sm"
                      icon={<i className="fas fa-stop"></i>}
                      disabled={isCompleted || isCanceled}
                    ></AdminButton>
                  </AdminPopConfirm>
                </div>
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default ManagerOrderList;
