import FloatingLabelInput from "@/components/common/FloatingInput/FloatingLabelInput";
import { AdminApiRequest } from "@/services/AdminApiRequest";
import { Button, Card, Descriptions, Form, message, Modal } from "antd";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { useEffect, useState } from "react";
import "./StaffProfile.scss";

interface TokenPayload {
  id?: number;
  phone?: string;
  role?: string;
  branchId?: number;
  type?: "staff" | "customer";
}

const token = localStorage.getItem("token");
const decoded: TokenPayload | null = token ? jwtDecode(token) : null;
const staffId = decoded?.id;

const StaffProfile = () => {
  const [form] = Form.useForm();
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [branchName, setBranchName] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      const res = await AdminApiRequest.get(`/staff/${staffId}`);
      const staffData = res.data;
      setStaff(staffData);

      if (staffData.branchId) {
        const branchRes = await AdminApiRequest.get(
          `/branch/${staffData.branchId}`,
        );
        setBranchName(branchRes.data.name);
      }
    } catch (err) {
      message.error("Không thể tải thông tin nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    form.setFieldsValue({
      ...staff,
      birth: moment(staff.birth),
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        birth: moment(values.birth).format("YYYY-MM-DD"),
      };

      await AdminApiRequest.put(`/staff/${staffId}`, data);
      message.success("Cập nhật thành công!");
      setEditModalVisible(false);
      fetchStaff();
    } catch (err) {
      message.error("Lỗi khi cập nhật thông tin.");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div className="container-fluid m-3">
      <h3 className="h3 mb-4">Hồ sơ nhân viên</h3>

      {staff && (
        <Card bordered>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Họ tên">{staff.name}</Descriptions.Item>
            <Descriptions.Item label="SĐT">{staff.phone}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {staff.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {moment(staff.birth).format("DD-MM-YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {staff.address}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Loại nhân viên">{staff.typeStaff}</Descriptions.Item> */}
            <Descriptions.Item label="Ngày bắt đầu">
              {moment(staff.startDate).format("DD-MM-YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Chi nhánh">
              {branchName || "Không xác định"}
            </Descriptions.Item>
          </Descriptions>

          <div className="text-end mt-3">
            <Button type="primary" onClick={openEditModal}>
              Chỉnh sửa
            </Button>
          </div>
        </Card>
      )}

      <Modal
        title="Chỉnh sửa thông tin"
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => setEditModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <FloatingLabelInput
            name="name"
            label="Họ tên"
            component="input"
            rules={[{ required: true }]}
          />
          <FloatingLabelInput
            name="gender"
            label="Giới tính"
            component="select"
            rules={[{ required: true }]}
            options={[
              { value: "Nam", label: "Nam" },
              { value: "Nữ", label: "Nữ" },
              { value: "Khác", label: "Khác" },
            ]}
          />
          <FloatingLabelInput
            name="birth"
            label="Ngày sinh"
            component="date"
            rules={[{ required: true }]}
          />
          <FloatingLabelInput
            name="phone"
            label="Số điện thoại"
            component="input"
            rules={[{ required: true }]}
          />
          <FloatingLabelInput
            name="address"
            label="Địa chỉ"
            component="input"
            rules={[{ required: true }]}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default StaffProfile;
