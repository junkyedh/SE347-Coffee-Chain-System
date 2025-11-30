import {
  Button,
  Form,
  GetProp,
  message,
  Modal,
  Progress,
  Space,
  Table,
  Tag,
  Upload,
  UploadProps,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import '../admin/adminPage.scss';
import imgDefault from '@/assets/cup10.jpg';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import FloatingLabelInput from '@/components/common/FloatingInput/FloatingLabelInput';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import AdminButton from '@/components/admin/AdminButton/AdminButton';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  upsize?: number;
  image?: string;
  mood?: string;
  available: boolean;
  sizes?: ProductSize[];
};

type ProductSize = {
  sizeName: string;
  price: number;
};

type UploadRequestOption = Parameters<GetProp<UploadProps, 'customRequest'>>[0];

const ManagerProductList = () => {
  const [form] = Form.useForm();
  const [progress, setProgress] = useState(0);
  const [managerProductList, setManagerProductList] = useState<any[]>([]);
  const [openCreateProductModal, setOpenCreateProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const selectedCategory = Form.useWatch('category', form);
  const [filteredProductList, setFilteredProductList] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter((product) => product.category === selectedCategory);
      setFilteredProductList(filtered);
    } else {
      setFilteredProductList(products);
    }
  }, [selectedCategory, products]);

  const fetchManagerProductList = async () => {
    const res = await AdminApiRequest.get('/product-branch/list');
    setManagerProductList(res.data);
  };

  useEffect(() => {
    fetchManagerProductList();
  }, []);

  const handleUpload = async (options: UploadRequestOption) => {
    const { onSuccess, onError, file, onProgress } = options;

    const fmData = new FormData();
    const config = {
      headers: { 'content-type': 'multipart/form-data' },
      onUploadProgress: (event: any) => {
        const percent = Math.floor((event.loaded / event.total) * 100);
        setProgress(percent);
        if (percent === 100) {
          setTimeout(() => setProgress(0), 1000);
        }
        onProgress && onProgress({ percent });
      },
    };
    fmData.append('file', file);
    try {
      const res = await AdminApiRequest.post('/file/upload', fmData, config);
      const { data } = res;
      setImageUrl(data.imageUrl);
      onSuccess && onSuccess('Ok');
    } catch (err) {
      console.error('Error:', err);
      onError && onError(new Error('Upload failed'));
    }
  };

  const handleChange = (info: any) => {
    const file = info.fileList[0];
    setFileList(file ? [file] : []);
  };

  const handleRemove = () => {
    setFileList([]);
    setImageUrl('');
  };

  const onOKCreateProduct = async () => {
    try {
      const values = await form.validateFields();

      let data: any = {
        name: values.name,
        category: values.category,
        image: imageUrl,
        available: true,
      };

      if (values.category === 'Bánh ngọt') {
        data.price = Number(values.price);
        data.upsize = 0;
      } else {
        data.price = Number(values.price);
        data.upsize = Number(values.upsize);
      }

      if (editingProduct) {
        await AdminApiRequest.put(`/product/${editingProduct.id}`, data);
      } else {
        await AdminApiRequest.post('/product', data);
      }

      fetchManagerProductList();
      setEditingProduct(null);
      setOpenCreateProductModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Không thể tạo hoặc cập nhật sản phẩm. Vui lòng kiểm tra lại thông tin.');
    }
  };

  // Hàm hủy bỏ việc tạo hoặc chỉnh sửa sản phẩm
  const onCancelCreateProduct = () => {
    setOpenCreateProductModal(false);
    form.resetFields();
  };

  // Hàm cập nhật trạng thái sản phẩm
  const onToggleProductStatus = async (record: any) => {
    try {
      const updatedAvailable = !record.available;
      await AdminApiRequest.put(`/product-branch/available/${record.id}`, {
        available: updatedAvailable,
      });

      setManagerProductList((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, available: updatedAvailable } : item
        )
      );

      message.success('Cập nhật trạng thái sản phẩm thành công.');
    } catch (error) {
      console.error('Error updating availability:', error);
      message.error('Không thể cập nhật trạng thái sản phẩm.');
    }
  };

  const handleSearchKeyword = () => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      fetchManagerProductList();
      return;
    }
    const filtered = managerProductList.filter((product) => {
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();

      return name.includes(keyword) || category.includes(keyword);
    });
    setManagerProductList(filtered);
  };
  // Reset search when keyword is empty
  useEffect(() => {
    if (!searchKeyword.trim()) {
      fetchManagerProductList();
    }
  }, [searchKeyword]);

  return (
    <div className="container-fluid">
      <div className="sticky-header-wrapper">
        <h2 className="header-custom">QUẢN LÝ SẢN PHẨM</h2>
        <div className="header-actions">
          <div className="search-form">
            <SearchInput
              placeholder="Tìm kiếm theo tên hoặc loại sản phẩm"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearchKeyword}
              allowClear
            />
          </div>
        </div>
      </div>

      <Modal
        className="custom-modal"
        title={editingProduct ? 'Chỉnh sửa' : 'Thêm mới'}
        open={openCreateProductModal}
        onCancel={() => setOpenCreateProductModal(false)}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="image" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Upload
                listType="picture-card"
                fileList={fileList}
                accept="image/*"
                onPreview={() => {}}
                customRequest={handleUpload}
                onRemove={handleRemove}
                onChange={handleChange}
              >
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div>Tải lên</div>
                  </div>
                )}
              </Upload>
              {progress > 0 ? <Progress percent={progress} /> : null}
            </div>
          </Form.Item>
          <div className="grid-2">
            <FloatingLabelInput
              label="Tên sản phẩm"
              name="name"
              component="input"
              type="text"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
            />
            <FloatingLabelInput
              label="Loại"
              name="category"
              component="select"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              options={[
                { value: 'Cà phê', label: 'Cà phê' },
                { value: 'Trà sữa', label: 'Trà sữa' },
                { value: 'Trà', label: 'Trà' },
                { value: 'Nước ép', label: 'Nước ép' },
                { value: 'Sinh tố', label: 'Sinh tố' },
                { value: 'Nước ngọt', label: 'Nước ngọt' },
                { value: 'Bánh ngọt', label: 'Bánh ngọt' },
              ]}
            />
          </div>
          <Form.Item>
            {selectedCategory === 'Bánh ngọt' ? (
              <FloatingLabelInput
                name="price"
                label="Giá"
                component="input"
                type="number"
                style={{ width: '50%' }}
                rules={[{ required: true, message: 'Vui lòng nhập giá bánh ngọt!' }]}
              />
            ) : (
              <div className="field-row d-flex justify-content-between align-items-center">
                <FloatingLabelInput
                  name="price"
                  label="Giá size M"
                  component="input"
                  type="number"
                  style={{ width: '50%' }}
                  rules={[{ required: true, message: 'Vui lòng nhập giá size M!' }]}
                />
                <FloatingLabelInput
                  name="upsize"
                  label="Giá tăng size"
                  component="input"
                  type="number"
                  style={{ width: '50%' }}
                  rules={[{ required: true, message: 'Vui lòng nhập giá tăng size!' }]}
                />
              </div>
            )}
          </Form.Item>

          <div className="modal-footer-custom">
            <AdminButton variant="secondary" onClick={onCancelCreateProduct}>
              Hủy
            </AdminButton>
            <AdminButton variant="primary" onClick={onOKCreateProduct} disabled={progress > 0}>
              {editingProduct ? 'Lưu thay đổi' : 'Tạo mới'}
            </AdminButton>
          </div>
        </Form>
      </Modal>

      <Table
        className="custom-table"
        rowKey="id"
        dataSource={managerProductList}
        pagination={{
          pageSize: 6,
          showSizeChanger: true,
        }}
        columns={[
          { title: 'ID', dataIndex: 'productId', key: 'productId', sorter: (a, b) => a.id - b.id },
          {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (image: string) => (
              <img
                src={image || imgDefault}
                alt="Product"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                }}
              />
            ),
          },
          {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
          },
          {
            title: 'Loại',
            dataIndex: 'category',
            key: 'category',
            sorter: (a, b) => a.category.localeCompare(b.category),
          },
          {
            title: 'Giá',
            key: 'price',
            sorter: (a, b) => a.price - b.price,
            render: (_, record) => {
              const formatter = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {record.sizes?.map((size: ProductSize) => (
                    <p key={size.sizeName}>
                      {size.sizeName}: {formatter.format(size.price)}
                    </p>
                  ))}
                </div>
              );
            },
          },
          {
            title: 'Mood',
            dataIndex: 'mood',
            key: 'mood',
            sorter: (a, b) => a.mood?.localeCompare(b.mood || '') || 0,
            render: (_, record) => {
              const drinkCategory = [
                'Cà phê',
                'Trà',
                'Trà trái cây',
                'Trà sữa',
                'Nước ép',
                'Sinh tố',
                'Nước ngọt',
              ];
              if (!drinkCategory.includes(record.category)) return 'Không áp dụng';
              if (record.category === 'Cà phê' || record.category === 'Trà') {
                return <span>{record.mood || 'Nóng / Đá'}</span>;
              } else if (
                record.category === 'Trà sữa' ||
                record.category === 'Nước ép' ||
                record.category === 'Trà trái cây' ||
                record.category === 'Sinh tố' ||
                record.category === 'Nước ngọt'
              ) {
                return <span>{record.mood || 'Lạnh'}</span>;
              }
              return 'Không áp dụng';
            },
          },
          {
            title: 'Trạng thái',
            dataIndex: 'available',
            key: 'available',
            sorter: (a, b) => (a.available === b.available ? 0 : a.available ? -1 : 1),
            render: (available: boolean) => (
              <Tag color={available ? 'green' : 'red'}>{available ? 'Đang bán' : 'Ngưng bán'}</Tag>
            ),
          },
          {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
              <Space size="middle">
                <Button
                  type="text"
                  style={{
                    color: record.available ? 'orange' : 'green',
                    borderColor: record.available ? 'orange' : 'green',
                  }}
                  onClick={() => onToggleProductStatus(record)}
                >
                  {record.available ? 'Ngưng bán' : 'Mở bán'}
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ManagerProductList;
