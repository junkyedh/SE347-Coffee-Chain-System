import { Form, Input, message, Modal, Space, Table, Tag } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import "../adminPage.scss";
import { AdminApiRequest } from "@/services/AdminApiRequest";
import FloatingLabelInput from "@/components/common/FloatingInput/FloatingLabelInput";
import AdminButton from "@/components/admin/AdminButton/AdminButton";
import AdminPopConfirm from "@/components/admin/PopConfirm/AdminPopConfirm";

const ManagerPromotion = () => {
  const [promoteForm] = Form.useForm();
  const [couponForm] = Form.useForm();
  const [managerPromoteList, setManagerPromoteList] = useState<any[]>([]);
  const [managerCouponList, setManagerCouponList] = useState<any[]>([]);
  const [openCreatePromoteModal, setOpenCreatePromoteModal] = useState(false);
  const [openCreateCouponModal, setOpenCreateCouponModal] = useState(false);
  const [editPromote, setEditPromote] = useState<any>(null);
  const [editCoupon, setEditCoupon] = useState<any>(null);

  const fetchManagerPromoteList = async () => {
    try {
      const res = await AdminApiRequest.get("/promote/list");
      setManagerPromoteList(res.data);
    } catch (error) {
      console.error("Error fetching promote list:", error);
      message.error("Failed to fetch promote list.");
    }
  };

  const fetchManagerCouponList = async () => {
    try {
      const res = await AdminApiRequest.get("/promote/coupon/list");
      setManagerCouponList(res.data);
    } catch (error) {
      console.error("Error fetching coupon list:", error);
      message.error("Failed to fetch coupon list.");
    }
  };

  useEffect(() => {
    fetchManagerPromoteList();
    fetchManagerCouponList();
  }, []);

  // Hàm random mã CouponCode
  const generateRandomCode = () => {
    const codes = [
      "TET",
      "FLASH",
      "SCHOOL",
      "STUDENT",
      "QK",
      "XMAS",
      "WOMEN",
      "LOVE",
      "CHILD",
      "TEACH",
      "SALE",
      "BLACK",
      "HALLO",
      "MID",
      "APRIL",
      "LABOR",
    ];
    const filteredCodes = codes.filter((code) => code.length <= 6);

    const randomIndex = Math.floor(Math.random() * filteredCodes.length);
    return filteredCodes[randomIndex];
  };

  const mappingColor = (status: string) => {
    switch (status) {
      case "Có hiệu lực":
        return "green";
      case "Hết hạn":
        return "red";
    }
  };

  const onOpenCreatePromote = (record: any = null) => {
    setEditPromote(record);
    if (record) {
      promoteForm.setFieldsValue({
        ...record,
        startAt: moment(record.startAt),
        endAt: moment(record.endAt),
      });
    } else {
      promoteForm.resetFields();
    }
    setOpenCreatePromoteModal(true);
  };

  const onOKCreatePromote = async () => {
    try {
      const data = promoteForm.getFieldsValue();
      if (data.startAt) {
        data.startAt = data.startAt.toISOString();
      } else {
        message.error("Start date is required!");
        return;
      }
      if (data.endAt) {
        data.endAt = data.endAt.toISOString();
      } else {
        message.error("End date is required!");
        return;
      }

      if (editPromote) {
        const { id, ...rest } = data;
        await AdminApiRequest.put(`/promote/${editPromote.id}`, rest);
      } else {
        await AdminApiRequest.post("/promote", data);
      }

      fetchManagerPromoteList();
      setOpenCreatePromoteModal(false);
      promoteForm.resetFields();
      message.success("Promote saved successfully!");
      setEditPromote(null);
    } catch (error) {
      console.error("Error saving promote:", error);
      message.error("Failed to save promote. Please try again.");
    }
  };

  const onCancelCreatePromote = () => {
    setOpenCreatePromoteModal(false);
    promoteForm.resetFields();
  };

  const onOpenEditPromote = (record: any) => {
    setEditPromote(record);
    promoteForm.setFieldsValue({
      ...record,
      startAt: moment(record.startAt),
      endAt: moment(record.endAt),
    });
    setOpenCreatePromoteModal(true);
  };

  const onDeletePromote = async (id: number) => {
    try {
      await AdminApiRequest.delete(`/promote/${id}`);
      fetchManagerPromoteList();
      message.success("Promote deleted successfully!");
    } catch (error) {
      console.error("Error deleting promote:", error);
      message.error("Failed to delete promote. Please try again.");
    }
  };

  //Các hàm xử lý cho Coupon
  const onOpenCreateCoupon = (record: any = null) => {
    setEditCoupon(record);
    if (record) {
      couponForm.setFieldsValue(record);
      couponForm.setFieldsValue({ promoteId: record.promote.id });
    }
    setOpenCreateCouponModal(true);
  };

  const onOKCreateCoupon = async () => {
    try {
      const data = couponForm.getFieldsValue();
      const now = moment();
      const promote = managerPromoteList.find((p) => p.id === data.promoteId);
      if (promote && moment(promote.endAt).isBefore(now)) {
        data.status = "Hết hạn";
      } else {
        data.status = "Có hiệu lực";
      }
      if (editCoupon) {
        const { id, ...rest } = data;
        await AdminApiRequest.put(`/promote/coupon/${editCoupon.id}`, rest);
      } else {
        await AdminApiRequest.post("/promote/coupon", data);
      }
      fetchManagerCouponList();
      setOpenCreateCouponModal(false);
      couponForm.resetFields();
      message.success("Coupon saved successfully!");
      setEditCoupon(null);
    } catch (error) {
      console.error("Error saving coupon:", error);
      message.error("Failed to save coupon. Please try again  ");
    }
  };

  const onCancelCreateCoupon = () => {
    setOpenCreateCouponModal(false);
    couponForm.resetFields();
  };

  const onOpenEditCoupon = (record: any) => {
    setEditCoupon(record);
    couponForm.setFieldsValue(record);
    couponForm.setFieldsValue({ promoteId: record.promote.id });
    setOpenCreateCouponModal(true);
  };

  const onDeleteCoupon = async (id: number) => {
    try {
      await AdminApiRequest.delete(`/promote/coupon/${id}`);
      fetchManagerCouponList();
      message.success("Coupon deleted successfully!");
    } catch (error) {
      console.error("Error deleting coupon:", error);
      message.error("Failed to delete coupon. Please try again.");
    }
  };

  // --- STYLE OBJECT DÙNG CHUNG ---
  // Giúp tiêu đề đẹp, font không chân, và tách nút sang 2 bên
  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // Tách tiêu đề và nút
    marginTop: "2rem",
    marginBottom: "1rem",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    paddingBottom: "0.5rem",
  };

  const titleStyle: React.CSSProperties = {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#2F4156", // Màu xanh đậm admin
    margin: 0,
    textTransform: "uppercase",
  };

  return (
    <div className="container-fluid">
      <div className="sticky-header-wrapper">
        <h2 className="header-custom">QUẢN LÝ KHUYẾN MÃI</h2>
      </div>

      {/* Modal Promote */}
      <Modal
        className="custom-modal promote-modal"
        title={editPromote ? "Chỉnh sửa" : "Thêm mới"}
        open={openCreatePromoteModal}
        onCancel={onCancelCreatePromote}
        footer={null}
      >
        <Form form={promoteForm} layout="vertical">
          <div className="grid-2">
            <FloatingLabelInput
              name="name"
              label="Tên khuyến mãi"
              component="input"
              rules={[
                { required: true, message: "Tên khuyến mãi là bắt buộc" },
              ]}
            />
            <FloatingLabelInput
              name="promoteType"
              label="Loại khuyến mãi"
              component="select"
              rules={[
                { required: true, message: "Loại khuyến mãi là bắt buộc" },
              ]}
              options={[
                { value: "Phần trăm", label: "Phần trăm" },
                { value: "Cố định", label: "Cố định" },
              ]}
            />
          </div>
          <div className="grid-2">
            <FloatingLabelInput
              name="description"
              label="Mô tả"
              component="input"
              type="textarea"
              rules={[{ required: true, message: "Mô tả là bắt buộc" }]}
            />
            <FloatingLabelInput
              name="discount"
              label="Giảm giá"
              component="input"
              type="number"
              rules={[{ required: true, message: "Giảm giá là bắt buộc" }]}
            />
          </div>
          <div className="grid-2">
            <FloatingLabelInput
              name="startAt"
              label="Ngày bắt đầu"
              component="date"
              rules={[{ required: true, message: "Ngày bắt đầu là bắt buộc" }]}
            />
            <FloatingLabelInput
              name="endAt"
              label="Ngày kết thúc"
              component="date"
              rules={[{ required: true, message: "Ngày kết thúc là bắt buộc" }]}
            />
          </div>
          <div className="modal-footer-custom d-flex justify-content-end align-items-center gap-3">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={onCancelCreatePromote}
            >
              Hủy
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={onOKCreatePromote}
            >
              {editPromote ? "Lưu thay đổi" : "Tạo mới"}
            </AdminButton>
          </div>
        </Form>
      </Modal>

      {/* Modal Coupon */}
      <Modal
        className="custom-modal coupon-modal"
        title={editCoupon ? "Chỉnh sửa" : "Thêm mới"}
        open={openCreateCouponModal}
        onCancel={() => onCancelCreateCoupon()}
        footer={null}
      >
        <Form form={couponForm} layout="vertical">
          <FloatingLabelInput
            name="promoteId"
            label="Chọn khuyến mãi"
            component="select"
            rules={[{ required: true, message: "Khuyến mãi là bắt buộc" }]}
            options={managerPromoteList.map((promote) => ({
              value: promote.id,
              label: promote.name,
            }))}
          />
          <div className="field-row mt-4">
            <Form.Item
              name="code"
              label="Mã Code"
              rules={[{ required: true, message: "Mã Code là bắt buộc" }]}
            >
              <Input
                addonAfter={
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    className="random-button"
                    onClick={() => {
                      const randomCode = generateRandomCode();
                      couponForm.setFieldsValue({ code: randomCode });
                    }}
                  >
                    Random
                  </AdminButton>
                }
              />
            </Form.Item>
          </div>
          <div className="modal-footer-custom d-flex justify-content-end align-items-center gap-3">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={onCancelCreateCoupon}
            >
              Hủy
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={onOKCreateCoupon}>
              {editPromote ? "Lưu thay đổi" : "Tạo mới"}
            </AdminButton>
          </div>
        </Form>
      </Modal>

      {/* --- PHẦN CHỈNH SỬA: DANH SÁCH KHUYẾN MÃI --- */}
      <div style={headerStyle}>
        <h4 style={titleStyle}>Danh sách Khuyến mãi</h4>
        <div className="d-flex">
          <AdminButton
            variant="primary"
            size="sm"
            icon={<i className="fas fa-plus"></i>}
            onClick={() => onOpenCreatePromote()}
          />
        </div>
      </div>

      <Table
        className="custom-table"
        dataSource={managerPromoteList}
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
        }}
        columns={[
          { title: "ID", dataIndex: "id", key: "id" },
          { title: "Tên khuyến mãi", dataIndex: "name", key: "name" },
          { title: "Mô tả", dataIndex: "description", key: "description" },
          {
            title: "Giảm giá",
            dataIndex: "discount",
            key: "discount",
            render: (discount: number, record) => {
              return record.promoteType === "Phần trăm"
                ? `${Math.round(discount)}%`
                : new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(discount));
            },
          },
          { title: "Loại", dataIndex: "promoteType", key: "promoteType" },
          {
            title: "Ngày bắt đầu",
            dataIndex: "startAt",
            key: "startAt",
            render: (startAt: string) =>
              moment(startAt).format("YYYY-MM-DD HH:mm:ss"),
          },
          {
            title: "Ngày kết thúc",
            dataIndex: "endAt",
            key: "endAt",
            render: (endAt: string) =>
              moment(endAt).format("YYYY-MM-DD HH:mm:ss"),
          },
          {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_: any, record: any) => (
              <div className="d-flex align-items-center justify-content-center gap-2">
                <Space size="middle">
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    icon={<i className="fas fa-edit"></i>}
                    onClick={() => onOpenEditPromote(record)}
                  ></AdminButton>
                  <AdminPopConfirm
                    title="Bạn có chắc chắn muốn xóa khuyến mãi này?"
                    onConfirm={() => onDeletePromote(record.id)}
                    okText="Đồng ý"
                    cancelText="Hủy"
                  >
                    <AdminButton
                      variant="destructive"
                      size="sm"
                      icon={<i className="fas fa-trash-alt"></i>}
                    ></AdminButton>
                  </AdminPopConfirm>
                </Space>
              </div>
            ),
          },
        ]}
      />

      {/* --- PHẦN CHỈNH SỬA: DANH SÁCH COUPON --- */}
      <div style={headerStyle}>
        <h4 style={titleStyle}>Danh sách Coupon</h4>
        <div className="d-flex">
          <AdminButton
            variant="primary"
            size="sm"
            icon={<i className="fas fa-plus"></i>}
            onClick={() => onOpenCreateCoupon()}
          />
        </div>
      </div>

      <Table
        className="custom-table"
        rowKey="id"
        dataSource={managerCouponList}
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
        }}
        columns={[
          { title: "ID", dataIndex: "id", key: "id" },
          {
            title: "Tên khuyến mãi",
            dataIndex: "promote",
            key: "promote",
            render: (promote) => promote?.name || "N/A",
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
              return <Tag color={mappingColor(status)}>{status}</Tag>;
            },
          },
          { title: "Mã Code", dataIndex: "code", key: "code" },
          {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_: any, record: any) => (
              <div className="d-flex align-items-center gap-2 justify-content-center">
                <Space size="middle">
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    icon={<i className="fas fa-edit"></i>}
                    onClick={() => onOpenEditCoupon(record)}
                  ></AdminButton>
                  <AdminPopConfirm
                    title="Bạn có chắc chắn muốn xóa coupon này?"
                    onConfirm={() => onDeleteCoupon(record.id)}
                    okText="Đồng ý"
                    cancelText="Hủy"
                  >
                    <AdminButton
                      variant="destructive"
                      size="sm"
                      icon={<i className="fas fa-trash-alt"></i>}
                    ></AdminButton>
                  </AdminPopConfirm>
                </Space>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ManagerPromotion;
