import {
  Button,
  Checkbox,
  Form,
  GetProp,
  Input,
  message,
  Modal,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  UploadProps,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import '../adminPage.scss';
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
  const [, setFilteredProductList] = useState<Product[]>([]);
  const [products] = useState<Product[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [materials, setMaterials] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter((product) => product.category === selectedCategory);
      setFilteredProductList(filtered);
    } else {
      setFilteredProductList(products);
    }
  }, [selectedCategory, products]);

  const fetchManagerProductList = async () => {
    try {
      const res = await AdminApiRequest.get('/product-branch/list');
      setManagerProductList(res.data);
    } catch (error) {
      if (axios.isCancel(error)) return; // Ignore canceled requests
      console.error('Error fetching product list:', error);
    }
  };

  useEffect(() => {
    fetchManagerProductList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await AdminApiRequest.get('/material/list');
        setMaterials(res.data);
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };

    fetchMaterials();
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

      const payload: any = {
        name: values.name,
        category: values.category,
        image: imageUrl,
        description: values.description || '',
        available: values.available ?? true,
        hot: values.hot ?? false,
        cold: values.cold ?? false,
        isPopular: values.isPopular ?? false,
        isNew: values.isNew ?? false,
        sizes:
          values.sizes?.map((size: any) => ({
            sizeName: size.sizeName,
            price: Number(size.price),
          })) || [],
        productMaterials:
          values.productMaterials?.map((m: any) => ({
            materialId: m.materialId,
            materialQuantity: Number(m.materialQuantity),
          })) || [],
      };

      if (editingProduct) {
        await AdminApiRequest.put(`/product/${editingProduct.id}`, payload);
      } else {
        await AdminApiRequest.post('/product', payload);
      }

      fetchManagerProductList();
      setEditingProduct(null);
      setOpenCreateProductModal(false);
      form.resetFields();
      setFileList([]);
      setImageUrl('');
      message.success(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!');
    } catch (error) {
      console.error(error);
      message.error('Không thể tạo hoặc cập nhật sản phẩm. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const onOpenEditProduct = (record: any) => {
    setEditingProduct(record);
    const mappedMaterials =
      record.materials?.map((m: any) => ({
        materialId: m.id || m.materialId,
        materialQuantity: m.quantity || m.materialQuantity,
      })) || [];

    form.setFieldsValue({
      name: record.name,
      category: record.category,
      description: record.description || '',
      sizes: record.sizes || [{ sizeName: 'M', price: null }],
      productMaterials: mappedMaterials,
      hot: record.hot ?? false,
      cold: record.cold ?? false,
      isPopular: record.isPopular ?? false,
      isNew: record.isNew ?? false,
      available: record.available ?? true,
    });
    setFileList(
      record.image
        ? [
            {
              uid: '1',
              name: record.name + '.png',
              status: 'done',
              url: record.image,
            },
          ]
        : []
    );
    setImageUrl(record.image || '');
    setOpenCreateProductModal(true);
  };

  const onCancelCreateProduct = () => {
    setOpenCreateProductModal(false);
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
    setImageUrl('');
  };

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
          <div className="d-flex">
            <AdminButton
              variant="primary"
              size="sm"
              icon={<i className="fas fa-plus"></i>}
              onClick={() => {
                setEditingProduct(null);
                form.resetFields();
                setFileList([]);
                setImageUrl('');
                setOpenCreateProductModal(true);
              }}
            ></AdminButton>
          </div>
        </div>
      </div>

      <Modal
        className="custom-modal"
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm mới sản phẩm'}
        open={openCreateProductModal}
        onCancel={onCancelCreateProduct}
        footer={null}
        width={900}
      >
        <Form form={form} layout="vertical" onFinish={onOKCreateProduct}>
          <div
            className="modal-grid-layout"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px',
            }}
          >
            {/* ===== CỘT TRÁI: Thông tin cơ bản ===== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Form.Item name="image" style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 140,
                  }}
                >
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    accept="image/*"
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
                </div>
                {progress > 0 && <Progress percent={progress} />}
              </Form.Item>

              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                    { value: 'Trà trái cây', label: 'Trà trái cây' },
                    { value: 'Nước ép', label: 'Nước ép' },
                    { value: 'Sinh tố', label: 'Sinh tố' },
                    { value: 'Bánh ngọt', label: 'Bánh ngọt' },
                  ]}
                />
              </div>

              <FloatingLabelInput
                label="Mô tả"
                name="description"
                component="input"
                type="text"
              />

              <div 
                className="checkbox-group" 
                style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  marginTop: '12px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}
              >
                <Form.Item name="hot" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Checkbox>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fas fa-fire" style={{ color: '#ff4d4f' }}></i>
                      Nóng
                    </span>
                  </Checkbox>
                </Form.Item>
                <Form.Item name="cold" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Checkbox>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fas fa-snowflake" style={{ color: '#1890ff' }}></i>
                      Đá
                    </span>
                  </Checkbox>
                </Form.Item>
                <Form.Item name="isPopular" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Checkbox>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fas fa-star" style={{ color: '#faad14' }}></i>
                      Phổ biến
                    </span>
                  </Checkbox>
                </Form.Item>
                <Form.Item name="isNew" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Checkbox>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fas fa-sparkles" style={{ color: '#52c41a' }}></i>
                      Mới
                    </span>
                  </Checkbox>
                </Form.Item>
                <Form.Item name="available" valuePropName="checked" initialValue={true} style={{ marginBottom: 0 }}>
                  <Checkbox>
                    <span 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontWeight: 600,
                        color: '#52c41a'
                      }}
                    >
                      <i className="fas fa-check-circle" style={{ color: '#52c41a' }}></i>
                      Đang bán
                    </span>
                  </Checkbox>
                </Form.Item>
              </div>
            </div>

            {/* ===== CỘT PHẢI: Giá & Nguyên liệu ===== */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Form.List name="sizes" initialValue={[{ sizeName: 'M', price: null }]}>
                {(fields, { add, remove }) => (
                  <>
                    <label className="form-label mt-3">Giá theo kích cỡ:</label>
                    {fields.map((field) => (
                      <div key={field.key} className="d-flex align-items-center gap-2 mb-2">
                        <Form.Item
                          {...field}
                          name={[field.name, 'sizeName']}
                          rules={[{ required: true, message: 'Tên size!' }]}
                        >
                          <Input placeholder="S / M / L" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'price']}
                          rules={[{ required: true, message: 'Giá bắt buộc!' }]}
                        >
                          <Input type="number" placeholder="Giá (VND)" />
                        </Form.Item>
                        {fields.length > 1 && (
                          <div className="justify-items-center d-flex">
                            <AdminButton
                              variant="accent"
                              className="remove-size-button"
                              size="sm"
                              onClick={() => remove(field.name)}
                            >
                              X
                            </AdminButton>
                          </div>
                        )}
                      </div>
                    ))}
                    <Form.Item>
                      <AdminButton variant="secondary" onClick={() => add()}>
                        + Thêm kích cỡ
                      </AdminButton>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.List name="productMaterials">
                {(fields, { add, remove }) => (
                  <>
                    <label className="form-label mt-3">Nguyên liệu:</label>
                    {fields.map((field) => (
                      <div key={field.key} className="d-flex align-items-center gap-2 mb-2">
                        <Form.Item
                          {...field}
                          name={[field.name, 'materialId']}
                          rules={[{ required: true, message: 'Chọn nguyên liệu' }]}
                        >
                          <Select
                            placeholder="Nguyên liệu"
                            options={materials.map((m) => ({
                              value: m.id,
                              label: m.name,
                            }))}
                          />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'materialQuantity']}
                          rules={[{ required: true, message: 'Nhập số lượng' }]}
                        >
                          <Input type="number" placeholder="Số lượng" />
                        </Form.Item>
                        <AdminButton variant="accent" size="sm" onClick={() => remove(field.name)}>
                          X
                        </AdminButton>
                      </div>
                    ))}
                    <Form.Item>
                      <AdminButton variant="secondary" onClick={() => add()}>
                        + Thêm nguyên liệu
                      </AdminButton>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          </div>

          <div className="modal-footer-custom d-flex justify-content-end align-items-center gap-3 mt-5">
            <AdminButton variant="secondary" size="sm" onClick={onCancelCreateProduct}>
              Hủy
            </AdminButton>
            <AdminButton variant="primary" size="sm" type="submit" disabled={progress > 0}>
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
            render: (_, record) => {
              // Manager chỉ edit được sản phẩm do chi nhánh mình tạo (scope = 'Chi nhánh')
              // Không được edit sản phẩm hệ thống
              const canEdit = record.scope === 'Chi nhánh';
              
              return (
                <Space size="middle">
                  {canEdit && (
                    <AdminButton
                      variant="primary"
                      size="sm"
                      icon={<i className="fas fa-edit"></i>}
                      onClick={() => onOpenEditProduct(record)}
                    />
                  )}
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
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default ManagerProductList;
