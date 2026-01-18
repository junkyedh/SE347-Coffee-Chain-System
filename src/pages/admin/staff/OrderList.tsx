import AdminButton from "@/components/admin/AdminButton/AdminButton";
import SearchInput from "@/components/common/SearchInput/SearchInput";
import StatusDropdown from "@/components/common/StatusDropdown/StatusDropdown";
import { AdminApiRequest } from "@/services/AdminApiRequest";
import { DownloadOutlined } from "@ant-design/icons";
import { Form, Input, message, Table, Tag } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import "../adminPage.scss";

export const OrderList = () => {
  const [managerOrderList, setManagerOrderList] = useState<any[]>([]);
  const [originalManagerOrderList, setOriginalManagerOrderList] = useState<
    any[]
  >([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [staffInput, setStaffInput] = useState<{ [orderId: number]: string }>(
    {},
  );

  const fetchManagerOrderList = async () => {
    const res = await AdminApiRequest.get("/branch-order/list");
    setManagerOrderList(res.data);
    setOriginalManagerOrderList(res.data);
  };

  useEffect(() => {
    fetchManagerOrderList();
  }, []);

  const handleSearchKeyword = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      fetchManagerOrderList();
      return;
    }
    const filtered = originalManagerOrderList.filter((order) => {
      const id = String(order.id ?? "").toLowerCase();
      const phoneCustomer = (order.phoneCustomer ?? "").toLowerCase();
      const staffName = (order.staffName ?? "").toLowerCase();

      return (
        id.includes(keyword) ||
        phoneCustomer.includes(keyword) ||
        staffName.includes(keyword)
      );
    });
    setManagerOrderList(filtered);
  };

  useEffect(() => {
    if (!searchKeyword.trim()) {
      fetchManagerOrderList();
    }
  }, [searchKeyword]);

  const handleExportManagerOrderList = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      managerOrderList.map((order) => ({
        "Mã đơn": order.id,
        "Số điện thoại": order.phoneCustomer,
        "Loại phục vụ": order.serviceType,
        "Tổng tiền": order.totalPrice,
        "Ngày đặt": moment(order.orderDate).format("DD-MM-YYYY HH:mm:ss"),
        "Nhân viên": order.staffName,
        "Trạng thái": order.status,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh Sách Đơn Hàng");
    XLSX.writeFile(workbook, "DanhSachDonHang.xlsx");
    message.success("Xuất danh sách đơn hàng thành công.");
  };

  const handleChangeStatus = async (id: number, newStatus: string) => {
    // 1. Tìm đơn hàng hiện tại để lấy trạng thái cũ
    const currentOrder = managerOrderList.find((o) => o.id === id);
    if (!currentOrder) return;

    // 2. Lấy tên nhân viên (Ưu tiên lấy từ ô Input user đang nhập)
    const staffNameInput = staffInput[id];
    const staffName =
      staffNameInput !== undefined
        ? staffNameInput
        : currentOrder.staffName || "";

    // 3. KIỂM TRA ĐIỀU KIỆN: Nếu đang là PENDING mà không có tên nhân viên
    if (
      currentOrder.status === "PENDING" &&
      (!staffName || staffName.trim() === "")
    ) {
      message.warning(
        "Đơn hàng 'Chờ xác nhận' bắt buộc phải nhập tên nhân viên xử lý!",
      );
      return;
    }

    try {
      await AdminApiRequest.put(`/branch-order/status/${id}`, {
        status: newStatus,
        staffName: staffName,
      });
      message.success("Cập nhật trạng thái thành công.");

      // Xóa input tạm
      setStaffInput((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });

      fetchManagerOrderList();
    } catch (error) {
      message.error("Không thể cập nhật trạng thái.");
    }
  };

  const handleCancelOrder = async (id: number) => {
    const staffName =
      staffInput[id] ||
      managerOrderList.find((o) => o.id === id)?.staffName ||
      "";

    try {
      await AdminApiRequest.put(`/branch-order/status/${id}`, {
        status: "CANCELLED",
        staffName,
      });
      message.success("Đơn hàng đã được hủy.");
      fetchManagerOrderList();
      setStaffInput((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      message.error("Không thể hủy đơn hàng.");
    }
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Chờ xác nhận", color: "orange" },
    PREPARING: { label: "Đang chuẩn bị", color: "purple" },
    COMPLETED: { label: "Hoàn thành", color: "green" },
    CANCELLED: { label: "Đã hủy", color: "red" },
  };

  return (
    <div className="container-fluid m-2">
      <div className="sticky-header-wrapper">
        <h2 className="h2 header-custom">DANH SÁCH ĐƠN HÀNG</h2>
        <div className="header-actions d-flex me-3 py-2 align-items-center justify-content-between">
          <div className="flex-grow-1 d-flex justify-content-center">
            <Form layout="inline" className="search-form d-flex">
              <SearchInput
                placeholder="Tìm kiếm theo SĐT hoặc mã đơn"
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
              icon={<DownloadOutlined />}
              onClick={handleExportManagerOrderList}
              title="Tải xuống danh sách"
            />
          </div>
        </div>
      </div>

      <Table
        className="custom-table"
        dataSource={managerOrderList}
        rowKey="id"
        // --- THÊM DÒNG NÀY ĐỂ KÍCH HOẠT CUỘN NGANG ---
        scroll={{ x: "max-content" }}
        columns={[
          {
            title: "Mã đơn",
            dataIndex: "id",
            key: "id",
            width: 80, // Cố định chiều rộng cột nhỏ
            align: "center",
            sorter: (a, b) => a.id - b.id,
          },
          {
            title: "Số điện thoại",
            dataIndex: "phoneCustomer",
            key: "phoneCustomer",
            width: 140, // Đủ rộng cho SĐT
          },
          {
            title: "Loại phục vụ",
            dataIndex: "serviceType",
            key: "serviceType",
            width: 140,
            align: "center",
            sorter: (a, b) => a.serviceType.localeCompare(b.serviceType),
            render: (text) => <Tag color="blue">{text.toLowerCase() === 'take away' ? 'Mang đi' : 'Tại cửa hàng'}</Tag>,
          },
          {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            key: "totalPrice",
            width: 150,
            sorter: (a, b) => a.totalPrice - b.totalPrice,
            render: (price) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(price),
          },
          {
            title: "Ngày đặt",
            dataIndex: "orderDate",
            key: "orderDate",
            width: 180, // Đủ rộng cho ngày giờ
            render: (date: string) =>
              moment(date).format("DD-MM-YYYY HH:mm:ss"),
            sorter: (a, b) =>
              moment(a.orderDate).unix() - moment(b.orderDate).unix(),
          },
          {
            title: "Nhân viên",
            dataIndex: "staffName",
            key: "staffName",
            width: 180, // Đủ rộng cho ô Input
            render: (staffName: string, record: any) => (
              <Input
                value={staffInput[record.id] ?? staffName ?? ""}
                placeholder="Tên nhân viên"
                size="small"
                // style={{ width: 120 }} // Bỏ width cứng này đi để nó theo width của cột
                onChange={(e) =>
                  setStaffInput((prev) => ({
                    ...prev,
                    [record.id]: e.target.value,
                  }))
                }
              />
            ),
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            align: "center",
            render: (status: string) => {
              const map = statusMap[status];
              return map ? (
                <Tag color={map.color}>{map.label}</Tag>
              ) : (
                <Tag>{status}</Tag>
              );
            },
            sorter: (a, b) => {
              const labelA = statusMap[a.status]?.label || a.status;
              const labelB = statusMap[b.status]?.label || b.status;
              return labelA.localeCompare(labelB);
            },
          },
          {
            title: "Hành động",
            key: "action",
            width: 200, // Cột hành động cần rộng
            align: "center",
            render: (_: any, record: any) => (
              <StatusDropdown
                value={record.status}
                onChange={(newStatus) =>
                  handleChangeStatus(record.id, newStatus)
                }
                statusMap={statusMap}
              ></StatusDropdown>
            ),
          },
        ]}
      />
    </div>
  );
};

export default OrderList;
