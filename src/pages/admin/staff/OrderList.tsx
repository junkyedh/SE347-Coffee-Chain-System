import AdminButton from '@/components/admin/AdminButton/AdminButton';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import StatusDropdown from '@/components/common/StatusDropdown/StatusDropdown';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import { DownloadOutlined, UserOutlined } from '@ant-design/icons';
import { Form, message, Select, Table, Tag } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import '../adminPage.scss';
import { useSystemContext } from '@/hooks/useSystemContext';

export const OrderList = () => {
  const [managerOrderList, setManagerOrderList] = useState<any[]>([]);
  const [originalManagerOrderList, setOriginalManagerOrderList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // State lưu ID nhân viên đang chọn cho các đơn hàng chưa có người phụ trách
  const [staffInput, setStaffInput] = useState<{ [orderId: number]: number }>({});
  
  const [branchStaffList, setBranchStaffList] = useState<any[]>([]);
  
  const { branchId } = useSystemContext();
  const currentBranchId = Number(branchId) || 1;

  const fetchManagerOrderList = async () => {
    try {
      const res = await AdminApiRequest.get('/branch-order/list');
      setManagerOrderList(res.data);
      setOriginalManagerOrderList(res.data);
    } catch (error) {
      if (axios.isCancel(error)) return; // Ignore canceled requests
      console.error(error);
    }
  };

  const fetchBranchStaffList = async () => {
    try {
      const res = await AdminApiRequest.get('/staff/list'); 
      // Filter theo branchId của staff hiện tại
      const filteredStaff = res.data.filter((staff: any) => staff.branchId === currentBranchId);
      setBranchStaffList(filteredStaff);
    } catch (error) {
      if (axios.isCancel(error)) return; // Ignore canceled requests
      console.error('Lỗi tải danh sách nhân viên:', error);
    }
  };

  useEffect(() => {
    fetchManagerOrderList();
    fetchBranchStaffList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchKeyword = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      setManagerOrderList(originalManagerOrderList);
      return;
    }
    const filtered = originalManagerOrderList.filter((order) => {
      const id = String(order.id ?? '').toLowerCase();
      const phoneCustomer = (order.phoneCustomer ?? '').toLowerCase();
      const staffName = (order.staff?.name || order.staffName || '').toLowerCase();
      
      return id.includes(keyword) || phoneCustomer.includes(keyword) || staffName.includes(keyword);
    });
    setManagerOrderList(filtered);
  };
  
  useEffect(() => {
     if (!searchKeyword) setManagerOrderList(originalManagerOrderList);
  }, [searchKeyword, originalManagerOrderList]);

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
        'Nhân viên': order.staff?.name || order.staffName || '',
        'Trạng thái': statusMap[order.status]?.label || order.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Đơn Hàng');
    XLSX.writeFile(workbook, 'DanhSachDonHang.xlsx');
  };

  const handleChangeStatus = async (id: number, newStatus: string) => {
    const currentOrder = managerOrderList.find((o) => o.id === id);
    if (!currentOrder) {
      message.error('Đơn hàng không tồn tại.');
      return;
    }

    const selectedStaffId = staffInput[id];
    
    const hasAssignedStaff = currentOrder.staff || currentOrder.staffID || currentOrder.staffName;

    if (!hasAssignedStaff && !selectedStaffId) {
      message.warning('Vui lòng chọn nhân viên phụ trách trước khi xử lý đơn hàng!');
      return;
    }

    try {
      const payload: any = {
        status: newStatus,
      };
      
      // Chỉ gửi staffId nếu người dùng có chọn mới. 
      // Nếu đã có staff cũ, backend sẽ tự giữ nguyên (dựa trên logic service đã sửa trước đó)
      if (selectedStaffId) {
        payload.staffId = selectedStaffId;
      }

      await AdminApiRequest.put(`/branch-order/status/${id}`, payload);

      message.success('Cập nhật thành công.');
      fetchManagerOrderList();

      // Clear input sau khi thành công
      setStaffInput((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái.');
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

  const STATUS_FLOW = [
    'Chờ xác nhận',
    'Đã xác nhận',
    'Đang chuẩn bị',
    'Sẵn sàng',
    'Đang giao',
    'Hoàn thành',
  ];

  const getAllowedStatusMap = (currentStatus: string) => {
    if (currentStatus === 'Hoàn thành' || currentStatus === 'Đã hủy') {
      return {};
    }
    
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    const allowedMap: Record<string, { label: string; color: string }> = {};
    
    // Chỉ thêm các trạng thái tiếp theo, KHÔNG bao gồm trạng thái hiện tại
    STATUS_FLOW.forEach((status, index) => {
      if (index > currentIndex) allowedMap[status] = statusMap[status];
    });
    
    // Luôn cho phép hủy đơn (trừ khi đã hoàn thành/đã hủy)
    allowedMap['Đã hủy'] = statusMap['Đã hủy'];
    
    return allowedMap;
  };

  return (
    <div className="container-fluid m-2">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">DANH SÁCH ĐƠN HÀNG</h2>
        <div className="header-actions d-flex me-3 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            <Form layout="inline" className="search-form d-flex">
              <SearchInput
                placeholder="Tìm kiếm..."
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
          { title: 'Mã đơn', dataIndex: 'id', key: 'id', width: 80, sorter: (a, b) => a.id - b.id },
          { title: 'SĐT', dataIndex: 'phoneCustomer', key: 'phoneCustomer', width: 120 },
          { 
            title: 'Loại', 
            dataIndex: 'serviceType', 
            key: 'serviceType',
            width: 100,
            render: (text) => text === 'TAKE AWAY' ? 'Mang đi' : 'Tại chỗ'
          },
          {
            title: 'Phương thức TT',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 130,
            render: (method: string) => {
              const isVNPay = (method || '').toLowerCase() === 'vnpay';
              return <Tag color={isVNPay ? 'orange' : 'blue'}>{isVNPay ? 'VNPay' : 'Tiền mặt'}</Tag>;
            },
          },
          {
            title: 'Trạng thái TT',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            width: 150,
            render: (status: string, record: any) => {
               const st = status || 'Chưa thanh toán';
               return <Tag color={st === 'Đã thanh toán' ? 'green' : 'orange'}>{st}</Tag>;
            },
          },
          { title: 'Tổng tiền', dataIndex: 'totalPrice', key: 'totalPrice', width: 120, render: (v) => v?.toLocaleString() + 'đ' },
          { 
            title: 'Ngày đặt', 
            dataIndex: 'orderDate', 
            key: 'orderDate',
            width: 150,
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => moment(a.orderDate).unix() - moment(b.orderDate).unix(),
          },
          {
            title: 'Nhân viên',
            key: 'staff',
            width: 200,
            render: (_: any, record: any) => {
              const assignedName = record.staff?.name || record.staffName;

              if (assignedName) {
                return (
                  <div className="d-flex align-items-center gap-2">
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <span style={{ fontWeight: 500, color: '#262626' }}>{assignedName}</span>
                  </div>
                );
              }

              return (
                <Select
                  placeholder="Chọn nhân viên"
                  size="small"
                  style={{ width: '100%' }}
                  value={staffInput[record.id]}
                  onChange={(value) =>
                    setStaffInput((prev) => ({
                      ...prev,
                      [record.id]: value,
                    }))
                  }
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={branchStaffList.map((staff) => ({
                    value: staff.id,
                    label: staff.name, 
                  }))}
                />
              );
            },
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status) => <Tag color={statusMap[status]?.color}>{statusMap[status]?.label || status}</Tag>,
            sorter: (a, b) => (statusMap[a.status]?.label || '').localeCompare(statusMap[b.status]?.label || ''),
          },
          {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 140,
            render: (_: any, record: any) => {
              const allowedMap = getAllowedStatusMap(record.status);
              const isFinalStatus = record.status === 'Hoàn thành' || record.status === 'Đã hủy';
              
              if (isFinalStatus) {
                return <Tag color={statusMap[record.status]?.color}>{statusMap[record.status]?.label}</Tag>;
              }
              
              return (
                <StatusDropdown
                  value={record.status}
                  onChange={(newStatus) => handleChangeStatus(record.id, newStatus)}
                  statusMap={allowedMap}
                />
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default OrderList;