import AdminButton from "@/components/admin/AdminButton/AdminButton";
import AdminPopConfirm from "@/components/admin/PopConfirm/AdminPopConfirm";
import FloatingLabelInput from "@/components/common/FloatingInput/FloatingLabelInput";
import SearchInput from "@/components/common/SearchInput/SearchInput";
import { useToast } from "@/components/common/Toast/Toast";
import { AdminApiRequest } from "@/services/AdminApiRequest";
import { Form, message, Modal, Space, Table, Tooltip } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import "../adminPage.scss";

const AdminBranchList = () => {
  const [branchForm] = Form.useForm();
  const [adminBranchList, setAdminBranchList] = useState<any[]>([]);
  const [openCreateBranchModal, setOpenCreateBranchModal] = useState(false);
  const [editBranch, setEditBranch] = useState<any>(null);
  const [managerList, setManagerList] = useState<any[]>([]);
  const { success } = useToast();

  const fetchAdminBranchList = async () => {
    try {
      const res = await AdminApiRequest.get("/branch/list");
      setAdminBranchList(res.data);
    } catch (error) {
      console.error("Error fetching branch list:", error);
      message.error("Tải chi nhánh thất bại.");
    }
  };

  useEffect(() => {
    fetchAdminBranchList();
  }, []);

  const onOpenCreateBranchModal = (record: any = null) => {
    setEditBranch(record);
    if (record) {
      branchForm.setFieldsValue({
        ...record,
        createAt: moment(record.createAt),
      });
    } else {
      branchForm.resetFields();
    }
    setOpenCreateBranchModal(true);
  };

  const onOKCreateBranch = async () => {
    try {
      const data = branchForm.getFieldsValue();
      if (data.createAt) {
        data.createAt = data.createAt.toISOString();
      } else {
        message.error("Ngày tạo là trường bắt buộc!");
        return;
      }

      if (editBranch) {
        const { id, ...rest } = data;
        await AdminApiRequest.put(`/branch/${editBranch.id}`, rest);
      } else {
        await AdminApiRequest.post("/branch", data);
        const createdBranch = await AdminApiRequest.get("/branch/list");
        const newBranchId =
          createdBranch?.data?.[createdBranch.data.length - 1]?.id;
        await AdminApiRequest.put(`/staff/staffbranch/${data.managerId}`, {
          branchId: newBranchId,
        });
      }

      fetchAdminBranchList();
      setOpenCreateBranchModal(false);
      branchForm.resetFields();
      message.success("Branch saved successfully!");
      success("Chi nhánh đã được lưu thành công!");
      setEditBranch(null);
    } catch (error) {
      console.error("Error saving branch:", error);
      message.error("Lưu thất bại, thử lại sau.");
    }
  };

  const onCancelCreateBranch = () => {
    setOpenCreateBranchModal(false);
    branchForm.resetFields();
  };

  const onOpenEditBranch = (record: any) => {
    setEditBranch(record);
    branchForm.setFieldsValue({
      ...record,
      createAt: moment(record.createAt),
      managerId: record.manager?.id || null,
    });
    setOpenCreateBranchModal(true);
  };

  const onDeleteBranch = async (id: number) => {
    try {
      await AdminApiRequest.delete(`/branch/${id}`);
      fetchAdminBranchList();
      message.success("Xóa chi nhánh thành công!");
    } catch (error) {
      console.error("Error deleting branch:", error);
      message.error("Xóa chi nhánh thất bại, thử lại sau.");
    }
  };

  const [searchKeyword, setSearchKeyword] = useState("");
  const handleSearchKeyword = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      fetchAdminBranchList();
      return;
    }
    const filtered = adminBranchList.filter((branch) => {
      const name = (branch.name || "").toLowerCase();
      const address = (branch.address || "").toLowerCase();
      return name.includes(keyword) || address.includes(keyword);
    });
    setAdminBranchList(filtered);
  };

  useEffect(() => {
    if (!searchKeyword.trim()) {
      fetchAdminBranchList();
    }
  }, [searchKeyword]);

  const fetchManagerList = async () => {
    try {
      const res = await AdminApiRequest.get("/staff/list?role=ADMIN_BRAND");
      setManagerList(res.data);
    } catch (error) {
      console.error("Error fetching manager list:", error);
      message.error("Không thể lấy danh sách quản lý.");
    }
  };

  useEffect(() => {
    fetchManagerList();
  }, []);

  return (
    <div className="container-fluid">
      <div className="sticky-header-wrapper">
        <h2 className="header-custom">QUẢN LÝ CHI NHÁNH</h2>
        <div className="header-actions">
          <div className="search-form">
            <SearchInput
              placeholder="Tìm kiếm theo id, tên chi nhánh hoặc địa chỉ"
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
              onClick={() => onOpenCreateBranchModal()}
            />
          </div>
        </div>
      </div>

      <Modal
        className="custom-modal"
        title={editBranch ? "Chỉnh sửa" : "Thêm mới"}
        open={openCreateBranchModal}
        onCancel={onCancelCreateBranch}
        footer={null}
      >
        <Form form={branchForm} layout="vertical">
          <FloatingLabelInput
            name="name"
            label="Tên chi nhánh"
            component="input"
            rules={[{ required: true, message: "Tên chi nhánh là bắt buộc" }]}
          />
          <FloatingLabelInput
            name="address"
            label="Địa chỉ"
            component="input"
            type="textarea"
            rules={[{ required: true, message: "Địa chỉ là bắt buộc" }]}
          />
          <FloatingLabelInput
            name="phone"
            label="Số điện thoại"
            component="input"
            type="number"
            rules={[{ required: true, message: "Số điện thoại là bắt buộc" }]}
          />
          <FloatingLabelInput
            name="createAt"
            label="Ngày tạo"
            component="date"
            rules={[{ required: true, message: "Ngày tạo là bắt buộc" }]}
          />
          <FloatingLabelInput
            name="managerId"
            label="Người quản lý"
            component="select"
            rules={[{ required: true, message: "Vui lòng chọn người quản lý" }]}
            options={managerList.map((manager) => ({
              label: `${manager.name} - ${manager.phone}`,
              value: manager.id,
            }))}
            componentProps={{
              showSearch: true,
              allowClear: true,
              optionFilterProp: "children",
              filterOption: (input: string, option: any) =>
                option.label.toLowerCase().includes(input.toLowerCase()),
            }}
          />

          <div className="modal-footer-custom">
            <AdminButton variant="secondary" onClick={onCancelCreateBranch}>
              Hủy
            </AdminButton>
            <AdminButton variant="primary" onClick={onOKCreateBranch}>
              {editBranch ? "Lưu thay đổi" : "Tạo mới"}
            </AdminButton>
          </div>
        </Form>
      </Modal>

      <Table
        className="custom-table"
        rowKey="id"
        dataSource={adminBranchList}
        // --- KÍCH HOẠT CUỘN NGANG ---
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: 8,
          showSizeChanger: true,
        }}
        columns={[
          {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70, // Cố định chiều rộng cột ID nhỏ
            align: "center",
            sorter: (a, b) => a.id - b.id,
          },
          {
            title: "Tên chi nhánh",
            dataIndex: "name",
            key: "name",
            width: 200, // Đủ rộng cho tên
            fixed: "left", // Ghim cột tên bên trái khi cuộn
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
          },
          {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 140,
          },
          {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            width: 250, // Địa chỉ cần rộng hơn
            render: (text) => (
              <Tooltip title={text}>
                <div
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "250px",
                  }}
                >
                  {text}
                </div>
              </Tooltip>
            ),
          },
          {
            title: "Ngày tạo",
            dataIndex: "createAt",
            width: 160,
            align: "center",
            render: (value: string) =>
              moment(value).format("YYYY-MM-DD HH:mm:ss"),
          },
          {
            title: "Người quản lý",
            dataIndex: "manager",
            key: "manager",
            width: 180,
            render: (manager: any) => (
              <span style={{ fontWeight: 500 }}>{manager?.name || "---"}</span>
            ),
          },
          {
            title: "Hành động",
            key: "actions",
            width: 120, // Cố định chiều rộng cột hành động
            align: "center",
            render: (text, record) => (
              <Space size="middle">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  icon={<i className="fas fa-edit"></i>}
                  onClick={() => onOpenEditBranch(record)}
                />
                <AdminPopConfirm
                  title="Bạn có chắc chắn muốn xóa chi nhánh này?"
                  onConfirm={() => onDeleteBranch(record.id)}
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

export default AdminBranchList;
