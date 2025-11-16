import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, message, Button, Modal, Form, Input, Tag } from 'antd';
import moment from 'moment';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import { useSystemContext } from '@/hooks/useSystemContext';
import '../admin/adminPage.scss';

const ManagerBranchInfo = () => {
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { branchId } = useSystemContext();

  const fetchBranchInfo = async () => {
    if (!branchId) return;

    setLoading(true);
    try {
      const res = await AdminApiRequest.get(`/branch/${branchId}`);
      setBranch(res.data);
    } catch (error) {
      console.error('Lỗi khi tải chi nhánh:', error);
      message.error('Không thể tải thông tin chi nhánh.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    form.setFieldsValue({
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
    });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await AdminApiRequest.put(`/branch/${branchId}`, values);
      message.success('Cập nhật chi nhánh thành công!');
      setEditModalVisible(false);
      fetchBranchInfo();
    } catch (error) {
      console.error('Lỗi khi cập nhật chi nhánh:', error);
      message.error('Không thể cập nhật chi nhánh.');
    }
  };

  useEffect(() => {
    fetchBranchInfo();
  }, [branchId]);

  return (
    <div className="container-fluid">
      <h3 className="h3 mb-4" >
        Thông tin Chi nhánh
      </h3>

      {loading ? (
        <Spin size="large" />
      ) : branch ? (
        <>
          <Card
            bordered
            style={{ borderColor: '#1677ff', borderRadius: 8 }}
            headStyle={{ backgroundColor: '#e6f4ff' }}
            extra={
              <Button type="primary" onClick={handleEdit}>
                Chỉnh sửa
              </Button>
            }
          >
            <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: 600, backgroundColor: '#fafafa' }}>
              <Descriptions.Item label="Tên chi nhánh">
                <Tag color="geekblue" style={{ fontSize: 16 }}>{branch.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                <span style={{ color: '#333' }}>{branch.address}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <span style={{ color: '#1677ff', fontWeight: 500 }}>{branch.phone}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {moment(branch.createdAt).format('DD-MM-YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Quản lý chi nhánh">
                {branch.manager ? (
                  <Tag color="blue-inverse">{branch.manager.name} ({branch.manager.phone})</Tag>
                ) : (
                  <Tag color="red-inverse">Chưa có quản lý</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Modal
            title="🛠 Chỉnh sửa chi nhánh"
            open={editModalVisible}
            onOk={handleSave}
            onCancel={() => setEditModalVisible(false)}
            okText="Lưu"
            cancelText="Hủy"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="Tên chi nhánh"
                rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input />
              </Form.Item>
            </Form>
          </Modal>
        </>
      ) : (
        <p>Không tìm thấy thông tin chi nhánh.</p>
      )}
    </div>
  );
};

export default ManagerBranchInfo;
