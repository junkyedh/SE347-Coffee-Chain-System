import SearchInput from "@/components/common/SearchInput/SearchInput";
import { MainApiRequest } from "@/services/MainApiRequest";
import { message, Table, Tag } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import "../adminPage.scss";

const StaffList = () => {
  const [staffList, setStaffList] = useState<any[]>([]);

  const fetchStaffList = async () => {
    try {
      const res = await MainApiRequest.get("/staff/list");
      setStaffList(res.data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      message.error("Lấy danh sách nhân viên không thành công. Please try again.");
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearchKeyword = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return fetchStaffList();
    const filtered = staffList.filter((s) =>
      [s.name, s.phone, s.typeStaff].some((val) =>
        (val || "").toLowerCase().includes(keyword),
      ),
    );
    setStaffList(filtered);
  };

  return (
    <div className="container-fluid">
      <div className="sticky-header-wrapper">
        <h2 className="header-custom">DANH SÁCH NHÂN VIÊN</h2>
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
        </div>
      </div>

      <Table
        className="custom-table"
        rowKey="id"
        dataSource={staffList}
        // --- KÍCH HOẠT CUỘN NGANG ---
        scroll={{ x: "max-content" }}
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
            title: "Tên nhân viên",
            dataIndex: "name",
            key: "name",
            width: 180, // Đủ rộng cho họ tên dài
            fixed: "left", // (Tùy chọn) Ghim cột Tên bên trái khi cuộn
            render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
          },
          {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            width: 100,
            align: "center",
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
            title: "Ngày sinh",
            dataIndex: "birth",
            key: "birth",
            width: 120,
            align: "center",
            render: (birth: string) =>
              birth ? moment(birth).format("DD-MM-YYYY") : "-",
          },
          {
            title: "Loại nhân viên",
            dataIndex: "typeStaff",
            key: "typeStaff",
            width: 150,
            align: "center",
            render: (type) => <Tag color="geekblue">{type}</Tag>,
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
            width: 200, // Địa chỉ thường dài nên để rộng
            render: (text) => (
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "200px",
                }}
                title={text}
              >
                {text || "-"}
              </div>
            ),
          },
          {
            title: "Giờ làm việc",
            dataIndex: "workHours",
            key: "workHours",
            width: 120,
            align: "center",
            render: (workHours: number) => (
              <span style={{ fontWeight: 500 }}>{workHours} giờ</span>
            ),
          },
          {
            title: "Lương",
            dataIndex: "salary",
            key: "salary",
            width: 150,
            sorter: (a, b) => a.salary - b.salary,
            render: (salary: number) => (
              <span style={{ color: "#10b981", fontWeight: 600 }}>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(salary)}
              </span>
            ),
          },
          {
            title: "Ngày bắt đầu",
            dataIndex: "startDate",
            key: "startDate",
            width: 180,
            align: "center",
            render: (startDate: string) =>
              startDate ? moment(startDate).format("DD-MM-YYYY HH:mm") : "-",
          },
        ]}
      />
    </div>
  );
};

export default StaffList;
