import SearchInput from "@/components/Search/SearchInput";
import { MainApiRequest } from "@/services/MainApiRequest";
import { Form, message, Table } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import "../../admin/adminPage.scss";

const StaffList = () => {
  const [form] = Form.useForm();
  const [staffList, setStaffList] = useState<any[]>([]);

  const [openCreateStaffModal, setOpenCreateStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  const fetchStaffList = async () => {
    try {
      const res = await MainApiRequest.get("/staff/list");
      setStaffList(res.data);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      message.error("Failed to fetch staff list. Please try again.");
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, []);

  const onOpenCreateStaffModal = () => {
    setEditingStaff(null);
    form.setFieldsValue({});
    setOpenCreateStaffModal(true);
  };

  const onOKCreateStaff = async () => {
    try {
      const data = form.getFieldsValue();
      data.name = data.name || "";
      data.gender = data.gender || "";
      data.birth = data.birth ? data.birth.format("YYYY-MM-DD") : null;
      data.startDate = moment().format("YYYY-MM-DD");
      data.typeStaff = data.typeStaff || "Nhân viên phục vụ";
      data.workHours = data.workHours || 8;
      //data.salary = data.minsalary * data.workHours;
      data.activestatus = true;
      data.roleid = 2;
      data.password = editingStaff ? editingStaff.password : "default123";

      console.log("Dữ liệu gửi:", data);

      if (editingStaff) {
        const { ...rest } = data;
        await MainApiRequest.put(`/staff/${editingStaff.id}`, rest);
      } else {
        await MainApiRequest.post("/staff", data);
      }
      console.log(data);
      fetchStaffList();
      setOpenCreateStaffModal(false);
      form.resetFields();
      setEditingStaff(null);
    } catch (error) {
      console.error("Error creating/updating staff:", error);
      message.error("Failed to create staff. Please try again.");
    }
  };

  const onCancelCreateStaff = () => {
    setOpenCreateStaffModal(false);
    setEditingStaff(null);
    form.resetFields();
  };

  const onEditStaff = (staff: any) => {
    setEditingStaff(staff);
    form.setFieldsValue({
      name: staff.name || "",
      gender: staff.gender || "",
      birth: staff.birth ? moment(staff.birth, "YYYY-MM-DD") : null,
      phone: staff.phone || "",
      typeStaff: staff.typeStaff || "",
      workHours: staff.workHours || 0,
      minsalary: staff.minsalary || 0,
      password: staff.password || "",
      startDate: staff.startDate ? moment(staff.startDate, "YYYY-MM-DD") : null,
      address: staff.address || "",
    });
    setOpenCreateStaffModal(true);
  };

  const onDeleteStaff = async (id: number) => {
    try {
      await MainApiRequest.delete(`/staff/${id}`);
      fetchStaffList();
    } catch (error) {
      console.error("Error deleting staff:", error);
      message.error("Failed to delete staff. Please try again.");
    }
  };
  const [searchKeyword, setSearchKeyword] = useState("");
  const handleSearchKeyword = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return fetchStaffList();
    const filtered = staffList.filter((s) =>
      [s.name, s.phone, s.typeStaff].some((val) =>
        (val || "").toLowerCase().includes(keyword)
      )
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
        columns={[
          { title: "ID", dataIndex: "id", key: "id" },
          { title: "Tên nhân viên", dataIndex: "name", key: "name" },
          { title: "Giới tính", dataIndex: "gender", key: "gender" },
          {
            title: "Ngày sinh",
            dataIndex: "birth",
            key: "birth",
            render: (birth: string) =>
              birth ? moment(birth).format("DD-MM-YYYY") : "-",
          },

          { title: "Loại nhân viên", dataIndex: "typeStaff", key: "typeStaff" },
          { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
          { title: "Địa chỉ", dataIndex: "address", key: "address" },

          {
            title: "Giờ làm việc",
            dataIndex: "workHours",
            key: "workHours",
            render: (workHours: number) => workHours + " giờ",
          },
          {
            title: "Lương",
            dataIndex: "salary",
            key: "salary",

            render: (salary: number) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(salary),
          },
          {
            title: "Ngày bắt đầu",
            dataIndex: "startDate",
            key: "startDate",
            render: (startDate: string) =>
              startDate ? moment(startDate).format("DD-MM-YYYY HH:mm:ss") : "-",
          },
        ]}
      />
    </div>
  );
};

export default StaffList;
