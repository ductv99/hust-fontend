import React, { useEffect, useRef, useState } from "react";
import { WrapperHeader, WrapperUploadFile } from "./styled"
import { MoreOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Select, Space } from "antd";
import AdminTable from "../AdminTable/AdminTable";
import InputComponent from "../../../../components/InputComponent/InputComponent";
import ModalComponent from "../../../../components/ModalComponent/ModalComponent";
import Loading from "../../../../components/Loading/Loading";
import { useSelector } from "react-redux";
import { useMutationHook } from "../../../../hook/userMutationHook";
import { convertPrice, getBase64 } from "../../../../untils";
import DrawerComponent from "../../../../components/DrawerComponent/DrawerComponent";
import { useQuery } from "@tanstack/react-query";
import * as message from '../../../../components/Message/Message'
import * as OrderService from '../../../../service/OrderService'
import { orderContant } from "../../../../contant";
import { useNavigate } from "react-router-dom";

// import PieChartComponent from './PieChart'




const AdminOrder = () => {

    const user = useSelector((state) => state?.user)
    const navigate = useNavigate()
    const [isOpenDrawer, setIsOpenDrawer] = useState(false)
    const [isPendingUpdate, setIsPendingUpdate] = useState(false)
    const [rowSelected, setRowSelected] = useState('')
    const [form] = Form.useForm()
    const initial = () => ({
        statusOrder: '',
        isPaid: '',
        isDelivered: ''
    })
    const [statusOrders, setStatusOrders] = useState(initial())

    const getAllOrder = async () => {
        const res = await OrderService.getAllOrder(user?.access_token)
        return res
    }

    const queryOrder = useQuery({ queryKey: ['orders'], queryFn: getAllOrder })
    const { isPending: isLoadingOrders, data: orders } = queryOrder

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <InputComponent
                    // ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    // onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        // onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        // onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1890ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                // setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    });
    const renderAction = () => {
        return (
            <div>
                <EditOutlined style={{ color: 'orange', fontSize: '30px', cursor: 'pointer' }} onClick={handleEdit} />
                <MoreOutlined style={{ color: 'rgb(12, 112, 229)', fontSize: '30px', cursor: 'pointer' }} onClick={handleDetailOrder} />
            </div>
        )
    }

    const columns = [
        {
            title: 'Người đặt hàng',
            dataIndex: 'userName',
            sorter: (a, b) => a.userName.length - b.userName.length,
            ...getColumnSearchProps('userName')
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            sorter: (a, b) => a.phone.length - b.phone.length,
            ...getColumnSearchProps('phone')
        },
        // {
        //     title: 'Địa chỉ người nhận',
        //     dataIndex: 'address',
        //     sorter: (a, b) => a.address.length - b.address.length,
        //     ...getColumnSearchProps('address')
        // },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'isPaid',
            sorter: (a, b) => a.isPaid.length - b.isPaid.length,
            ...getColumnSearchProps('isPaid')
        },
        {
            title: 'Trạng thái giao hàng',
            dataIndex: 'isDelivered',
            sorter: (a, b) => a.isDelivered.length - b.isDelivered.length,
            ...getColumnSearchProps('isDelivered')
        },
        {
            title: 'Hình thức thanh toán',
            dataIndex: 'paymentMethod',
            sorter: (a, b) => a.paymentMethod.length - b.paymentMethod.length,
            ...getColumnSearchProps('paymentMethod')
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            sorter: (a, b) => a.totalPrice.length - b.totalPrice.length,
            ...getColumnSearchProps('totalPrice')
        },
        {
            title: 'Trạng thái đơn hàng',
            dataIndex: 'statusOrder',
            sorter: (a, b) => a.isDelivered.length - b.isDelivered.length,
            ...getColumnSearchProps('statusOrder')
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            render: renderAction,
        },
    ];
    const mutationUpdate = useMutationHook(
        (data) => {
            const {
                id,
                token,
                ...rests } = data
            console.log("xxx", token)
            const res = OrderService.updateCartStatus(id, { ...rests }, token)
            return res
        },
    )
    const { isPending: isPendingUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated } = mutationUpdate

    const fetchGetDetailCart = async (rowSelected) => {
        const res = await OrderService.getDetailsOrder(rowSelected, user.access_token)
        if (res?.data) {
            setStatusOrders({
                statusOrder: res?.data?.statusOrder,
                isPaid: res?.data?.isPaid,
                isDelivered: res?.data?.isDelivered
            })
        }
        setIsPendingUpdate(false)
    }

    useEffect(() => {
        if (rowSelected && isOpenDrawer) {
            setIsPendingUpdate(true)
            fetchGetDetailCart(rowSelected)
        }
    }, [rowSelected, isOpenDrawer])

    useEffect(() => {
        if (isSuccessUpdated) {
            handleCloseDrawer()
            message.success()
        } else if (isErrorUpdated) {
            message.error()
        }
    }, [isSuccessUpdated])
    const handleEdit = () => {
        if (rowSelected) {
            fetchGetDetailCart(rowSelected)
            setIsPendingUpdate(true)
        }
        setIsOpenDrawer(true)
    }
    const handleDetailOrder = () => {
        if (rowSelected) {
            navigate(`/details-order/${rowSelected}`, {
                state: {
                    token: user?.access_token
                }
            })
        }
    }
    // useEffect(() => {
    //     if (rowSelected) {
    //         navigate(`/details-order/${rowSelected}`)
    //     }
    // }, [rowSelected])

    const handleCloseDrawer = () => {
        setIsOpenDrawer(false);
        form.resetFields()
    };
    const onUpdateStatusOrder = () => {
        mutationUpdate.mutate({
            id: rowSelected,
            token: user?.access_token,
            statusOrders,
        }, {
            onSettled: () => {
                queryOrder.refetch()
            }
        }
        );
    }
    const handleChange = (value) => {
        setStatusOrders((prevStatusOrders) => ({
            ...prevStatusOrders,
            isPaid: value,
        }));
    };

    const handleChangeDelivery = (value) => {
        setStatusOrders((prevStatusOrders) => ({
            ...prevStatusOrders,
            isDelivered: value,
        }));
    };

    const handleChangeStatus = (value) => {
        setStatusOrders((prevStatusOrders) => ({
            ...prevStatusOrders,
            statusOrder: value,
        }));
    };


    const dataTable = orders?.data?.length && orders?.data?.map((order) => {
        return {
            ...order,
            key: order._id,
            userName: order?.shippingAddress?.fullName,
            phone: `0${order?.shippingAddress?.phone}`,
            // address: order?.shippingAddress?.address,
            paymentMethod: orderContant.payment[order?.paymentMethod],
            isPaid: order?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
            isDelivered: order?.isDelivered ? 'Đã giao hàng' : 'Chưa giao hàng',
            totalPrice: convertPrice(order?.totalPrice),
            statusOrder: order?.statusOrder === 1 ? "Chờ xác nhận" : order?.statusOrder === 2 ? "Đã xác nhận" : order?.statusOrder === 3 ? "Đã bị hủy" : ""
        }
    })

    return (
        <div>
            <WrapperHeader>Quản lý đơn hàng</WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <AdminTable
                    columns={columns}
                    data={dataTable}
                    isPending={isLoadingOrders}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: event => {
                                setRowSelected(record._id)
                            }
                        }
                    }}
                />
            </div>
            <DrawerComponent title="Cập nhật trạng thái đơn hàng" isOpen={isOpenDrawer} onClose={() => setIsOpenDrawer(false)} width="520px" >
                <Loading
                    isPending={isPendingUpdate || isPendingUpdated}
                >
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
                        onFinish={onUpdateStatusOrder}
                        autoComplete="on"
                        form={form}
                    >
                        <Form.Item
                            label="Trạng thái thanh toán"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập vào trường này',
                                },
                            ]}
                        >
                            <Select
                                value={statusOrders?.isPaid}
                                onChange={handleChange}
                                options={[
                                    {
                                        value: false,
                                        label: 'Chưa thanh toán',
                                    },
                                    {
                                        value: true,
                                        label: 'Đã thanh toán',
                                    }
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Trạng thái giao hàng"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập vào trường này',
                                },
                            ]}
                        >
                            <Select
                                value={statusOrders?.isDelivered}
                                onChange={handleChangeDelivery}
                                options={[
                                    {
                                        value: false,
                                        label: 'Chưa giao hàng',
                                    },
                                    {
                                        value: true,
                                        label: 'Đã giao hàng',
                                    }
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Trạng thái đơn hàng"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập vào trường này',
                                },
                            ]}
                        >
                            <Select
                                value={statusOrders?.statusOrder}
                                onChange={handleChangeStatus}
                                options={[
                                    {
                                        value: 1,
                                        label: 'Chờ xác nhận',
                                    },
                                    {
                                        value: 2,
                                        label: 'Xác nhận đơn hàng',
                                    },
                                    {
                                        value: 3,
                                        label: 'Hủy đơn hàng',
                                    }
                                ]}
                            />
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
        </div>
    )
}

export default AdminOrder;