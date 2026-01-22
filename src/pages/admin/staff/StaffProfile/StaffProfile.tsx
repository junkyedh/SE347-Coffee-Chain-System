import FloatingLabelInput from "@/components/common/FloatingInput/FloatingLabelInput";
import { AdminApiRequest } from "@/services/AdminApiRequest";
import { Button, Card, Descriptions, Form, Modal, Spin } from "antd";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSystemContext } from "@/hooks/useSystemContext";
import "./StaffProfile.scss";

interface TokenPayload {
  id?: number;
  phone?: string;
  role?: string;
  branchId?: number;
  type?: "staff" | "customer";
}

const StaffProfile = () => {
  const [form] = Form.useForm();
  const { userInfo, token, isInitialized } = useSystemContext();

  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [branchName, setBranchName] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const staffId = useMemo(() => {
    if (userInfo?.id) return userInfo.id;

    if (!token) return undefined;
    try {
      const decoded: TokenPayload = jwtDecode(token);
      return decoded?.id;
    } catch {
      return undefined;
    }
  }, [userInfo?.id, token]);

  const fetchStaff = useCallback(async () => {
    if (!staffId) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await AdminApiRequest.get(`/staff/${staffId}`, {
        signal: controller.signal,
      });

      const staffData = res.data;
      setStaff(staffData);

      if (staffData?.branchId) {
        const branchRes = await AdminApiRequest.get(`/branch/${staffData.branchId}`, {
          signal: controller.signal,
        });
        setBranchName(branchRes.data?.name ?? null);
      } else {
        setBranchName(null);
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.name === "CanceledError") return;

      setStaff(null);
      setBranchName(null);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    if (!isInitialized) return;

    // Nếu chưa có staffId (token/userInfo chưa kịp hydrate) -> đợi, KHÔNG gọi API
    if (!staffId) {
      setLoading(false);
      return;
    }

    fetchStaff();

    return () => {
      abortRef.current?.abort();
    };
  }, [isInitialized, staffId, fetchStaff]);

  const openEditModal = () => {
    if (!staff) return;

    form.setFieldsValue({
      ...staff,
      birth: staff.birth ? moment(staff.birth) : null,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!staffId) return;

    setSaving(true);
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        birth: values.birth ? moment(values.birth).format("YYYY-MM-DD") : null,
      };

      await AdminApiRequest.put(`/staff/${staffId}`, data);

      setEditModalVisible(false);
      await fetchStaff();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized) return null;

  if (loading) {
    return (
      <div className="container-fluid m-3">
        <h3 className="h3 mb-4">Hồ sơ nhân viên</h3>
        <Spin />
      </div>
    );
  }

  return (
    <div className="container-fluid m-3">
      <h3 className="h3 mb-4">Hồ sơ nhân viên</h3>

      {staff && (
        <Card bordered>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Họ tên">{staff.name}</Descriptions.Item>
            <Descriptions.Item label="SĐT">{staff.phone}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">{staff.gender}</Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {staff.birth ? moment(staff.birth).format("DD-MM-YYYY") : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{staff.address}</Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {staff.startDate ? moment(staff.startDate).format("DD-MM-YYYY") : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Chi nhánh">{branchName || "Không xác định"}</Descriptions.Item>
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
        confirmLoading={saving}
        destroyOnClose
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
