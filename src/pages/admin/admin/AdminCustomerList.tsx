import AdminButton from '@/components/admin/AdminButton/AdminButton';
import AdminPopConfirm from '@/components/admin/PopConfirm/AdminPopConfirm';
import FloatingLabelInput from '@/components/common/FloatingInput/FloatingLabelInput';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import { useToast } from '@/components/common/Toast/Toast';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import { DownloadOutlined } from '@ant-design/icons';
import { Form, message, Modal, Space, Table } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import '../adminPage.scss';

const AdminCustomerList = () => {
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [openCreateCustomerModal, setOpenCreateCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [form] = Form.useForm();
  const { success } = useToast();

  const fetchCustomerList = async () => {
    try {
      const res = await AdminApiRequest.get('/customer/list');
      setCustomerList(res.data);
    } catch (error) {
      if (axios.isCancel(error)) return; // Ignore canceled requests
      console.error('Error fetching customer list:', error);
      message.error('Lấy danh sách khách hàng thất bại.');
    }
  };

  useEffect(() => {
    fetchCustomerList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchKeyword = async () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      await fetchCustomerList();
      return;
    }

    const filtered = customerList.filter((customer) => {
      const name = (customer.name ?? '').toLowerCase();
      const id = String(customer.id ?? '').toLowerCase();
      const phone = (customer.phone ?? '').toLowerCase();

      return name.includes(keyword) || id.includes(keyword) || phone.includes(keyword);
    });
    setCustomerList(filtered);
  };

  const exportExcel = () => {
    const exportData = customerList.map((customer) => ({
      ID: customer.id,
      'Tên khách hàng': customer.name,
      'Giới tính': customer.gender,
      'Số điện thoại': customer.phone,
      'Tổng tiền': customer.total,
      'Ngày đăng ký': moment(customer.registrationDate).format('DD-MM-YYYY HH:mm:ss'),
      'Hạng thành viên': customer.rank,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachKhachHang');
    XLSX.writeFile(workbook, 'DanhSachKhachHang.xlsx');
  };

  const onOKCreateCustomer = async () => {
    try {
      const data = form.getFieldsValue();
      data.registrationDate = data.registrationDate.toISOString();

      if (editingCustomer) {
        const { id, ...rest } = data;
        await AdminApiRequest.put(`/customer/${editingCustomer.id}`, rest);
      } else {
        await AdminApiRequest.post('/customer', data);
      }

      fetchCustomerList();
      setOpenCreateCustomerModal(false);
      form.resetFields();
      setEditingCustomer(null);
    } catch (error) {
      console.error('Lỗi khi tạo khách hàng:', error);
      message.error('Không thể tạo khách hàng. Vui lòng thử lại.');
    }
  };

  const onCancelCreateCustomer = () => {
    setOpenCreateCustomerModal(false);
    form.resetFields();
  };

  const onEditCustomer = (record: any) => {
    setEditingCustomer(record);
    form.setFieldsValue({
      ...record,
      registrationDate: moment(record.registrationDate),
    });
    setOpenCreateCustomerModal(true);
  };

  const onDeleteCustomer = async (id: number) => {
    try {
      await AdminApiRequest.delete(`/customer/${id}`);
      fetchCustomerList();
      success('Xóa khách hàng thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa khách hàng:', error);
      message.error('Không thể xóa khách hàng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="container-fluid">
      <div className="sticky-header-wrapper">
        <h2 className="header-custom">QUẢN LÝ KHÁCH HÀNG</h2>
        {/* Tìm kiếm và Import + Export */}
        <div className="header-actions">
          <div className="search-form">
            <SearchInput
              placeholder="Tìm kiếm theo id, tên khách hàng hoặc SĐT"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearchKeyword}
              allowClear
            />
          </div>
          <div className="d-flex">
            <AdminButton variant="primary" icon={<DownloadOutlined />} onClick={exportExcel} />
          </div>
        </div>
      </div>

      <Modal
        className="custom-modal"
        title={editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'}
        open={openCreateCustomerModal}
        onOk={onOKCreateCustomer}
        onCancel={onCancelCreateCustomer}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <div className="grid-2">
            <FloatingLabelInput
              label="Tên"
              name="name"
              component="input"
              type="text"
              rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
            ></FloatingLabelInput>
            <FloatingLabelInput
              label="Giới tính"
              name="gender"
              component="select"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
              options={[
                { value: 'Nam', label: 'Nam' },
                { value: 'Nữ', label: 'Nữ' },
                { value: 'Khác', label: 'Khác' },
              ]}
            ></FloatingLabelInput>
          </div>
          <div className="grid-2">
            <FloatingLabelInput
              label="Số điện thoại"
              name="phone"
              component="input"
              type="text"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            ></FloatingLabelInput>
            <FloatingLabelInput
              label="Ngày đăng ký"
              name="registrationDate"
              component="date"
              type="date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày đăng ký!' }]}
            ></FloatingLabelInput>
          </div>
          <div className="grid-2">
            <FloatingLabelInput
              label="Tổng mức chi tiêu"
              name="total"
              component="input"
              type="number"
              disabled
            ></FloatingLabelInput>
            <FloatingLabelInput
              label="Hạng thành viên"
              name="rank"
              component="select"
              rules={[{ required: true, message: 'Vui lòng chọn hạng thành viên!' }]}
              options={[
                { value: 'Thường', label: 'Thường' },
                { value: 'Vàng', label: 'Vàng' },
                { value: 'Bạc', label: 'Bạc' },
                { value: 'Kim cương', label: 'Kim cương' },
              ]}
              disabled
            ></FloatingLabelInput>
          </div>
          <div className="modal-footer-custom">
            <AdminButton variant="secondary" onClick={onCancelCreateCustomer}>
              Hủy
            </AdminButton>
            <AdminButton variant="primary" onClick={onOKCreateCustomer}>
              {editingCustomer ? 'Lưu thay đổi' : 'Tạo mới'}
            </AdminButton>
          </div>
        </Form>
      </Modal>

      <Table
        className="custom-table"
        rowKey="id"
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
        }}
        dataSource={customerList}
        columns={[
          { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
          {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
            sorter: (a, b) => a.gender.localeCompare(b.gender),
          },
          { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
          {
            title: 'Tổng chi tiêu',
            dataIndex: 'total',
            key: 'total',
            sorter: (a, b) => a.total - b.total,
            render: (total: number) =>
              total
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                    .format(total)
                    .replace('₫', 'đ')
                : '0đ',
          },
          {
            title: 'Hạng thành viên',
            dataIndex: 'rank',
            key: 'rank',
            sorter: (a, b) => a.rank.localeCompare(b.rank),
            render: (rank: string) => (rank ? rank : 'Thường'),
          },
          {
            title: 'Ngày đăng ký',
            dataIndex: 'registrationDate',
            key: 'registrationDate',
            sorter: (a, b) => moment(a.registrationDate).unix() - moment(b.registrationDate).unix(),
            render: (registrationDate: string) =>
              registrationDate ? moment(registrationDate).format('DD-MM-YYYY HH:mm:ss') : '-',
          },
          {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
              <Space size="middle">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  icon={<i className="fas fa-edit"></i>}
                  onClick={() => onEditCustomer(record)}
                ></AdminButton>
                <AdminPopConfirm
                  title="Bạn có chắc chắn muốn xóa khách hàng này không?"
                  onConfirm={() => onDeleteCustomer(record.id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <AdminButton
                    variant="destructive"
                    size="sm"
                    icon={<i className="fas fa-trash"></i>}
                  ></AdminButton>
                </AdminPopConfirm>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AdminCustomerList;
