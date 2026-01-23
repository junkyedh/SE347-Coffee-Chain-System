import AdminButton from "@/components/admin/AdminButton/AdminButton";
import AdminPopConfirm from "@/components/admin/PopConfirm/AdminPopConfirm";
import FloatingLabelInput from "@/components/common/FloatingInput/FloatingLabelInput";
import SearchInput from "@/components/common/SearchInput/SearchInput";
import { useToast } from "@/components/common/Toast/Toast";
import { AdminApiRequest } from "@/services/AdminApiRequest";
import { DownloadOutlined } from "@ant-design/icons";
import { Form, Modal, Space, Table, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "../adminPage.scss";

const AdminMaterialList = () => {
  const [form] = Form.useForm();
  const [materialList, setMaterialList] = useState<any[]>([]);
  const [openCreateMaterialModal, setOpenCreateMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchMaterialList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApiRequest.get("/material/list");
      setMaterialList(res.data);
    } catch (error) {
      console.error("Error fetching material list:", error);
      toast.fetchError("nguyên liệu");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMaterialList();
  }, [fetchMaterialList]);

  const exportExcel = () => {
    const exportData = materialList.map((material) => ({
      ID: material.id,
      "Tên nguyên liệu": material.name,
      Giá: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(material.price),
      "Loại bảo quản": material.storageType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNguyenLieu");
    XLSX.writeFile(workbook, "DanhSachNguyenLieu.xlsx");
  };

  const onOpenCreateMaterialModal = (record: any = null) => {
    setEditingMaterial(record);
    if (record) {
      const price = Number(record.price);
      form.setFieldsValue({
        ...record,
        price: isNaN(price) ? "" : price.toFixed(0),
      });
    }
    setOpenCreateMaterialModal(true);
  };

  const onOKCreateMaterial = async () => {
    try {
      const data = form.getFieldsValue();

      const loadingKey = "material-save";
      toast.loading(
        editingMaterial
          ? "Đang lưu thay đổi..."
          : "Đang tạo nguyên liệu mới...",
        {
          key: loadingKey,
        },
      );
      if (editingMaterial) {
        const { id, ...rest } = data;
        await AdminApiRequest.put(`/material/${editingMaterial.id}`, rest);
        toast.destroy(loadingKey);
        toast.updateSuccess("nguyên liệu");
      } else {
        await AdminApiRequest.post("/material", data);
        toast.destroy(loadingKey);
        toast.createSuccess("nguyên liệu");
      }

      fetchMaterialList();
      setOpenCreateMaterialModal(false);
      form.resetFields();
      setEditingMaterial(null);
    } catch (error) {
      console.error("Lỗi khi tạo nguyên liệu:", error);
      message.error("Không thể tạo nguyên liệu. Vui lòng thử lại.");
      toast.destroy("material-save");
      if (editingMaterial) {
        toast.updateError("nguyên liệu");
      } else {
        toast.createError("nguyên liệu");
      }
    }
  };

  const onCancelCreateMaterial = () => {
    setOpenCreateMaterialModal(false);
    form.resetFields();
  };

  const onDeleteMaterial = async (id: number) => {
    try {
      const loadingKey = "material-delete";
      toast.loading("Đang xóa nguyên liệu...", { key: loadingKey });

      await AdminApiRequest.delete(`/material/${id}`);
      toast.destroy(loadingKey);
      fetchMaterialList();
      toast.deleteSuccess("nguyên liệu");
    } catch (error) {
      console.error("Lỗi khi xóa nguyên liệu:", error);
      toast.destroy("material-delete");
      toast.deleteError("nguyên liệu");
    }
  };

  const handleSearchKeyword = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      fetchMaterialList();
      return;
    }

    const filtered = materialList.filter((material) => {
      const name = (material.name ?? "").toLowerCase();
      const storageType = (material.storageType ?? "").toLowerCase();
      return (
        name.includes(keyword) ||
        storageType.includes(keyword) ||
        String(material.id).toLowerCase().includes(keyword)
      );
    });
    setMaterialList(filtered);
  };
  useEffect(() => {
    if (!searchKeyword.trim()) {
      fetchMaterialList();
    }
  }, [searchKeyword, fetchMaterialList]);

  return (
    <div className="container-fluid">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">QUẢN LÝ NGUYÊN LIỆU</h2>
        {/* Tìm kiếm và Import + Export */}
        <div className="header-actions">
          <div className="search-form">
            <SearchInput
              placeholder="Tìm kiếm theo tên, loại bảo quản hoặc ID"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearchKeyword}
              allowClear
            />
          </div>
          <div className="d-flex">
            <AdminButton
              variant="primary"
              size="sm"
              icon={<i className="fas fa-plus"></i>}
              onClick={() => onOpenCreateMaterialModal()}
            ></AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              icon={<DownloadOutlined />}
              onClick={exportExcel}
            />
          </div>
        </div>
      </div>

      <Modal
        className="material-modal"
        title={editingMaterial ? "Chỉnh sửa" : "Thêm mới"}
        open={openCreateMaterialModal}
        onCancel={() => onCancelCreateMaterial()}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <FloatingLabelInput
            name="name"
            label="Tên nguyên liệu"
            component="input"
            rules={[{ required: true, message: "Tên nguyên liệu là bắt buộc" }]}
          />
          <div className="grid-2">
            <FloatingLabelInput
              name="price"
              label="Giá"
              component="input"
              type="number"
              rules={[{ required: true, message: "Giá là bắt buộc" }]}
            />
            <FloatingLabelInput
              name="storageType"
              label="Loại bảo quản"
              component="select"
              rules={[{ required: true, message: "Loại bảo quản là bắt buộc" }]}
              options={[
                { value: "CẤP ĐÔNG", label: "Cấp đông" },
                { value: "ĐỂ NGOÀI", label: "Để ngoài" },
              ]}
            />
          </div>
          <div className="modal-footer-custom d-flex justify-content-end align-items-center gap-3">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => onCancelCreateMaterial()}
            >
              Hủy
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={onOKCreateMaterial}
            >
              {editingMaterial ? "Lưu thay đổi" : "Tạo mới"}
            </AdminButton>
          </div>
        </Form>
      </Modal>
      <Table
        className="custom-table"
        rowKey="id"
        dataSource={materialList}
        loading={loading}
        pagination={{
          pageSize: 9,
          showSizeChanger: true,
        }}
        columns={[
          {
            title: "ID",
            dataIndex: "id",
            key: "id",
            sorter: (a, b) => a.id - b.id,
          },
          {
            title: "Tên nguyên liệu",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            sorter: (a, b) => a.price - b.price,
            render: (price: number) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(price),
          },
          {
            title: "Loại bảo quản",
            dataIndex: "storageType",
            key: "storageType",
            sorter: (a, b) => a.storageType.localeCompare(b.storageType),
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
                  onClick={() => onOpenCreateMaterialModal(record)}
                ></AdminButton>
                <AdminPopConfirm
                  title="Bạn có chắc chắn muốn xóa nguyên liệu này không?"
                  onConfirm={() => onDeleteMaterial(record.id)}
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

export default AdminMaterialList;
