import AdminButton from "@/components/admin/AdminButton/AdminButton";
import AdminPopConfirm from "@/components/admin/PopConfirm/AdminPopConfirm";
import FloatingLabelInput from "@/components/common/FloatingInput/FloatingLabelInput";
import SearchInput from "@/components/common/SearchInput/SearchInput";
import { AdminApiRequest } from "@/services/AdminApiRequest";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Form, message, Modal, Space, Table, Upload } from "antd";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "../adminPage.scss";

const AdminStaffList = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffForm] = Form.useForm();
  const [branchList, setBranchList] = useState<any[]>([]);

  const [typeStaffOptions, setTypeStaffOptions] = useState<
    { value: string; label: string }[]
  >([
    { value: "Quản lý", label: "Quản lý" },
    { value: "Nhân viên pha chế", label: "Nhân viên pha chế" },
    { value: "Nhân viên phục vụ", label: "Nhân viên phục vụ" },
    { value: "Nhân viên thu ngân", label: "Nhân viên thu ngân" },
    { value: "Nhân viên bảo vệ", label: "Nhân viên bảo vệ" },
    { value: "Nhân viên giao hàng", label: "Nhân viên giao hàng" },
    { value: "Nhân viên kế toán", label: "Nhân viên kế toán" },
    { value: "Nhân viên marketing", label: "Nhân viên marketing" },
    { value: "Nhân viên bán hàng", label: "Nhân viên bán hàng" },
    { value: "Nhân viên kho", label: "Nhân viên kho" },
  ]);

  const handleRoleChange = (value: string) => {
    if (value === "ADMIN_SYSTEM") {
      setTypeStaffOptions([{ value: "ADMIN_SYSTEM", label: "Chủ cửa hàng" }]);
      staffForm.setFieldValue("typeStaff", "Chủ cửa hàng");
      staffForm.setFieldValue("branchId", null);
    } else if (value === "ADMIN_BRAND") {
      setTypeStaffOptions([
        { value: "ADMIN_BRAND", label: "Quản lý chi nhánh" },
      ]);
      staffForm.setFieldValue("typeStaff", "Quản lý chi nhánh");
    } else {
      setTypeStaffOptions([
        { value: "Nhân viên pha chế", label: "Nhân viên pha chế" },
        { value: "Nhân viên phục vụ", label: "Nhân viên phục vụ" },
        { value: "Nhân viên thu ngân", label: "Nhân viên thu ngân" },
        { value: "Nhân viên bảo vệ", label: "Nhân viên bảo vệ" },
        { value: "Nhân viên giao hàng", label: "Nhân viên giao hàng" },
        { value: "Nhân viên kế toán", label: "Nhân viên kế toán" },
        { value: "Nhân viên marketing", label: "Nhân viên marketing" },
        { value: "Nhân viên bán hàng", label: "Nhân viên bán hàng" },
        { value: "Nhân viên kho", label: "Nhân viên kho" },
      ]);
      staffForm.setFieldValue("typeStaff", undefined);
    }
  };

  const fetchStaffList = useCallback(async () => {
    try {
      const res = await AdminApiRequest.get("/staff/list");
      const staffWithBranch = res.data.map((staff: any) => ({
        ...staff,
        branch:
          branchList.find(
            (b: any) => Number(b.id) === Number(staff.branchId),
          ) || null,
      }));
      setStaffList(staffWithBranch);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      message.error("Lấy danh sách nhân viên không thành công.");
    }
  }, [branchList]);

  const fetchBranchList = useCallback(async () => {
    try {
      const res = await AdminApiRequest.get("/branch/list");
      setBranchList(res.data);
    } catch (error) {
      console.error("Error fetching branch list:", error);
    }
  }, []);

  useEffect(() => {
    fetchBranchList();
    fetchStaffList();
  }, [fetchBranchList, fetchStaffList, branchList]);

  const handleSearchKeyword = () => {
    if (!searchKeyword.trim()) {
      fetchStaffList();
      return;
    }
    const keyword = searchKeyword.toLowerCase();
    const filtered = staffList.filter(
      (staff) =>
        staff.name.toLowerCase().includes(keyword) ||
        staff.typeStaff.toLowerCase().includes(keyword) ||
        staff.phone.toLowerCase().includes(keyword),
    );
    setStaffList(filtered);
  };

  const handleImportExcel = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      message.success(
        "Import thành công (chỉ hiển thị, không lưu vào hệ thống).",
      );
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const exportExcel = () => {
    const exportData = staffList.map((staff) => ({
      ID: staff.id,
      "Tên nhân viên": staff.name,
      "Giới tính": staff.gender,
      "Ngày sinh": moment(staff.birth).format("DD-MM-YYYY"),
      "Số điện thoại": staff.phone,
      "Loại nhân viên": staff.typeStaff,
      "Địa chỉ": staff.address,
      "Giờ làm việc": staff.workHours,
      Lương: staff.salary,
      "Ngày bắt đầu": moment(staff.startDate).format("DD-MM-YYYY HH:mm:ss"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNhanVien");
    XLSX.writeFile(workbook, "DanhSachNhanVien.xlsx");
  };

  const onOpenStaffModal = (record: any = null) => {
    setEditingStaff(record);
    if (record) {
      staffForm.setFieldsValue({
        ...record,
        birth: moment(record.birth),
        startDate: moment(record.startDate),
      });
    } else {
      staffForm.resetFields();
    }
    setOpenModal(true);
  };

  const onSubmitStaff = async () => {
    try {
      const values = staffForm.getFieldsValue();
      values.birth = values.birth.toISOString();
      values.startDate = values.startDate.toISOString();
      values.role = "ADMIN_SYSTEM";

      if (editingStaff) {
        await AdminApiRequest.put(`/staff/${editingStaff.id}`, values);
        message.success("Cập nhật nhân viên thành công!");
      } else {
        await AdminApiRequest.post("/staff", values);
        message.success("Thêm nhân viên thành công!");
      }

      setOpenModal(false);
      staffForm.resetFields();
      fetchStaffList();
    } catch (error) {
      console.error(error);
      message.error("Lưu nhân viên thất bại!");
    }
  };

  const onDeleteStaff = async (id: number) => {
    try {
      await AdminApiRequest.delete(`/staff/${id}`);
      fetchStaffList();
      message.success("Xóa nhân viên thành công!");
    } catch (error) {
      console.error("Error deleting staff:", error);
      message.error("Xóa nhân viên thất bại, thử  lại sau.");
    }
  };

  return (
    <div className="container-fluid">
      <div className="sticky-header-wrapper">
        <h2 className="header-custom">DANH SÁCH NHÂN VIÊN</h2>
        {/* Tìm kiếm và Import + Export */}
        <div className="header-actions">
          <div className="search-form">
            <SearchInput
              placeholder="Tìm kiếm theo tên, loại nhân viên hoặc SĐT"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearchKeyword}
              allowClear
            />
          </div>
          <div className="d-flex">
            <Upload
              beforeUpload={handleImportExcel}
              showUploadList={false}
              accept=".xlsx, .xls"
            >
              <AdminButton
                variant="primary"
                size="sm"
                icon={<UploadOutlined />}
              />
            </Upload>
            <AdminButton
              variant="primary"
              size="sm"
              icon={<DownloadOutlined />}
              onClick={exportExcel}
            />
            <AdminButton
              variant="primary"
              size="sm"
              icon={<i className="fas fa-plus"></i>}
              onClick={() => onOpenStaffModal()}
            ></AdminButton>
          </div>
        </div>
      </div>

      <Modal
        className="custom-modal"
        open={openModal}
        title={editingStaff ? "Chỉnh sửa nhân viên" : "Thêm mới nhân viên"}
        onCancel={() => {
          setOpenModal(false);
          staffForm.resetFields();
        }}
        footer={null}
      >
        <Form form={staffForm} layout="vertical">
          <div className="grid-2">
            <FloatingLabelInput
              name="name"
              label="Tên nhân viên"
              component="input"
              rules={[{ required: true, message: "Tên nhân viên là bắt buộc" }]}
            />
            <FloatingLabelInput
              name="gender"
              label="Giới tính"
              component="select"
              options={[
                { value: "Nam", label: "Nam" },
                { value: "Nữ", label: "Nữ" },
                { value: "Khác", label: "Khác" },
              ]}
              rules={[{ required: true, message: "Giới tính là bắt buộc" }]}
            />
          </div>
          <div className="grid-2">
            <FloatingLabelInput
              name="birth"
              label="Ngày sinh"
              component="date"
              rules={[{ required: true, message: "Ngày sinh là bắt buộc" }]}
            />
            <FloatingLabelInput
              name="phone"
              label="Số điện thoại"
              component="input"
              rules={[{ required: true, message: "Số điện thoại là bắt buộc" }]}
            />
          </div>
          <FloatingLabelInput
            name="address"
            label="Địa chỉ"
            component="input"
            rules={[{ required: true, message: "Địa chỉ là bắt buộc" }]}
          />
          <div className="grid-2">
            <FloatingLabelInput
              name="branchId"
              label="Chi nhánh"
              component="select"
              options={branchList.map((branch) => ({
                value: branch.id,
                label: branch.name,
              }))}
              rules={[{ required: true, message: "Chi nhánh là bắt buộc" }]}
            />
            <FloatingLabelInput
              name="startDate"
              label="Ngày bắt đầu"
              component="date"
              rules={[{ required: true, message: "Ngày bắt đầu là bắt buộc" }]}
            />
          </div>
          <div className="grid-2">
            <FloatingLabelInput
              name="role"
              label="Phân quyền"
              component="select"
              options={[
                { value: "ADMIN_SYSTEM", label: "Quản trị hệ thống" },
                { value: "ADMIN_BRAND", label: "Quản trị chi nhánh" },
                { value: "STAFF", label: "Nhân viên" },
              ]}
              rules={[{ required: true, message: "Phân quyền là bắt buộc" }]}
              onChange={handleRoleChange}
            />
            <FloatingLabelInput
              name="typeStaff"
              label="Loại nhân viên"
              component="select"
              rules={[
                { required: true, message: "Loại nhân viên là bắt buộc" },
              ]}
              options={typeStaffOptions}
            />
          </div>
          <div className="grid-2">
            <FloatingLabelInput
              name="salary"
              label="Lương"
              component="input"
              type="number"
              rules={[{ required: true, message: "Lương là bắt buộc" }]}
            />
            <FloatingLabelInput
              name="minsalary"
              label="Lương tối thiểu"
              component="input"
              type="number"
              rules={[
                { required: true, message: "Lương tối thiểu là bắt buộc" },
              ]}
            />
          </div>

          <div className="modal-footer-custom">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => setOpenModal(false)}
            >
              Hủy
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={onSubmitStaff}>
              {editingStaff ? "Cập nhật" : "Tạo mới"}
            </AdminButton>
          </div>
        </Form>
      </Modal>

      <Table
        className="custom-table"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        dataSource={staffList}
        rowKey="id"
        rowClassName={(_, index) =>
          index % 2 === 0 ? "table-row-even" : "table-row-odd"
        }
        columns={[
          {
            title: "ID",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
          },
          {
            title: "Tên nhân viên",
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
          {
            title: "Ngày sinh",
            dataIndex: "birth",
            key: "birth",
            sorter: (a, b) => moment(a.birth).unix() - moment(b.birth).unix(),
            render: (birth: string) =>
              birth ? moment(birth).format("DD-MM-YYYY") : "-",
          },
          {
            title: "Loại nhân viên",
            dataIndex: "typeStaff",
            key: "typeStaff",
            sorter: (a, b) => a.typeStaff.localeCompare(b.typeStaff),
          },
          { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
          {
            title: "Chi nhánh làm việc",
            dataIndex: "branch",
            key: "branch",
            render: (branch: any) => (branch ? branch.name : "---"),
          },
          {
            title: "Giờ làm việc",
            dataIndex: "workHours",
            key: "workHours",
            sorter: (a, b) => a.workHours - b.workHours,
            render: (value: number) => `${value} giờ`,
          },
          {
            title: "Lương",
            dataIndex: "salary",
            key: "salary",
            sorter: (a, b) => a.salary - b.salary,
            render: (value: number) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(value),
          },
          {
            title: "Ngày bắt đầu",
            dataIndex: "startDate",
            key: "startDate",
            sorter: (a, b) =>
              moment(a.startDate).unix() - moment(b.startDate).unix(),
            render: (value: string) =>
              value ? moment(value).format("DD-MM-YYYY HH:mm:ss") : "-",
          },
          {
            title: "Hành động",
            key: "actions",
            render: (text, record) => (
              <Space size="middle">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  icon={<i className="fas fa-edit"></i>}
                  onClick={() => onOpenStaffModal(record)}
                ></AdminButton>
                <AdminPopConfirm
                  title="Bạn có chắc chắn muốn xóa nhân viên này?"
                  onConfirm={() => onDeleteStaff(record.id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
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

export default AdminStaffList;
