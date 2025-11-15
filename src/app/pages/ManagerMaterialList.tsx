import FloatingLabelInput from "@/components/FloatingInput/FloatingLabelInput";
import SearchInput from "@/components/Search/SearchInput";
import AdminButton from "@/pages/admin/button/AdminButton";
import { AdminApiRequest } from "@/services/AdminApiRequest";
import { DownloadOutlined } from "@ant-design/icons";
import { Form, message, Modal, Space, Table } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "../admin/adminPage.scss";

const ManagerMaterialList = () => {
  const [form] = Form.useForm();
  const [materialList, setMaterialList] = useState<any[]>([]);
  const [openCreateMaterialModal, setOpenCreateMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchMaterialList = async () => {
    try {
      const res = await AdminApiRequest.get("/branch-material/list");
      setMaterialList(res.data);
    } catch (error) {
      console.error("Error fetching material list:", error);
      message.error("Không thể tải danh sách nguyên liệu. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchMaterialList();
  }, []);

  const exportExcel = () => {
    const exportData = materialList.map((material) => ({
      ID: material.id,
      "Tên nguyên liệu": material.name,
      "Số lượng nhập": material.quantityImported,
      "Số lượng tồn": material.quantityStock,
      Giá: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(material.price),
      "Loại bảo quản": material.storageType,
      "Ngày nhập": moment(material.importDate).format("YYYY-MM-DD HH:mm:ss"),
      "Ngày hết hạn": moment(material.expiryDate).format("YYYY-MM-DD HH:mm:ss"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachNguyenLieu");
    XLSX.writeFile(workbook, "DanhSachNguyenLieu.xlsx");
  };

  const onOpenCreateMaterialModal = (record: any) => {
    setEditingMaterial(record);

    if (record) {
      form.setFieldsValue({
        name: record.rawMaterial.name,
        price: Number(record.rawMaterial.price).toFixed(0),
        storageType: record.rawMaterial.storageType,
        quantityImported: record.quantityImported,
        quantityStock: record.quantityStock,
        importDate: moment(record.importDate),
        expiryDate: moment(record.expiryDate),
      });
    }

    setOpenCreateMaterialModal(true);
  };

  const onOKCreateMaterial = async () => {
    try {
      const data = form.getFieldsValue();

      if (!data.importDate || !data.expiryDate) {
        message.error("Vui lòng nhập đầy đủ ngày nhập và ngày hết hạn!");
        return;
      }

      const payload = {
        quantityImported: Number(data.quantityImported),
        quantityStock: Number(data.quantityStock),
        importDate: data.importDate.toISOString(),
        expiryDate: data.expiryDate.toISOString(),
      };

      await AdminApiRequest.put(
        `/branch-material/${editingMaterial.id}`,
        payload
      );

      fetchMaterialList();
      setOpenCreateMaterialModal(false);
      form.resetFields();
      message.success("Nguyên liệu đã được cập nhật thành công!");
      setEditingMaterial(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật nguyên liệu:", error);
      message.error("Không thể cập nhật nguyên liệu. Vui lòng thử lại.");
    }
  };

  const onCancelCreateMaterial = () => {
    setOpenCreateMaterialModal(false);
    form.resetFields();
  };

  const onDeleteMaterial = async (id: number) => {
    try {
      await AdminApiRequest.delete(`/material/${id}`);
      fetchMaterialList();
      message.success("Nguyên liệu đã được xóa thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa nguyên liệu:", error);
      message.error("Không thể xóa nguyên liệu. Vui lòng thử lại.");
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
  }, [searchKeyword]);

  return (
    <div className="container-fluid">
      <div className="sticky-header-wrapper">
        <h2 className="header-custom">QUẢN LÝ NGUYÊN LIỆU</h2>

        <div className="header-actions">
          <div className="search-form">
            <SearchInput
              placeholder="Tìm kiếm theo id, tên hoặc loại bảo quản"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearchKeyword}
              allowClear
            />
          </div>
          <div className="d-flex">
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
        className="material-modal"
        title={"Chỉnh sửa thông tin nguyên liệu"}
        open={openCreateMaterialModal}
        onCancel={onCancelCreateMaterial}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <FloatingLabelInput
            name="name"
            label="Tên nguyên liệu"
            component="input"
            disabled={!!editingMaterial}
          />
          <FloatingLabelInput
            name="storageType"
            label="Loại bảo quản"
            component="input"
            disabled={!!editingMaterial}
          />
          <FloatingLabelInput
            name="price"
            label="Giá (VNĐ)"
            component="input"
            disabled={!!editingMaterial}
          />

          <div className="grid-2">
            <FloatingLabelInput
              name="quantityImported"
              label="Số lượng nhập"
              component="input"
              type="number"
              rules={[{ required: true, message: "Số lượng nhập là bắt buộc" }]}
            />
            <FloatingLabelInput
              name="quantityStock"
              label="Số lượng tồn"
              component="input"
              type="number"
              rules={[{ required: true, message: "Số lượng tồn là bắt buộc" }]}
            />
          </div>
          <div className="grid-2">
            <FloatingLabelInput
              name="importDate"
              label="Ngày nhập"
              component="date"
              rules={[{ required: true, message: "Ngày nhập là bắt buộc" }]}
            />
            <FloatingLabelInput
              name="expiryDate"
              label="Ngày hết hạn"
              component="date"
              rules={[{ required: true, message: "Ngày hết hạn là bắt buộc" }]}
            />
          </div>

          <div className="modal-footer-custom">
            <AdminButton variant="secondary" onClick={onCancelCreateMaterial}>
              Hủy
            </AdminButton>
            <AdminButton variant="primary" onClick={onOKCreateMaterial}>
              Lưu thay đổi
            </AdminButton>
          </div>
        </Form>
      </Modal>

      <Table
        className="custom-table"
        rowKey="id"
        dataSource={materialList}
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
            dataIndex: ["rawMaterial", "name"],
            key: "name",
            sorter: (a, b) =>
              a.rawMaterial.name.localeCompare(b.rawMaterial.name),
          },
          {
            title: "Giá",
            dataIndex: ["rawMaterial", "price"],
            key: "price",
            render: (price: string) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(Number(price)),
            sorter: (a, b) =>
              parseFloat(a.rawMaterial.price) - parseFloat(b.rawMaterial.price),
          },
          {
            title: "Loại bảo quản",
            dataIndex: ["rawMaterial", "storageType"],
            key: "storageType",
            sorter: (a, b) =>
              a.rawMaterial.storageType.localeCompare(
                b.rawMaterial.storageType
              ),
          },
          {
            title: "Số lượng nhập",
            dataIndex: "quantityImported",
            key: "quantityImported",
            sorter: (a, b) => a.quantityImported - b.quantityImported,
          },
          {
            title: "Số lượng tồn",
            dataIndex: "quantityStock",
            key: "quantityStock",
            sorter: (a, b) => a.quantityStock - b.quantityStock,
          },
          {
            title: "Ngày nhập",
            dataIndex: "importDate",
            key: "importDate",
            render: (date: string) => moment(date).format("YYYY-MM-DD"),
            sorter: (a, b) =>
              moment(a.importDate).unix() - moment(b.importDate).unix(),
          },
          {
            title: "Ngày hết hạn",
            dataIndex: "expiryDate",
            key: "expiryDate",
            render: (date: string) => moment(date).format("YYYY-MM-DD"),
            sorter: (a, b) =>
              moment(a.expiryDate).unix() - moment(b.expiryDate).unix(),
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
                />
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ManagerMaterialList;
