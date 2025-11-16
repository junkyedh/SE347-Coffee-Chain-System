import { MainApiRequest } from "@/services/MainApiRequest";
import {
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import "../../admin/adminPage.scss";
import AdminButton from "@/pages/admin/button/AdminButton";
import FloatingLabelInput from "@/components/FloatingInput/FloatingLabelInput";
import AdminPopConfirm from "@/pages/admin/button/AdminPopConfirm";
import { Search } from "lucide-react";
import SearchInput from "@/components/Search/SearchInput";

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
      data.workHours = data.workHours || 8; // Mặc định là 8 giờ nếu không nhập
      //data.salary = data.minsalary * data.workHours; // Tính lương dựa trên giờ làm và lương cơ bản
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
      //message.success('Xóa nhân viên thành công!');
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
          // { title: 'Lương cơ bản', dataIndex: 'minsalary', key: 'minsalary' },
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
            // const formatCurrency = (value: number) =>
            //     new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            //     .format(value)
            //     .replace('₫', 'đ'); // Thay đổi ký hiệu để phù hợp với VNĐ
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
          //{ title: 'Status', dataIndex: 'activestatus', key: 'activestatus' },
          // {
          //     title: 'Hành động',
          //     key: 'actions',
          //     render: (_, record) => (
          //         <Space size="middle">
          //             <AdminButton
          //                 variant='secondary'
          //                 size='sm'
          //                 onClick={() => onEditStaff(record)}
          //                 icon={<i className="fas fa-edit"></i>}>
          //             </AdminButton>
          //             <AdminPopConfirm
          //                 title="Bạn có chắc chắn muốn xóa nhân viên này không?"
          //                 onConfirm={() => onDeleteStaff(record.id)}
          //                 okText="Có"
          //                 cancelText="Không"
          //             >
          //                 <AdminButton
          //                     variant='destructive'
          //                     size='sm'
          //                     icon={<i className="fas fa-trash"></i>}>
          //                 </AdminButton>
          //             </AdminPopConfirm>
          //         </Space>
          //     ),
          // },
        ]}
      />
    </div>
  );
};

export default StaffList;
