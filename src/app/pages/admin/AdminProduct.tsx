import { Button, Form, Input, message, Modal, Progress, Space, Table, Tag, Upload, UploadProps, Select, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import './adminPage.scss';
import AdminButton from './button/AdminButton';
import AdminPopConfirm from './button/AdminPopConfirm';
import { AdminApiRequest } from '@/app/services/AdminApiRequest';
import FloatingLabelInput from '@/app/components/FloatingInput/FloatingLabelInput';
import SearchInput from '@/app/components/Search/SearchInput';

import type { UploadRequestOption } from 'rc-upload/lib/interface';

type ProductSize = {
    sizeName: string;
    price: number;
};

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


// type UploadRequestOption = Parameters<GetProp<UploadProps, 'customRequest'>>[0];

const AdminProductList = () => {
    const [form] = Form.useForm();
    const [progress, setProgress] = useState(0);
    const [adminProductList, setAdminProductList] = useState<any[]>([]);
    const [openCreateProductModal, setOpenCreateProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [imageUrl, setImageUrl] = useState<string>("");
    const selectedCategory = Form.useWatch('category', form);
    const [filteredProductList, setFilteredProductList] = useState<Product[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [materials, setMaterials] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        if (selectedCategory) {
            const filtered = products.filter(
                (product) => product.category === selectedCategory
            );
            setFilteredProductList(filtered);
        } else {
            setFilteredProductList(products);
        }
    }, [selectedCategory, products]);

    // Hàm lấy danh sách sản phẩm
    const fetchAdminProductList = async () => {
        const res = await AdminApiRequest.get('/product/list');
        setAdminProductList(res.data);
    };

    useEffect(() => {
        fetchAdminProductList();
    }, []);

    useEffect(() => {
        const fetchMaterials = async () => {
            const res = await AdminApiRequest.get('/material/list');
            setMaterials(res.data); // res.data phải là mảng nguyên liệu
        };

        fetchMaterials();
    }, []);

    // Hàm tải lên hình ảnh
    const handleUpload = async (options: UploadRequestOption) => {
        const { onSuccess, onError, file, onProgress } = options;

        const fmData = new FormData();
        const config = {
            headers: { "content-type": "multipart/form-data" },
            onUploadProgress: (event: any) => {
                const percent = Math.floor((event.loaded / event.total) * 100);
                setProgress(percent);
                if (percent === 100) {
                    setTimeout(() => setProgress(0), 1000);
                }
                onProgress && onProgress({ percent });
            },
        };
        fmData.append("file", file);
        try {
            const res = await AdminApiRequest.post("/file/upload", fmData, config);
            const { data } = res;
            setImageUrl(data.imageUrl);
            onSuccess && onSuccess("Ok");
        } catch (err) {
            console.error("Error:", err);
            onError && onError(new Error("Upload failed"));
        }
    };

    // Hàm xử lý thay đổi file tải lên
    const handleChange = (info: any) => {
        const file = info.fileList[0];
        setFileList(file ? [file] : []);
    };

    // Hàm xử lý xóa file tải lên
    const handleRemove = () => {
        setFileList([]);
        setImageUrl("");
    };

    // Hàm mở modal tạo hoặc chỉnh sửa khuyến mãi
    const onOpenCreateProductModal = (record: any = null) => {
        setEditingProduct(record);
        form.resetFields();
        setFileList([]);
        setImageUrl("");

        if (record) {
            const {
                name,
                category,
                description,
                available,
                isPopular,
                isNew,
                hot,
                cold,
                sizes,
                productMaterials,
                image,
            } = record;

            const sizeData = sizes?.map((s: any) => ({
                sizeName: s.sizeName,
                price: s.price,
            })) || [];

            const materialsData = productMaterials?.map((m: any) => ({
                materialId: m.materialId ?? m.id,
                materialQuantity: m.materialQuantity ?? m.quantity,
            })) || [];

            form.setFieldsValue({
                name,
                category,
                description,
                available,
                isPopular,
                isNew,
                hot,
                cold,
                sizes: sizeData,
                productMaterials: materialsData,
            });

            if (image) {
                setFileList([{
                    uid: '-1',
                    name: 'image.png',
                    status: 'done',
                    url: image,
                }]);
                setImageUrl(image);
            }
        }

        setOpenCreateProductModal(true);
    };


    // Hàm xử lý khi nhấn nút "OK" trong modal tạo hoặc chỉnh sửa sản phẩm
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
                sizes: values.sizes?.map((size: any) => ({
                    sizeName: size.sizeName,
                    price: Number(size.price),
                })) || [],
                productMaterials: values.productMaterials?.map((m: any) => ({
                    materialId: m.materialId,
                    materialQuantity: Number(m.materialQuantity),
                })) || [],
            };

            if (editingProduct) {
                await AdminApiRequest.put(`/product/${editingProduct.id}`, payload);
            } else {
                await AdminApiRequest.post('/product', payload);
            }

            fetchAdminProductList();
            setEditingProduct(null);
            setOpenCreateProductModal(false);
            form.resetFields();
        } catch (error) {
            console.error(error);
            message.error("Không thể tạo hoặc cập nhật sản phẩm. Vui lòng kiểm tra lại thông tin.");
        }
    };

    // Hàm hủy bỏ việc tạo hoặc chỉnh sửa sản phẩm
    const onCancelCreateProduct = () => {
        setOpenCreateProductModal(false);
        form.resetFields();
    }

    // Hàm mở modal chỉnh sửa khuyến mãi
    const onOpenEditProduct = (record: any) => {
        setEditingProduct(record);

        // Mapping nguyên liệu về dạng form expects
        const mappedMaterials = record.materials?.map((m: any) => ({
            materialId: m.id || m.materialId,
            materialQuantity: m.quantity || m.materialQuantity,
        })) || [];
        console.log(record.image);

        // Gán dữ liệu vào form
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

        // Ảnh hiển thị
        setFileList(record.image ? [{
            uid: "1",
            name: record.name + ".png",
            status: 'done',
            url: record.image,
        }] : []);

        setImageUrl(record.image || "");
        console.log('url: ', imageUrl);
        setOpenCreateProductModal(true);
    };

    // Hàm xóa khuyến mãi
    const onDeleteProduct = async (id: number) => {
        try {
            await AdminApiRequest.delete(`/product/${id}`);
            setAdminProductList((prevList) => prevList.filter((product) => product.id !== id));
            message.success('Sản phẩm đã được xóa thành công.');
        } catch (error) {
            console.error('Error deleting product:', error);
            message.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
        };
    }

    // Hàm cập nhật trạng thái sản phẩm
    const onToggleProductStatus = async (record: any) => {
        try {
            const updatedProduct = { ...record, available: !record.available };
            await AdminApiRequest.put(`/product/available/${record.id}`, updatedProduct);
            setAdminProductList((prevList) =>
                prevList.map((product) =>
                    product.id === record.id ? { ...product, available: updatedProduct.available } : product
                )
            );
            message.success(`Trạng thái sản phẩm đã được cập nhật thành công.`);
        } catch (error) {
            console.error('Error updating product status:', error);
            message.error('Không thể cập nhật trạng thái sản phẩm. Vui lòng thử lại.');
        }
    }

    const handleSearchKeyword = () => {
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) {
            fetchAdminProductList();
            return;
        }
        const filtered = adminProductList.filter(product => {
            const name = (product.name || '').toLowerCase();
            const category = (product.category || '').toLowerCase();

            return name.includes(keyword) || category.includes(keyword);
        });
        setAdminProductList(filtered);
    };
    // Reset search when keyword is empty
    useEffect(() => {
        if (!searchKeyword.trim()) {
            fetchAdminProductList();
        }
    }, [searchKeyword]);

    return (
        <div className="container-fluid">
            <div className='sticky-header-wrapper'>
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
                            size='sm'
                            icon={<i className="fas fa-plus"></i>}
                            onClick={() => onOpenCreateProductModal()}
                        >
                        </AdminButton>
                    </div>
                </div>
            </div>

            {/* Creating the modal for creating or editing products */}
            <Modal
                className="custom-modal"
                title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm mới sản phẩm"}
                open={openCreateProductModal}
                onCancel={onCancelCreateProduct}
                footer={null}
                width={900} // mở rộng modal
            >
                <Form form={form} layout="vertical" onFinish={onOKCreateProduct}>
                    <div className="modal-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Bên trái */}
                        <div>
                            {/* Upload ảnh */}
                            <Form.Item name="image" >
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140 }}>
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

                            {/* Tên + loại */}
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
                                        { value: 'Trà trái cây', label: 'Trà trái cây' },
                                        { value: 'Nước ép', label: 'Nước ép' },
                                        { value: 'Sinh tố', label: 'Sinh tố' },
                                        { value: 'Bánh ngọt', label: 'Bánh ngọt' },
                                    ]}
                                />
                            </div>

                            {/* Mô tả */}
                            <FloatingLabelInput
                                label="Mô tả"
                                name="description"
                                component="input"
                                type="text"
                            />

                            {/* Hot & Cold */}
                            <div className="checkbox-group">
                              <Form.Item name="hot" valuePropName="checked">
                                <Checkbox>Hot</Checkbox>
                              </Form.Item>
                              <Form.Item name="cold" valuePropName="checked">
                                <Checkbox>Cold</Checkbox>
                              </Form.Item>
                            </div>
                            
                            {/* Flags */}
                            <div className="checkbox-group">
                              <Form.Item name="isPopular" valuePropName="checked">
                                <Checkbox>Phổ biến</Checkbox>
                              </Form.Item>
                              <Form.Item name="isNew" valuePropName="checked">
                                <Checkbox>Mới</Checkbox>
                              </Form.Item>
                              <Form.Item name="available" valuePropName="checked" initialValue={true}>
                                <Checkbox>Đang bán</Checkbox>
                              </Form.Item>
                            </div>
                        </div>

                        {/* Bên phải */}
                        <div>
                            {/* Giá & Size */}
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
                                                            variant='accent'
                                                            className="remove-size-button"
                                                            size='sm'
                                                            onClick={() => remove(field.name)}
                                                            >X
                                                        </AdminButton>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <Form.Item>
                                            <AdminButton variant='secondary' onClick={() => add()}>
                                                + Thêm kích cỡ
                                            </AdminButton>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>

                            {/* Nguyên liệu */}
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
                                                <AdminButton 
                                                    variant='accent'
                                                    size='sm'
                                                    onClick={() => remove(field.name)}>X
                                                </AdminButton>
                                            </div>
                                        ))}
                                        <Form.Item>
                                            <AdminButton 
                                                variant='secondary'
                                                onClick={() => add()}>
                                                + Thêm nguyên liệu
                                            </AdminButton>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer-custom d-flex justify-content-end align-items-center gap-3 mt-5">
                        <AdminButton
                            variant="secondary"
                            size='sm'
                            onClick={onCancelCreateProduct}
                        >
                            Hủy
                        </AdminButton>
                        <AdminButton
                            variant="primary"
                            size='sm'
                            disabled={progress > 0}
                        >
                            {editingProduct ? "Lưu thay đổi" : "Tạo mới"}
                        </AdminButton>
                    </div>
                </Form>
            </Modal>

            <Table
                className="custom-table"
                rowKey="id"
                dataSource={adminProductList}
                pagination={{
                    pageSize: 6, // Số lượng item trên mỗi trang
                    showSizeChanger: true, // Hiển thị tùy chọn thay đổi số item trên mỗi trang
                    // Các tùy chọn cho số item mỗi trang
                }
                }

                columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
                    {
                        title: 'Hình ảnh',
                        dataIndex: 'image',
                        key: 'image',
                        render: (image: string) => (
                            <img
                                src={image}
                                alt="Product"
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '8px',
                                }}
                            />
                        ),
                    },
                    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
                    { title: 'Loại', dataIndex: 'category', key: 'category', sorter: (a, b) => a.category.localeCompare(b.category) },
                    {
                        title: 'Giá',
                        key: 'price',
                        sorter: (a: any, b: any) => {
                            const priceA = a.sizes?.find((s: ProductSize) => s.sizeName === 'M')?.price || 0;
                            const priceB = b.sizes?.find((s: ProductSize) => s.sizeName === 'M')?.price || 0;
                            return priceA - priceB;
                        },
                        render: (_, record) => {
                            const formatter = new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                            });

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {record.sizes?.map((s: ProductSize) => (
                                        <p key={s.sizeName}>
                                            {s.sizeName}: {formatter.format(s.price)}
                                        </p>
                                    ))}
                                </div>
                            );
                        },
                    },
                    {
                        title: 'Mood', dataIndex: 'mood', key: 'mood', sorter: (a, b) => a.mood?.localeCompare(b.mood || '') || 0,
                        render: (_, record) => {
                            const drinkCategory = ['Cà phê', 'Trà trái cây', 'Trà sữa', 'Nước ép', 'Sinh tố'];
                            if (!drinkCategory.includes(record.category)) return 'Không áp dụng';
                            if (record.category === 'Cà phê') {
                                return <span>{record.mood || 'Nóng / Đá'}</span>;
                            } else if (record.category === 'Trà sữa' || record.category === 'Nước ép' || record.category === 'Sinh tố' || record.category === 'Trà trái cây') {
                                return <span>{record.mood || 'Lạnh'}</span>;
                            }
                            return 'Không áp dụng'; // Không hiển thị mood nếu không phải là loại đồ uống
                        }

                    },
                    {
                        title: 'Trạng thái', dataIndex: 'available', key: 'available', sorter: (a, b) => a.available === b.available ? 0 : a.available ? -1 : 1,
                        render: (available: boolean) => (
                            <Tag color={available ? 'green' : 'red'}>
                                {available ? 'Đang bán' : 'Ngưng bán'}
                            </Tag>
                        ),
                    },
                    {
                        title: 'Hành động',
                        key: 'action',
                        render: (_, record) => (
                            <Space size="middle">
                                <AdminButton
                                    variant="secondary"
                                    size='sm'
                                    icon={<i className="fas fa-edit"></i>}
                                    onClick={() => onOpenEditProduct(record)}>
                                </AdminButton>

                                <AdminPopConfirm
                                    title="Bạn có chắc chắn muốn xóa coupon này?"
                                    onConfirm={() => onDeleteProduct(record.id)}
                                    okText="Đồng ý"
                                    cancelText="Hủy"
                                >
                                    <AdminButton
                                        variant="destructive"
                                        size='sm'
                                        icon={<i className="fas fa-trash"></i>}>
                                    </AdminButton>
                                </AdminPopConfirm>

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

export default AdminProductList;
