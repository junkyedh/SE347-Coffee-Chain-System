import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Upload,
} from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import moment from "moment";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "../admin/adminPage.scss";
import SearchInput from "@/components/Search/SearchInput";
import { AdminApiRequest } from "@/services/AdminApiRequest";
import FloatingLabelInput from "@/components/FloatingInput/FloatingLabelInput";
import AdminButton from "@/pages/admin/button/AdminButton";
import AdminPopConfirm from "@/pages/admin/button/AdminPopConfirm";

const ManagerCustomerList = () => {
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [membershipList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [openCreateCustomerModal, setOpenCreateCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [form] = Form.useForm();

  const fetchCustomerList = async () => {
    try {
      const res = await AdminApiRequest.get("/customer/list");
      setCustomerList(res.data);
    } catch (error) {
      console.error("Error fetching customer list:", error);
      message.error("Failed to fetch customer list.");
    }
  };

  useEffect(() => {
    fetchCustomerList();
  }, []);

  const handleSearchKeyword = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      fetchCustomerList(); // Lấy lại danh sách đầy đủ nếu không có từ khóa tìm kiếm
      return;
    }

    const filtered = customerList.filter((customer) => {
      const name = (customer.name ?? "").toLowerCase();
      const id = String(customer.id ?? "").toLowerCase();
      const phone = (customer.phone ?? "").toLowerCase();

      return (
        name.includes(keyword) ||
        id.includes(keyword) ||
        phone.includes(keyword)
      );
    });
    setCustomerList(filtered);
  };
  useEffect(() => {
    if (!searchKeyword.trim()) {
      fetchCustomerList(); // Lấy lại danh sách đầy đủ nếu không có từ khóa tìm kiếm
    }
  }, [searchKeyword]);

  const exportExcel = () => {
    const exportData = customerList.map((customer) => ({
      ID: customer.id,
      "Tên khách hàng": customer.name,
      "Giới tính": customer.gender,
      "Số điện thoại": customer.phone,
      "Tổng tiền": customer.total,
      "Ngày đăng ký": moment(customer.registrationDate).format(
        "DD-MM-YYYY HH:mm:ss"
      ),
      "Hạng thành viên": customer.rank,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachKhachHang");
    XLSX.writeFile(workbook, "DanhSachKhachHang.xlsx");
  };

  const onOpenCreateCustomerModal = (record: any = null) => {
    if (record) {
      setEditingCustomer(record);
      form.setFieldsValue({
        ...record,
        registrationDate: moment(record.registrationDate),
      });
    } else {
      // Tạo mới => set ngày hiện tại
      form.setFieldsValue({
        registrationDate: moment(),
        total: 0,
        image: "https://via.placeholder.com/150", // Mặc định
      });
      setEditingCustomer(null);
    }
    setOpenCreateCustomerModal(true);
  };

  const onOKCreateCustomer = async () => {
    try {
      const data = await form.validateFields();
      data.registrationDate = data.registrationDate.toISOString();

      if (editingCustomer) {
        const { name, gender, address, image } = data;
        await AdminApiRequest.put(`/customer/${editingCustomer.id}`, {
          name,
          gender,
          address,
          image,
        });
        message.success("Cập nhật khách hàng thành công!");
      } else {
        await AdminApiRequest.post("/customer", {
          ...data,
          total: 0,
          image: data.image || "https://via.placeholder.com/150",
          rank: "", // Có thể bỏ qua
        });
        message.success("Thêm khách hàng thành công!");
      }

      fetchCustomerList();
      setOpenCreateCustomerModal(false);
      form.resetFields();
      setEditingCustomer(null);
    } catch (error) {
      console.error("Lỗi khi tạo/chỉnh sửa khách hàng:", error);
      message.error("Không thể lưu khách hàng. Vui lòng thử lại.");
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
      message.success("Xóa khách hàng thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa khách hàng:", error);
      message.error("Không thể xóa khách hàng. Vui lòng thử lại.");
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
              placeholder="Tìm kiếm theo id, tên hoặc địa chỉ"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearchKeyword}
              allowClear
            />
          </div>
          <div className="d-flex">
            <AdminButton
              variant="primary"
              icon={<i className="fas fa-plus"></i>}
              onClick={() => onOpenCreateCustomerModal()}
            />
            <AdminButton
              variant="primary"
              icon={<DownloadOutlined />}
              onClick={exportExcel}
              title="Tải xuống danh sách"
            />
          </div>
        </div>
      </div>

      <Modal
        className="custom-modal"
        title={editingCustomer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng"}
        open={openCreateCustomerModal}
        onOk={onOKCreateCustomer}
        onCancel={onCancelCreateCustomer}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <div className="grid-2">
            <FloatingLabelInput
              name="name"
              label="Tên khách hàng"
              component="input"
              rules={[
                { required: true, message: "Tên khách hàng là bắt buộc" },
              ]}
            />
            <FloatingLabelInput
              name="gender"
              label="Giới tính"
              component="select"
              rules={[{ required: true, message: "Giới tính là bắt buộc" }]}
              options={[
                { value: "Nam", label: "Nam" },
                { value: "Nữ", label: "Nữ" },
                { value: "Khác", label: "Khác" },
              ]}
            ></FloatingLabelInput>
          </div>

          <div className="grid-2">
            <FloatingLabelInput
              name="phone"
              label="Số điện thoại"
              component="input"
              type="text"
              rules={[{ required: true, message: "Số điện thoại là bắt buộc" }]}
              disabled={!!editingCustomer}
            />
            <FloatingLabelInput
              name="registrationDate"
              label="Ngày đăng ký"
              component="date"
              disabled
            />
          </div>

          <div className="grid-2">
            <FloatingLabelInput
              name="total"
              label="Tổng chi tiêu"
              component="input"
              type="number"
              disabled
            />
            <FloatingLabelInput
              name="address"
              label="Địa chỉ"
              component="input"
            />
          </div>

          {/*<FloatingLabelInput
                        name="image"
                        label="Ảnh đại diện (URL)"
                        component='input'
                    />*/}

          <div className="modal-footer-custom">
            <AdminButton variant="secondary" onClick={onCancelCreateCustomer}>
              Hủy
            </AdminButton>
            <AdminButton variant="primary" onClick={onOKCreateCustomer}>
              {editingCustomer ? "Lưu thay đổi" : "Tạo mới"}
            </AdminButton>
          </div>
        </Form>
      </Modal>

      <Table
        className="custom-table"
        rowKey="id"
        dataSource={customerList}
        pagination={{
          pageSize: 10, // Số lượng item trên mỗi trang
          showSizeChanger: true, // Hiển thị tùy chọn thay đổi số item trên mỗi trang
          // Các tùy chọn cho số item mỗi trang
        }}
        columns={[
          {
            title: "ID",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
          },
          {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            sorter: (a, b) => a.gender.localeCompare(b.gender),
          },
          { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
          {
            title: "Tổng chi tiêu",
            dataIndex: "total",
            key: "total",
            sorter: (a, b) => a.total - b.total,
            render: (total: number) =>
              total
                ? new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                    .format(total)
                    .replace("₫", "đ")
                : "0đ",
          },
          {
            title: "Hạng thành viên",
            dataIndex: "rank",
            key: "rank",
            sorter: (a, b) => a.rank.localeCompare(b.rank),
            render: (rank: string) => (rank ? rank : "Thường"),
          },
          {
            title: "Ngày đăng ký",
            dataIndex: "registrationDate",
            key: "registrationDate",
            sorter: (a, b) =>
              moment(a.registrationDate).unix() -
              moment(b.registrationDate).unix(),
            render: (registrationDate: string) =>
              registrationDate
                ? moment(registrationDate).format("DD-MM-YYYY HH:mm:ss")
                : "-",
          },
          {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
              <Space size="middle">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  icon={<i className="fas fa-edit"></i>}
                  onClick={() => onEditCustomer(record)}
                />
                <AdminPopConfirm
                  title="Bạn có chắc chắn muốn xóa chi nhánh này?"
                  onConfirm={() => onDeleteCustomer(record.id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <AdminButton
                    variant="destructive"
                    size="sm"
                    icon={<i className="fas fa-trash"></i>}
                  />
                </AdminPopConfirm>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ManagerCustomerList;
