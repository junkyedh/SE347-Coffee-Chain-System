import FloatingLabelInput from '@/components/common/FloatingInput/FloatingLabelInput';
import { ROUTES } from '@/constants';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import {
  CoffeeOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
  TableOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Form, message, Modal, Select, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TableOrder.scss';

const { Option } = Select;

const AdminTableOrder = () => {
  const [tableList, setTableList] = useState<any[]>([]);
  const [filteredTableList, setFilteredTableList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSeats, setSelectedSeats] = useState<string | number>('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const navigate = useNavigate();

  const fetchTableList = async () => {
    try {
      setLoading(true);
      const res = await AdminApiRequest.get('/table/list');
      setTableList(res.data);
      setFilteredTableList(res.data);
    } catch (error) {
      message.error('Lấy danh sách bàn thất bại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableList();
  }, []);

  const handleFilterChange = (value: string | number) => {
    setSelectedSeats(value);
    if (value) {
      const filtered = tableList.filter((table) => table.seat.toString() === value);
      setFilteredTableList(filtered);
    } else {
      setFilteredTableList(tableList);
    }
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      const { status, seat } = values;
      await AdminApiRequest.post('/table', { status, seat });
      message.success('Bàn đã được thêm thành công!');
      setIsModalVisible(false);
      form.resetFields();
      fetchTableList();
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm bàn!');
      console.error('Error adding table:', error);
    }
  };

  const handleChooseProduct = async (table: any, serviceType: 'Dine In' | 'Take Away') => {
    const navigationState = {
      serviceType,
      tableId: serviceType === 'Dine In' ? table?.id : null,
      tableName: table?.id ? `Bàn ${table.id}` : 'Mang đi',
      phoneCustomer: table?.phoneOrder || null, // Nếu bàn đã đặt thì có sđt
      customerName: table?.name || null,
      tableSeats: table?.seat || 0,
      isNewOrder: true, // Đánh dấu đây là đơn mới chưa lưu xuống DB
    };

    navigate(ROUTES.STAFF.ORDER_PLACE, { state: navigationState });
  };

  const handleViewActiveOrder = async (table: any) => {
    try {
      setLoading(true);
      const res = await AdminApiRequest.get('branch-order/list');
      const activeOrders = res.data.filter(
        (order: any) =>
          order.tableId === table.id &&
          ['Chờ xác nhận', 'Đang chuẩn bị', 'Sẵn sàng', 'Đang giao'].includes(order.status)
      );

      if (activeOrders) {
        navigate(ROUTES.STAFF.ORDER_PLACE, {
          state: {
            orderId: activeOrders[0].id,
            isNewOrder: false,
            tableId: table.id,
            tableName: `Bàn ${table.id}`,
            serviceType: 'Dine In',
          },
        });
      } else {
        message.error('Không tìm thấy đơn hàng của bàn này.');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi lấy đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = (tableId: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa bàn',
      content: 'Bạn có chắc chắn muốn xóa bàn này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await AdminApiRequest.delete(`/table/${tableId}`);
          message.success('Xóa bàn thành công!');
          fetchTableList();
        } catch (error) {
          message.error('Xóa bàn thất bại!');
        }
      },
    });
  };

  const handleEditTable = (table: any) => {
    setEditingTable(table);
    setIsEditModalVisible(true);
    editForm.setFieldsValue({
      status: table.status,
      phoneOrder: table.phoneOrder,
      name: table.name,
      bookingTime: table.bookingTime,
      seatingTime: table.seatingTime,
      seat: table.seat,
    });
  };

  const handleSaveTable = async (values: any) => {
    if (!editingTable) return;

    try {
      await AdminApiRequest.put(`/table/${editingTable.id}`, values);
      message.success('Cập nhật bàn thành công!');
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditingTable(null);
      fetchTableList();
    } catch (error) {
      console.error('Error updating table:', error);
      message.error('Có lỗi xảy ra khi cập nhật bàn!');
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return '#10b981';
      case 'Reserved':
        return '#f59e0b';
      case 'Occupied':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getTableStatusText = (status: string) => {
    switch (status) {
      case 'Available':
        return 'Trống';
      case 'Reserved':
        return 'Đã đặt';
      case 'Occupied':
        return 'Đang sử dụng';
      default:
        return status;
    }
  };

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case 'Available':
        return '✓';
      case 'Reserved':
        return '⏰';
      case 'Occupied':
        return '👥';
      default:
        return '?';
    }
  };

  return (
    <div className="modern-table-container">
      {/* Header */}
      <div className="table-header">
        <div className="header-content">
          <div className="title-section">
            <TableOutlined className="title-icon" />
            <h1 className="page-title">Table Management</h1>
            <span className="subtitle">Manage restaurant tables and orders</span>
          </div>

          <div className="header-actions">
            <div className="filter-section">
              <Select
                className="filter-select"
                value={selectedSeats}
                onChange={handleFilterChange}
                placeholder="Filter by seats"
                allowClear
                suffixIcon={<FilterOutlined />}
              >
                <Option value="">All Tables</Option>
                <Option value="2">2 Seats</Option>
                <Option value="4">4 Seats</Option>
                <Option value="6">6 Seats</Option>
                <Option value="8">8 Seats</Option>
              </Select>
            </div>

            <div className="action-buttons">
              <Button
                className="takeaway-btn"
                icon={<CoffeeOutlined />}
                onClick={() => handleChooseProduct(null, 'Take Away')}
              >
                Take Away
              </Button>
              <Button
                className="add-table-btn"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenModal}
              >
                Add Table
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="tables-grid">
        {filteredTableList.map((table) => (
          <Card
            key={table.id}
            className={`table-card ${table.status.toLowerCase()}`}
            loading={loading}
          >
            <div className="table-card-header">
              <div className="table-number">
                <span className="table-label">Table</span>
                <span className="table-id">#{table.id}</span>
              </div>
              <div className="table-status">
                <span
                  className="status-indicator"
                  style={{ backgroundColor: getTableStatusColor(table.status) }}
                >
                  {getTableStatusIcon(table.status)}
                </span>
                <span className="status-text">{getTableStatusText(table.status)}</span>
              </div>
            </div>

            <div className="table-info">
              <div className="info-row">
                <UserOutlined className="info-icon" />
                <span className="info-label">Seats:</span>
                <span className="info-value">{table.seat}</span>
              </div>
              {table.phoneOrder && (
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{table.phoneOrder}</span>
                </div>
              )}
              {table.name && (
                <div className="info-row">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">{table.name}</span>
                </div>
              )}
            </div>

            <div className="table-actions">
              <div className="primary-actions">
                {table.status === 'Available' && (
                  <Button
                    className="action-btn primary"
                    onClick={() => handleChooseProduct(table, 'Dine In')}
                  >
                    Take Order
                  </Button>
                )}

                {table.status === 'Occupied' && (
                  <Button className="action-btn info" onClick={() => handleViewActiveOrder(table)}>
                    View Order
                  </Button>
                )}

                {table.status === 'Reserved' && (
                  <Button
                    className="action-btn warning"
                    onClick={() => handleChooseProduct(table, 'Dine In')}
                  >
                    Start Order
                  </Button>
                )}
              </div>

              <div className="secondary-actions">
                <Tooltip title="Edit Table">
                  <Button
                    className="icon-btn edit"
                    icon={<EditOutlined />}
                    onClick={() => handleEditTable(table)}
                  />
                </Tooltip>

                <Tooltip title="Delete Table">
                  <Button
                    className="icon-btn delete"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteTable(table.id)}
                    danger
                  />
                </Tooltip>
              </div>
            </div>
          </Card>
        ))}

        {/* Empty State */}
        {filteredTableList.length === 0 && !loading && (
          <div className="empty-state">
            <TableOutlined className="empty-icon" />
            <h3>No Tables Found</h3>
            <p>Add your first table to get started</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
              Add Table
            </Button>
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      <Modal
        className="modern-modal"
        title="Add New Table"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="form-grid">
            <FloatingLabelInput
              label="Table Status"
              name="status"
              component="select"
              rules={[{ required: true, message: 'Please select table status!' }]}
              options={[
                { value: 'Available', label: 'Available' },
                { value: 'Reserved', label: 'Reserved' },
                { value: 'Occupied', label: 'Occupied' },
              ]}
            />

            <FloatingLabelInput
              label="Number of Seats"
              name="seat"
              component="input"
              type="number"
              rules={[{ required: true, message: 'Please enter number of seats!' }]}
              componentProps={{ min: 1 }}
            />
          </div>

          <div className="modal-footer">
            <Button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </Button>
            <Button className="submit-btn" htmlType="submit">
              Add Table
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Table Modal */}
      <Modal
        className="modern-modal"
        title="Edit Table Information"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setEditingTable(null);
        }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleSaveTable}>
          <div className="form-grid">
            <FloatingLabelInput
              label="Table Status"
              name="status"
              component="select"
              rules={[{ required: true, message: 'Please select table status!' }]}
              options={[
                { value: 'Available', label: 'Available' },
                { value: 'Reserved', label: 'Reserved' },
                { value: 'Occupied', label: 'Occupied' },
              ]}
            />

            <FloatingLabelInput
              label="Number of Seats"
              name="seat"
              component="input"
              type="number"
              rules={[{ required: true, message: 'Please enter number of seats!' }]}
              componentProps={{ min: 1 }}
            />
          </div>

          <div className="form-grid">
            <FloatingLabelInput
              label="Phone Number"
              name="phoneOrder"
              component="input"
              type="text"
            />

            <FloatingLabelInput label="Customer Name" name="name" component="input" type="text" />
          </div>

          <div className="form-grid">
            <FloatingLabelInput
              label="Booking Time"
              name="bookingTime"
              component="input"
              type="text"
              componentProps={{ placeholder: 'YYYY-MM-DD HH:mm:ss' }}
            />

            <FloatingLabelInput
              label="Seating Time"
              name="seatingTime"
              component="input"
              type="text"
              componentProps={{ placeholder: 'YYYY-MM-DD HH:mm:ss' }}
            />
          </div>

          <div className="modal-footer">
            <Button
              className="cancel-btn"
              onClick={() => {
                setIsEditModalVisible(false);
                editForm.resetFields();
                setEditingTable(null);
              }}
            >
              Cancel
            </Button>
            <Button className="submit-btn" htmlType="submit">
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTableOrder;
