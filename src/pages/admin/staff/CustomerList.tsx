import AdminButton from "@/components/admin/AdminButton/AdminButton";
import AdminPopConfirm from "@/components/admin/PopConfirm/AdminPopConfirm";
import FloatingLabelInput from "@/components/common/FloatingInput/FloatingLabelInput";
import SearchInput from "@/components/common/SearchInput/SearchInput";
import { AdminApiRequest } from "@/services/AdminApiRequest";
import { DownloadOutlined } from "@ant-design/icons";
import { Form, message, Modal, Space, Table, Tag } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "../adminPage.scss";

const CustomerList = () => {
  const [customerList, setCustomerList] = useState<any[]>([]);
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
      fetchCustomerList();
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
      fetchCustomerList();
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
        "DD-MM-YYYY HH:mm:ss",
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
      form.setFieldsValue({
        registrationDate: moment(),
        total: 0,
        image: "https://via.placeholder.com/150",
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
          rank: "",
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
        <h2 className="h2 header-custom">QUẢN LÝ KHÁCH HÀNG</h2>
        <div className="header-actions d-flex me-2 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            <Form layout="inline" className="search-form d-flex">
              <SearchInput
                placeholder="Tìm kiếm theo id, tên khách hàng hoặc SĐT"
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
              icon={<i className="fas fa-plus"></i>}
              onClick={() => onOpenCreateCustomerModal()}
              title="Thêm khách hàng mới"
            ></AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
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
          <FloatingLabelInput
            name="address"
            label="Địa chỉ"
            component="input"
          />

          <div className="modal-footer-custom">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={onCancelCreateCustomer}
            >
              Hủy
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={onOKCreateCustomer}
            >
              {editingCustomer ? "Lưu thay đổi" : "Tạo mới"}
            </AdminButton>
          </div>
        </Form>
      </Modal>

      <Table
        className="custom-table"
        rowKey="id"
        dataSource={customerList}
        // --- CẤU HÌNH RESPONSIVE ---
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        columns={[
          {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70, // Cố định chiều rộng cột ID
            align: "center",
            sorter: (a, b) => a.id - b.id,
          },
          {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            width: 180, // Đủ rộng cho tên
            fixed: "left", // Ghim cột tên bên trái
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
          },
          {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            width: 100,
            align: "center",
            sorter: (a, b) => a.gender.localeCompare(b.gender),
            render: (gender) => (
              <Tag
                color={
                  gender === "Nam"
                    ? "blue"
                    : gender === "Nữ"
                      ? "pink"
                      : "default"
                }
              >
                {gender || "Khác"}
              </Tag>
            ),
          },
          {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 140,
          },
          {
            title: "Tổng chi tiêu",
            dataIndex: "total",
            key: "total",
            width: 150,
            align: "right", // Căn phải số tiền
            sorter: (a, b) => a.total - b.total,
            render: (total: number) =>
              total ? (
                <span style={{ color: "#faad14", fontWeight: 700 }}>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })
                    .format(total)
                    .replace("₫", "đ")}
                </span>
              ) : (
                "0đ"
              ),
          },
          {
            title: "Hạng thành viên",
            dataIndex: "rank",
            key: "rank",
            width: 150,
            align: "center",
            sorter: (a, b) => a.rank.localeCompare(b.rank),
            render: (rank: string) => {
              let color = "default";
              if (rank === "Vàng") color = "gold";
              if (rank === "Bạc") color = "cyan";
              if (rank === "Kim Cương") color = "purple";
              return <Tag color={color}>{rank || "Thường"}</Tag>;
            },
          },
          {
            title: "Ngày đăng ký",
            dataIndex: "registrationDate",
            key: "registrationDate",
            width: 180,
            align: "center",
            sorter: (a, b) =>
              moment(a.registrationDate).unix() -
              moment(b.registrationDate).unix(),
            render: (registrationDate: string) =>
              registrationDate
                ? moment(registrationDate).format("DD-MM-YYYY HH:mm")
                : "-",
          },
          {
            title: "Hành động",
            key: "actions",
            width: 140, // Cố định chiều rộng cột hành động
            align: "center",
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

export default CustomerList;
