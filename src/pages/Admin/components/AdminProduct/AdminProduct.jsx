import React, { useEffect, useRef, useState } from "react";
import { WrapperHeader, WrapperUploadFile } from "./styled"
import { PlusCircleOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, Row, Select, Space } from "antd";
import AdminTable from "../AdminTable/AdminTable";
import InputComponent from "../../../../components/InputComponent/InputComponent";
import { convertPrice, getBase64, renderOptions } from "../../../../untils";
import { useMutationHook } from '../../../../hook/userMutationHook'
import * as ProductService from '../../../../service/ProductService'
import Loading from "../../../../components/Loading/Loading";
import * as message from '../../../../components/Message/Message'
import { useQuery } from "@tanstack/react-query";
import DrawerComponent from "../../../../components/DrawerComponent/DrawerComponent";
import { useSelector } from "react-redux";
import ModalComponent from "../../../../components/ModalComponent/ModalComponent";
import { imageDb } from "../../../../FireBase/Config"
import { v4 } from 'uuid'
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
const AdminProduct = () => {
    const [rowSelected, setRowSelected] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPendingUpdate, setIsPendingUpdate] = useState(false)
    const user = useSelector((state) => state?.user)
    const [isModalOpenDelele, setIsModalOpenDelele] = useState(false)
    // const [searchText, setSearchText] = useState('');
    // const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null)
    const [isOpenDrawer, setIsOpenDrawer] = useState(false)
    const initial = () => ({
        name: '',
        price: '',
        importPrice: '',
        description: '',
        rating: '',
        image: [],
        countInStock: '',
        discount: '',
        type: '',
        newType: ''
    })
    const [stateProduct, setStateProduct] = useState(initial())
    const [stateProductDetail, setStateProductDetail] = useState(initial())

    const mutation = useMutationHook(
        data => {
            // const { ...rest } = data
            ProductService.createProduct(data)
        }
    )

    const mutationUpdate = useMutationHook(
        (data) => {
            // console.log("dataaa", data)
            const {
                id,
                access_token,
                ...rests } = data
            const res = ProductService.updateProduct(id, { ...rests }, access_token)
            return res
        },
    )
    const mutationDelete = useMutationHook(
        (data) => {
            const { id, access_token, } = data
            const res = ProductService.deleteProduct(id, access_token)
            return res
        },
    )
    const mutationDeleteMany = useMutationHook(
        (data) => {
            const { access_token, ...ids } = data
            const res = ProductService.deleteManyProduct(ids, access_token)
            return res
        },
    )

    const { isPending: isPendingUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated } = mutationUpdate
    const { data: dataDelete, isPending: isPendingDelete, isSuccess: isSuccessDelete, isError: isErrorDelete } = mutationDelete
    const { data: dataDeleteMany, isSuccess: isSuccessDeleteMany, isError: isErrorDeleteMany } = mutationDeleteMany

    const handleOnchange = (e) => {
        setStateProduct({
            ...stateProduct,
            [e.target.name]: e.target.value
        })
    }


    const handleOnchangeDetail = (e) => {
        setStateProductDetail({
            ...stateProductDetail,
            [e.target.name]: e.target.value
        })
    }


    const [form] = Form.useForm()

    const handleCancel = () => {
        setIsModalOpen(false);
        setStateProduct(initial())
        form.resetFields()
    };

    const handleCloseDrawer = () => {
        setIsOpenDrawer(false);
        setStateProductDetail(initial())
        form.resetFields()
    };

    const onFinish = () => {
        const black = selectedSizeBlack.map((size) => ({
            size: size.replace('B', ''),
            quantity: quantityInputValuesBlack[size.replace('B', '')] || 0,
        }));
        const white = selectedSizeWhite.map((size) => ({
            size: size.replace('W', ''),
            quantity: quantityInputValuesWhite[size.replace('W', '')] || 0,
        }));
        const pink = selectedSizePink.map((size) => ({
            size: size.replace('P', ''),
            quantity: quantityInputValuesPink[size.replace('P', '')] || 0,
        }));
        const green = selectedSizeGreen.map((size) => ({
            size: size.replace('G', ''),
            quantity: quantityInputValuesGreen[size.replace('G', '')] || 0,
        }));

        const countInStock = [
            {
                color: "black",
                sizes: black.map((size) => ({
                    size: size.size,
                    quantity: size.quantity,
                })),
            },
            {
                color: "white",
                sizes: white.map((size) => ({
                    size: size.size,
                    quantity: size.quantity,
                })),
            },
            {
                color: "pink",
                sizes: pink.map((size) => ({
                    size: size.size,
                    quantity: size.quantity,
                })),
            },
            {
                color: "green",
                sizes: green.map((size) => ({
                    size: size.size,
                    quantity: size.quantity,
                })),
            },
        ];
        // const allSizes = Object.values(sizesByColor);


        const params = {
            name: stateProduct.name,
            importPrice: stateProduct.importPrice,
            price: stateProduct.price,
            description: stateProduct.description,
            rating: stateProduct.rating,
            image: stateProduct.image,
            discount: stateProduct.discount,
            countInStock: countInStock,
            type: stateProduct.type === "add_type" ? stateProduct.newType : stateProduct.type
        }
        mutation.mutate(params)
        setIsModalOpen(false);
        // queryProduct.refetch()


    }
    const { isPending, isSuccess, isError } = mutation


    useEffect(() => {
        if (isSuccess) {
            handleCancel()
            message.success()
            queryProduct.refetch()
            queryProductType.refetch()
        } else if (isError) {
            message.error()
        }
    }, [isSuccess])

    useEffect(() => {
        if (isSuccessDeleteMany && dataDeleteMany?.status === "success") {
            handleCancel()
            message.success()
            queryProduct.refetch()
        } else if (isErrorDeleteMany) {
            message.error()
        }
    }, [isSuccessDeleteMany])

    let handleOnchangeAvatarCalled = false;

    const handleOnchangeAvatar = async ({ fileList }) => {
        if (handleOnchangeAvatarCalled) {
            return;
        }
        handleOnchangeAvatarCalled = true;

        const maxImages = 5;
        const imagesToUpload = fileList.slice(0, maxImages);
        for (const file of imagesToUpload) {
            if (!file.url && !file.preview) {
                const imageRef = ref(imageDb, `product/${v4()}`);
                await uploadBytes(imageRef, file.originFileObj);
                const downloadURL = await getDownloadURL(imageRef);

                setStateProduct({
                    ...stateProduct,
                    image: [...stateProduct.image, downloadURL]
                })
            }
        }

        handleOnchangeAvatarCalled = false;

        // const file = fileList[0];
        // if (!file.url && !file.preview) {
        //     file.preview = file.originFileObj
        //     const imageRef = ref(imageDb, `product/${v4()}`)
        //     await uploadBytes(imageRef, file.preview)
        //     console.log(imageRef)
        //     const downloadURL = await getDownloadURL(imageRef);
        //     setStateProduct({
        //         ...stateProduct,
        //         image: downloadURL
        //     })
        // }

    }

    // const handleOnchangeAvatar = async ({ fileList }) => {
    //     const file = fileList[0]
    //     if (!file.url && !file.preview) {
    //         file.preview = await getBase64(file.originFileObj)
    //     }
    //     setStateProduct({
    //         ...stateProduct,
    //         image: file.preview
    //     })
    // }
    const handleOnchangeAvatarDetail = async ({ fileList }) => {
        if (handleOnchangeAvatarCalled) {
            return;
        }
        handleOnchangeAvatarCalled = true;

        const maxImages = 5;
        const imagesToUpload = fileList.slice(0, maxImages);
        for (const file of imagesToUpload) {
            if (!file.url && !file.preview) {
                const imageRef = ref(imageDb, `product/${v4()}`);
                await uploadBytes(imageRef, file.originFileObj);
                const downloadURL = await getDownloadURL(imageRef);

                setStateProductDetail({
                    ...stateProductDetail,
                    image: [...stateProductDetail.image, downloadURL]
                })
            }
        }

        handleOnchangeAvatarCalled = false;

        // const file = fileList[0]
        // if (!file.url && !file.preview) {
        //     file.preview = await getBase64(file.originFileObj)
        // }
        // setStateProductDetail({
        //     ...stateProductDetail,
        //     image: file.preview
        // })
    }

    const handleDeleteManyProduct = (ids) => {
        // console.log("idDelete", _id)
        mutationDeleteMany.mutate({ ids: ids, token: user?.access_token },
            {
                onSettled: () => {
                    queryProduct.refetch()
                }
            }
        )
    }

    const getAllProduct = async () => {
        const res = await ProductService.getAllProduct()
        return res
    }

    const fetchProductAllType = async () => {
        const res = await ProductService.getAllProductType()
        return res
    }

    const queryProduct = useQuery({
        queryKey: ['products'],
        queryFn: getAllProduct,
    });

    const queryProductType = useQuery({
        queryKey: ['products-Type'],
        queryFn: fetchProductAllType,
    });
    // console.log("type", queryProductType)

    const { isLoading, data: products } = queryProduct



    const dataTable = products?.data?.length && products?.data?.map((product) => {
        return {
            ...product,
            key: product._id,
            name: product.name,
            importPrice: convertPrice(product.importPrice),
            price: convertPrice(product.price),
            type: product.type,
            rating: product.rating,
            color: product.countInStock.map((item) => {
                return (
                    item?.sizes?.length != 0 && `${item.color === 'black' ? "Đen" : item.color === 'white' ? 'Trắng'
                        : item.color === 'pink' ? "Hồng" : item.color === 'green' ? 'Xanh' : ' '} `
                )
            }),
        }
    })

    const fetchGetDetailProduct = async (rowSelected) => {
        const res = await ProductService.getDetailProduct(rowSelected)
        if (res?.data) {
            setStateProductDetail({
                name: res.data.name,
                importPrice: res.data.importPrice,
                price: res.data.price,
                description: res.data.description,
                rating: res.data.rating,
                image: res.data.image,
                discount: res.data.discount,
                countInStock: res.data.countInStock,
                type: res.data.type
            })
        }
        setIsPendingUpdate(false)
    }
    useEffect(() => {

        if (isSuccessUpdated) {
            handleCloseDrawer()
            message.success()
        } else if (isErrorUpdated) {
            message.error()
        }
    }, [isSuccessUpdated])

    useEffect(() => {
        if (dataDelete?.status === "success") {
            handleCancelDelete()
            message.success()
        } else if (isErrorDelete) {
            message.error()
        }
    }, [isSuccessDelete])

    //when click data not set firt time 
    useEffect(() => {
        if (rowSelected && isOpenDrawer) {
            setIsPendingUpdate(true)
            fetchGetDetailProduct(rowSelected)
        }
    }, [rowSelected, isOpenDrawer])

    useEffect(() => {
        if (!isModalOpen) {
            form.setFieldsValue(stateProductDetail)
        } else {
            form.setFieldsValue(initial())
            setSelectedSizeGreen([])
            setSelectedSizeWhite([])
            setSelectedSizeBlack([])
            setSelectedSizePink([])
        }
        // console.log("eff", stateProductDetail)
    }, [form, stateProductDetail, isModalOpen])


    // console.log("data", stateProductDetail)
    const handleDetailProduct = () => {
        if (rowSelected) {
            setIsPendingUpdate(true)
            fetchGetDetailProduct(rowSelected)
        }
        setIsOpenDrawer(true)

    }

    const onUpdateProduct = () => {
        const {
            name,
            price,
            importPrice,
            description,
            rating,
            image,
            discount,
            countInStock,
            type,
        } = stateProductDetail;

        console.log(type)
        mutationUpdate.mutate({
            id: rowSelected,
            name,
            price,
            importPrice,
            description,
            rating,
            image,
            discount,
            countInStock,
            type: stateProductDetail.type === "add_type" ? stateProductDetail.newType : stateProductDetail.type,
            token: user?.access_token,
        }, {
            onSettled: () => {
                queryProduct.refetch()
            }
        }
        );

    }

    const handleChangeSelect = (value) => {
        setStateProduct({
            ...stateProduct,
            type: value
        })
    }

    const handleChangeSelectDetail = (value) => {
        setStateProductDetail({
            ...stateProductDetail,
            type: value
        })
    }
    const handleCancelDelete = () => {
        setIsModalOpenDelele(false)
    }

    const DeleteProduct = () => {
        // console.log(rowSelected)
        mutationDelete.mutate({ id: rowSelected, token: user?.access_token },
            {
                onSettled: () => {
                    queryProduct.refetch()
                }
            }
        )
    }

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        // setSearchText(selectedKeys[0]);
        // setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        // setSearchText('');
    };
    const renderAction = () => {
        return (
            <div>
                <EditOutlined style={{ color: 'orange', fontSize: '30px', cursor: 'pointer' }} onClick={handleDetailProduct} />
                <DeleteOutlined style={{ color: 'red', fontSize: '30px', cursor: 'pointer' }} onClick={() => { setIsModalOpenDelele(true) }} />
            </div>
        )
    }

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <InputComponent
                    ref={searchInput}
                    placeholder={`Search ${dataIndex} `}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Lọc
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Xóa
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    });
    const columns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            sorter: (a, b) => a.name.length - b.name.length,
            ...getColumnSearchProps('name')
        },
        {
            title: 'Màu sắc',
            dataIndex: 'color',
            // sorter: (a, b) => a.price - b.price
        },
        // {
        //     title: 'Size',
        //     dataIndex: 'size',
        //     // sorter: (a, b) => a.price - b.price
        // },
        {
            title: 'Giá nhập',
            dataIndex: 'importPrice',
            sorter: (a, b) => a.importPrice - b.importPrice
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            sorter: (a, b) => a.price - b.price
        },
        {
            title: 'Loại sản phẩm',
            dataIndex: 'type',
            sorter: (a, b) => a.type - b.type
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            sorter: (a, b) => a.rating - b.rating
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            render: renderAction,
        },
    ];

    //black
    const [selectedSizeBlack, setSelectedSizeBlack] = useState([]);
    const [quantityInputValuesBlack, setQuantityInputValuesBlack] = useState({});

    const handleQuanlityChangeBlack = (checkedValues) => {
        setSelectedSizeBlack(checkedValues);
    };

    const handleQuantityInputChange = (e, size) => {
        setQuantityInputValuesBlack((prevValues) => ({
            ...prevValues,
            [size]: e.target.value,
        }));
    };



    //White
    const [selectedSizeWhite, setSelectedSizeWhite] = useState([]);
    const [quantityInputValuesWhite, setQuantityInputValuesWhite] = useState({});

    const handleQuanlityChangeWhite = (checkedValues) => {
        setSelectedSizeWhite(checkedValues)
    };
    const handleQuantityInputChangeWhite = (e, size) => {
        setQuantityInputValuesWhite((prevValues) => ({
            ...prevValues,
            [size]: e.target.value,
        }));
    };


    //green
    const [selectedSizeGreen, setSelectedSizeGreen] = useState([]);
    const [quantityInputValuesGreen, setQuantityInputValuesGreen] = useState({});
    const handleQuanlityChangeGreen = (checkedValues) => {
        setSelectedSizeGreen(checkedValues)
    };

    const handleQuantityInputChangeGreen = (e, size) => {
        setQuantityInputValuesGreen((prevValues) => ({
            ...prevValues,
            [size]: e.target.value,
        }));
    };

    //pink
    const [selectedSizePink, setSelectedSizePink] = useState([]);
    const [quantityInputValuesPink, setQuantityInputValuesPink] = useState({});
    const handleQuanlityChangePink = (checkedValues) => {
        setSelectedSizePink(checkedValues)
    };
    const handleQuantityInputChangePink = (e, size) => {
        setQuantityInputValuesPink((prevValues) => ({
            ...prevValues,
            [size]: e.target.value,
        }));
    };

    return (
        <div>
            <WrapperHeader>
                Quản lý sản phẩm
            </WrapperHeader>
            <div>
                <Button style={{ width: '150px', height: '150px', borderRadius: '6px', borderStyle: 'dashed' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <PlusCircleOutlined style={{ fontSize: '60px' }} />
                </Button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <AdminTable
                    columns={columns}
                    data={dataTable}
                    isLoading={isLoading}
                    handleDeleteMany={handleDeleteManyProduct}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: event => {
                                setRowSelected(record._id)
                            }
                        }
                    }}
                />
            </div>

            <ModalComponent forceRender title="Tạo sản phẩm mới" open={isModalOpen} onCancel={handleCancel} footer={null}>
                <Loading isPending={isPending}>
                    <Form
                        name="basic"
                        labelCol={{
                            span: 7,
                        }}
                        wrapperCol={{
                            span: 18,
                        }}
                        style={{
                            maxWidth: 600,
                        }}
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={onFinish}
                        autoComplete="on"
                        form={form}
                    >
                        <Form.Item
                            label="Tên sản phẩm"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên sản phẩm',
                                },
                            ]}
                        >
                            <InputComponent value={setStateProduct.name} onChange={handleOnchange} name="name" />
                        </Form.Item>
                        <Form.Item
                            label="Loại sản phẩm"
                            name="type"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập loại sản phẩm',
                                },
                            ]}
                        >
                            <Select
                                name="type"
                                value={stateProduct.type}
                                // style={{ width: 120 }}
                                onChange={handleChangeSelect}
                                options={renderOptions(queryProductType?.data?.data)}
                            />
                        </Form.Item>
                        {stateProduct.type === 'add_type' && (
                            <Form.Item
                                label='Loại sản phẩm mới'
                                name="newType"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập loại sản phẩm',
                                    },
                                ]}
                            >
                                {stateProduct.type === 'add_type' && <InputComponent
                                    value={stateProduct.newType} onChange={handleOnchange}
                                    name="newType" />}
                            </Form.Item>
                        )}

                        <Form.Item
                            label="Hàng trong kho"
                            name="countInStock"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số lượng và màu sắc',
                                },
                            ]}
                        >
                            {/* <InputComponent value={setStateProduct.countInStock} onChange={handleOnchange} name="countInStock" /> */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div style={{ border: '1px solid rgb(11, 116, 229)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div>Màu đen</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2px' }}>
                                        <Row>
                                            <Col span={24}>
                                                <Checkbox.Group value={selectedSizeBlack} onChange={handleQuanlityChangeBlack}>
                                                    <Row>
                                                        <Col span={6}>
                                                            <Checkbox value="36B">36</Checkbox>
                                                            {selectedSizeBlack.includes('36B') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChange(e, '36')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="37B">37</Checkbox>
                                                            {selectedSizeBlack.includes('37B') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChange(e, '37')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="38B">38</Checkbox>
                                                            {selectedSizeBlack.includes('38B') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChange(e, '38')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="39B">39</Checkbox>
                                                            {selectedSizeBlack.includes('39B') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChange(e, '39')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="40B">40</Checkbox>
                                                            {selectedSizeBlack.includes('40B') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChange(e, '40')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="41B">41</Checkbox>
                                                            {selectedSizeBlack.includes('41B') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChange(e, '41')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="42B">42</Checkbox>
                                                            {selectedSizeBlack.includes('42B') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChange(e, '42')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="43B">43</Checkbox>
                                                            {selectedSizeBlack.includes('43B') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChange(e, '43')} />}
                                                        </Col>
                                                    </Row>
                                                </Checkbox.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                                <div style={{ border: '1px solid rgb(11, 116, 229)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div>Màu trắng</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2px' }}>
                                        <Row>
                                            <Col span={24}>
                                                <Checkbox.Group value={selectedSizeWhite} onChange={handleQuanlityChangeWhite}>
                                                    <Row>
                                                        <Col span={6}>
                                                            <Checkbox value="36W">36</Checkbox>
                                                            {selectedSizeWhite.includes('36W') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeWhite(e, '36')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="37W">37</Checkbox>
                                                            {selectedSizeWhite.includes('37W') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeWhite(e, '37')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="38W">38</Checkbox>
                                                            {selectedSizeWhite.includes('38W') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeWhite(e, '38')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="39W">39</Checkbox>
                                                            {selectedSizeWhite.includes('39W') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeWhite(e, '39')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="40W">40</Checkbox>
                                                            {selectedSizeWhite.includes('40W') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeWhite(e, '40')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="41W">41</Checkbox>
                                                            {selectedSizeWhite.includes('41W') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeWhite(e, '41')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="42W">42</Checkbox>
                                                            {selectedSizeWhite.includes('42W') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeWhite(e, '42')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="43W">43</Checkbox>
                                                            {selectedSizeWhite.includes('43W') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeWhite(e, '43')} />}
                                                        </Col>
                                                    </Row>
                                                </Checkbox.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                                <div style={{ border: '1px solid rgb(11, 116, 229)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div>Màu Hồng</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2px' }}>
                                        <Row>
                                            <Col span={24}>
                                                <Checkbox.Group value={selectedSizePink} onChange={handleQuanlityChangePink}>
                                                    <Row>
                                                        <Col span={6}>
                                                            <Checkbox value="36P">36</Checkbox>
                                                            {selectedSizePink.includes('36P') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangePink(e, '36')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="37P">37</Checkbox>
                                                            {selectedSizePink.includes('37P') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangePink(e, '37')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="38P">38</Checkbox>
                                                            {selectedSizePink.includes('38P') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangePink(e, '38')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="39P">39</Checkbox>
                                                            {selectedSizePink.includes('39P') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangePink(e, '39')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="40P">40</Checkbox>
                                                            {selectedSizePink.includes('40P') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangePink(e, '40')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="41P">41</Checkbox>
                                                            {selectedSizePink.includes('41P') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangePink(e, '41')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="42P">42</Checkbox>
                                                            {selectedSizePink.includes('42P') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangePink(e, '42')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="43P">43</Checkbox>
                                                            {selectedSizePink.includes('43P') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangePink(e, '43')} />}
                                                        </Col>
                                                    </Row>
                                                </Checkbox.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                                <div style={{ border: '1px solid rgb(11, 116, 229)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div>Màu xanh</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2px' }}>
                                        <Row>
                                            <Col span={24}>
                                                <Checkbox.Group value={selectedSizeGreen} onChange={handleQuanlityChangeGreen}>
                                                    <Row>
                                                        <Col span={6}>
                                                            <Checkbox value="36G">36</Checkbox>
                                                            {selectedSizeGreen.includes('36G') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeGreen(e, '36')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="37G">37</Checkbox>
                                                            {selectedSizeGreen.includes('37G') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeGreen(e, '37')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="38G">38</Checkbox>
                                                            {selectedSizeGreen.includes('38G') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeGreen(e, '38')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="39G">39</Checkbox>
                                                            {selectedSizeGreen.includes('39G') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeGreen(e, '39')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="40G">40</Checkbox>
                                                            {selectedSizeGreen.includes('40G') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeGreen(e, '40')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="41G">41</Checkbox>
                                                            {selectedSizeGreen.includes('41G') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeGreen(e, '41')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="42G">42</Checkbox>
                                                            {selectedSizeGreen.includes('42G') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeGreen(e, '42')} />}
                                                        </Col>
                                                        <Col span={6}>
                                                            <Checkbox value="43G">43</Checkbox>
                                                            {selectedSizeGreen.includes('43G') && <Input placeholder="Số lượng" onChange={(e) => handleQuantityInputChangeGreen(e, '43')} />}
                                                        </Col>
                                                    </Row>
                                                </Checkbox.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>

                        </Form.Item>
                        <Form.Item
                            label="Giá nhập"
                            name="importPrice"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá tiền',
                                },
                            ]}
                        >
                            <InputComponent value={setStateProduct.importPrice} onChange={handleOnchange} name="importPrice" />
                        </Form.Item>
                        <Form.Item
                            label="Giá bán"
                            name="price"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá tiền',
                                },
                            ]}
                        >
                            <InputComponent value={setStateProduct.price} onChange={handleOnchange} name="price" />
                        </Form.Item>
                        <Form.Item
                            label="Giảm giá"
                            name="discount"
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: 'Vui lòng nhập giảm giá',
                            //     },
                            // ]}
                        >
                            <InputComponent value={setStateProduct.discount} onChange={handleOnchange} name="discount" />
                        </Form.Item>
                        <Form.Item
                            label="Đánh giá"
                            name="rating"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng điền đánh giá',
                                },
                            ]}
                        >
                            <InputComponent value={setStateProduct.rating} onChange={handleOnchange} name="rating" />
                        </Form.Item>
                        <Form.Item
                            label="Mô tả sản phẩm"
                            name="description"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập mô tả',
                                },
                            ]}
                        >
                            <InputComponent value={setStateProduct.description} onChange={handleOnchange} name="description" />
                        </Form.Item>

                        <Form.Item
                            label="Image"
                            name="image"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn ảnh'
                                }
                            ]}
                        >
                            <WrapperUploadFile onChange={handleOnchangeAvatar}>
                                <Button >Select File</Button>
                                <div style={{ display: 'flex', paddingTop: '5px' }}>
                                    {
                                        stateProduct?.image && (stateProduct?.image.slice(0, 5).map((image) => (
                                            <img src={image}
                                                alt="product"
                                                style={{
                                                    display: 'flex',
                                                    height: '60px', width: '60px',
                                                    borderRadius: '0%', objectFit: 'cover',
                                                    marginLeft: '10px'
                                                }} />
                                        )))
                                    }
                                </div>
                            </WrapperUploadFile>
                        </Form.Item>

                        <Form.Item
                            name="remember"
                            valuePropName="checked"
                            wrapperCol={{
                                offset: 20,
                                span: 16,
                            }}
                        >
                            <Button type="primary" htmlType="submit" >
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
            <DrawerComponent title="Cập nhật sản phẩm" isOpen={isOpenDrawer} onClose={() => setIsOpenDrawer(false)} width="520px" >
                <Loading isPending={isPendingUpdate || isPendingUpdated}>
                    <Form
                        name="basic"
                        labelCol={{
                            span: 11,
                        }}
                        wrapperCol={{
                            span: 10,
                        }}
                        style={{
                            maxWidth: 500,
                        }}
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={onUpdateProduct}
                        autoComplete="on"
                        form={form}
                    >
                        <Form.Item
                            label="Tên sản phẩm"
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập tên sản phẩm',
                                },
                            ]}
                        >
                            <InputComponent value={setStateProductDetail.name} onChange={handleOnchangeDetail} name="name" />
                        </Form.Item>

                        <Form.Item
                            label="Loại sản phẩm"
                            name="type"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập loại sản phẩm',
                                },
                            ]}
                        >
                            <Select
                                name="type"
                                value={stateProductDetail.type}
                                // style={{ width: 120 }}
                                onChange={handleChangeSelectDetail}
                                options={renderOptions(queryProductType?.data?.data)}
                            />
                            {/* <InputComponent value={setStateProductDetail.type} name="type" /> */}
                        </Form.Item>
                        {stateProductDetail.type === 'add_type' && (
                            <Form.Item
                                label='Loại sản phẩm mới'
                                name="newType"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập loại sản phẩm',
                                    },
                                ]}
                            >
                                {stateProductDetail.type === 'add_type' && <InputComponent
                                    value={stateProductDetail.newType} onChange={handleOnchangeDetail}
                                    name="newType" />}
                            </Form.Item>
                        )}
                        <Form.Item
                            label="Giá"
                            name="price"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá tiền',
                                },
                            ]}
                        >
                            <InputComponent value={setStateProductDetail.price} onChange={handleOnchangeDetail} name="price" />
                        </Form.Item>
                        <Form.Item
                            label="Giảm giá"
                            name="discount"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng điền giảm giá',
                                },
                            ]}
                        >
                            <InputComponent value={setStateProductDetail.discount} onChange={handleOnchangeDetail} name="discount" />
                        </Form.Item>
                        {/* <Form.Item
                            label="Đánh giá"
                            name="rating"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng điền đánh giá',
                                },
                            ]}
                        >
                            <InputComponent value={setStateProductDetail.rating} onChange={handleOnchangeDetail} name="rating" />
                        </Form.Item> */}
                        <Form.Item
                            label="Mô tả sản phẩm"
                            name="description"
                        >
                            <InputComponent value={setStateProductDetail.description} onChange={handleOnchangeDetail} name="description" />
                        </Form.Item>

                        <Form.Item
                            label="Image"
                            name="image"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng chọn ảnh'
                                }
                            ]}
                        >
                            <WrapperUploadFile onChange={handleOnchangeAvatarDetail} maxCount={1} >
                                {/* <Button >Select File</Button> */}
                                <div style={{ display: 'flex', paddingTop: '5px' }}>
                                    {
                                        stateProductDetail?.image && (stateProductDetail?.image.slice(0, 5).map((image) => (
                                            <img src={image}
                                                alt="product"
                                                style={{
                                                    display: 'flex',
                                                    height: '60px', width: '60px',
                                                    borderRadius: '0%', objectFit: 'cover',
                                                    marginLeft: '10px'
                                                }} />
                                        )))
                                    }
                                </div>
                            </WrapperUploadFile>
                        </Form.Item>
                        <Form.Item
                            name="remember"
                            valuePropName="checked"
                            wrapperCol={{
                                offset: 20,
                                span: 16,
                            }}
                        >
                            <Button type="primary" htmlType="submit" >
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent forceRender title="Xóa sản phẩm" open={isModalOpenDelele} onCancel={handleCancelDelete} onOk={DeleteProduct}>
                <Loading isPending={isPendingDelete}>
                    <>
                        Bạn có chắc chắn muốn xóa ?
                    </>
                </Loading>
            </ModalComponent>

        </div >
    );
}

export default AdminProduct;