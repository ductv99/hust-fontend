import React, { useEffect, useMemo, useState } from "react";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { WrapperInputNumber } from '../../components/ProductDetails/styled'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import { useDispatch, useSelector } from 'react-redux';
import { CustomCheckbox, WrapperCountOrder, WrapperInfo, WrapperItemOrder, WrapperLeft, WrapperListOrder, WrapperRight, WrapperStyleHeader, WrapperStyleHeaderDilivery, WrapperTotal } from './styled';
import { addOrderProduct, decreaseAmount, increaseAmount, removeAllOrderProduct, removeOrderProduct, resetCart, selectedOrder } from "../../redux/slides/orderSlice";
import { convertPrice } from "../../untils";
import ModalComponent from "../../components/ModalComponent/ModalComponent"
import { Form } from 'antd';
import InputComponent from "../../components/InputComponent/InputComponent";
import { useMutationHook } from "../../hook/userMutationHook";
import * as UserService from '../../service/UserService'
import Loading from "../../components/Loading/Loading";
import { updateUser } from "../../redux/slides/userSile";
import * as message from '../../components/Message/Message'
import * as OrderService from '../../service/OrderService'
import { useNavigate } from "react-router-dom";
import StepComponent from "../../components/StepComponent/StepComponent";

const OrderPage = () => {
    const order = useSelector((state) => state.order)
    const user = useSelector((state) => state.user)
    const [listChecked, setListChecked] = useState([])
    // const [form] = Form.useForm()
    const [form] = Form.useForm();
    const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [stateUserDetails, setStateUserDetails] = useState({
        name: '',
        phone: '',
        address: '',
        // city: ''
    })
    const fetchCart = async () => {
        const res = await OrderService.getAllCartByUserId(user?.id, user?.access_token)
        if (res.data.length > 0) {
            const cartItems = res.data[0].orderItems;
            const uniqueItems = cartItems.filter((cart, index, self) => {
                return self.findIndex((item) => item.sizeId === cart.sizeId) === index;
            });
            if (order) {
                dispatch(resetCart())
                uniqueItems.forEach((cart) => {
                    dispatch(
                        addOrderProduct({
                            orderItem: {
                                name: cart.name,
                                amount: cart.amount,
                                image: cart.image,
                                price: cart.price,
                                product: cart.product,
                                discount: cart.discount,
                                sizeId: cart.sizeId,
                                color: cart.color,
                                size: cart.size,
                            },
                        })
                    );
                });
            }
        }
    }

    const mutationAddCart = useMutationHook(
        async (data) => {
            const {
                token,
                ...rests } = data
            const res = await OrderService.createCart(
                { ...rests }, token)
            return res
        },
    )
    const createCart = () => {
        if (user?.access_token && order?.orderItems && user?.id) {
            mutationAddCart.mutate({
                token: user?.access_token,
                orderItems: order?.orderItems,
                user: user?.id,
            })
        }
    }
    const { isSuccess, status } = mutationAddCart

    useEffect(() => {
        let isCreateCartDone = false;

        const handleCreateCart = async () => {
            await createCart();
            isCreateCartDone = true;
        };

        handleCreateCart();

        if (isSuccess && status === "success" && isCreateCartDone) {
            fetchCart();
        }
    }, [order.orderItems]);


    const onChange = (e) => {
        if (listChecked.includes(e.target.value)) {
            const newListChecked = listChecked.filter((item) => item !== e.target.value)
            setListChecked(newListChecked)
        } else {
            setListChecked([...listChecked, e.target.value])
        }
    }

    const handleChangeCount = (type, sizeId) => {
        if (type === 'increase') {
            dispatch(increaseAmount({ sizeId }))
        } else {
            dispatch(decreaseAmount({ sizeId }))
        }
    }
    const handleDeleteOrder = (sizeId) => {
        dispatch(removeOrderProduct({ sizeId }))
    }

    const handleRemoveAllOrder = () => {
        if (listChecked?.length > 0) {
            dispatch(removeAllOrderProduct({ listChecked }))
        }
    }

    const handleChangeAddress = () => {
        setIsOpenModalUpdateInfo(true)
    }
    const priceMemo = useMemo(() => {
        const result = order?.orderItemsSelected?.reduce((total, cur) => {
            return total + ((cur.price * cur.amount))
        }, 0)
        return result
    }, [order])

    const priceDiscountMemo = useMemo(() => {
        const result = order?.orderItemsSelected?.reduce((total, cur) => {
            return total + ((cur.discount * cur.amount))
        }, 0)
        if (Number(result)) {
            return result
        }
        return 0
    }, [order])

    const diliveryPriceMemo = useMemo(() => {
        // console.log(priceMemo)
        if (priceMemo <= 500000 && priceMemo > 0) {
            return 30000
        } else if (priceMemo > 500000 || priceMemo === 0) {
            return 0
        }
    }, [priceMemo])
    const totalPriceMemo = useMemo(() => {
        return Number(priceMemo) - Number(priceDiscountMemo) + Number(diliveryPriceMemo)
    }, [priceMemo, priceDiscountMemo, diliveryPriceMemo])

    const handleOnchangeCheckAll = (e) => {
        if (e.target.checked) {
            const newListChecked = []
            order?.orderItems?.forEach((item) => {
                newListChecked.push(item?.sizeId)
            })
            setListChecked(newListChecked)
        } else {
            setListChecked([])
        }
    }
    useEffect(() => {
        dispatch(selectedOrder({ listChecked }))
    }, [listChecked])

    useEffect(() => {
        form.setFieldsValue(stateUserDetails)
    }, [form, stateUserDetails])

    useEffect(() => {
        if (isOpenModalUpdateInfo) {
            setStateUserDetails({
                city: user?.city,
                name: user?.name,
                address: user?.address,
                phone: `0${user?.phone}`
            })
        }
    }, [isOpenModalUpdateInfo])

    const handleAddCard = () => {
        if (!order?.orderItemsSelected?.length) {
            message.error('Vui lòng chọn sản phẩm')
        } else if (!user?.phone || !user.address || !user.name) {
            setIsOpenModalUpdateInfo(true)
        } else {
            navigate('/payment')
        }
    }

    const mutationUpdate = useMutationHook(
        (data) => {
            const { id,
                token,
                ...rests } = data
            const res = UserService.updateUser(
                id,
                { ...rests }, token)
            return res
        },
    )
    const { isPending, data } = mutationUpdate

    const handleCancleUpdate = () => {
        setIsOpenModalUpdateInfo(false)
        setStateUserDetails({
            name: '',
            phone: '',
            address: '',
            // city: ''
        })
    }
    const handleUpdateInforUser = () => {
        const { name, address, phone } = stateUserDetails
        if (name && address && phone) {
            mutationUpdate.mutate({ id: user?.id, token: user?.access_token, ...stateUserDetails }, {
                onSuccess: () => {
                    dispatch(updateUser({ name, address, phone }))
                    setIsOpenModalUpdateInfo(false)
                }
            })
        }
    }


    const handleOnchangeDetails = (e) => {
        setStateUserDetails({
            ...stateUserDetails,
            [e.target.name]: e.target.value
        })
    }
    const itemsDelivery = [
        {
            title: '30.000 VND',
            description: 'Dưới 500.000 VND',
        },
        {
            title: 'Free ship',
            description: 'Trên 500.000 VND',
        },
    ]

    return (
        <div style={{ background: '#f5f5fa', with: '100%', height: '100vh' }}>
            <div style={{ height: '100%', width: '1270px', margin: '0 auto' }}>
                <h3 style={{ fontWeight: 'bold' }}>Giỏ hàng</h3>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <WrapperLeft>
                        {/* <h4>Phí giao hàng</h4> */}
                        <WrapperStyleHeaderDilivery>
                            <StepComponent
                                items={itemsDelivery}
                                current={diliveryPriceMemo === 30000 ? 0 : order?.orderItemsSelected.length === 0 ? "" : 1}
                            />
                        </WrapperStyleHeaderDilivery>
                        <WrapperStyleHeader>
                            <span style={{ display: 'inline-block', width: '390px' }}>
                                <CustomCheckbox
                                    onChange={handleOnchangeCheckAll}
                                    checked={listChecked?.length === order?.orderItems?.length && listChecked?.length > 0}
                                ></CustomCheckbox>
                                <span> Tất cả
                                    ({order?.orderItems?.length} sản phẩm)
                                </span>
                            </span>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>Đơn giá</span>
                                <span>Màu sắc</span>
                                <span>Size</span>
                                <span>Số lượng</span>
                                <span>Thành tiền</span>
                                <DeleteOutlined style={{ cursor: 'pointer' }}
                                    onClick={handleRemoveAllOrder}
                                />
                            </div>
                        </WrapperStyleHeader>
                        <WrapperListOrder>
                            {order?.orderItems?.map((order) => {
                                return (
                                    <WrapperItemOrder key={order?.product}>
                                        <div style={{ width: '390px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CustomCheckbox
                                                onChange={onChange}
                                                value={order?.sizeId}
                                                checked={listChecked.includes(order?.sizeId)}
                                            ></CustomCheckbox>
                                            <img
                                                src={order?.image}
                                                style={{ width: '77px', height: '79px', objectFit: 'cover' }} />
                                            <div style={{
                                                width: 260,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {order?.name}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>
                                                <span style={{ fontSize: '13px', color: '#242424' }}>
                                                    {convertPrice(order?.price)}
                                                </span>
                                            </span>
                                            <span>
                                                <span style={{ fontSize: '13px', color: '#242424' }}>
                                                    {order?.color === "black" ? "Đen" : order?.color === 'white' ? "Trắng" : order?.color === "green" ? "Xanh" : order?.color === 'pink' ? "Hồng" : ''}
                                                </span>
                                            </span>
                                            <span>
                                                <span style={{ fontSize: '13px', color: '#242424' }}>
                                                    {order?.size}
                                                </span>
                                            </span>
                                            <WrapperCountOrder>
                                                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                                                    onClick={() => handleChangeCount('decrease', order?.sizeId)}
                                                >
                                                    <MinusOutlined style={{ color: '#000', fontSize: '10px' }} />
                                                </button>
                                                <WrapperInputNumber
                                                    defaultValue={order?.amount}
                                                    value={order?.amount}
                                                    size="small" min={1} />
                                                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                                                    onClick={() => handleChangeCount('increase', order?.sizeId)}
                                                >
                                                    <PlusOutlined style={{ color: '#000', fontSize: '10px' }} />
                                                </button>
                                            </WrapperCountOrder>
                                            <span style={{ color: 'rgb(255, 66, 78)', fontSize: '13px', fontWeight: 500 }}>
                                                {convertPrice(order?.price * order?.amount)}
                                            </span>
                                            <DeleteOutlined style={{ cursor: 'pointer' }}
                                                onClick={() => handleDeleteOrder(order?.sizeId)}
                                            />
                                        </div>
                                    </WrapperItemOrder>
                                )
                            })}
                        </WrapperListOrder>
                    </WrapperLeft>
                    <WrapperRight>
                        <div style={{ width: '100%' }}>
                            <WrapperInfo>
                                <div>
                                    <span>Địa chỉ: </span>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {user?.address} {' '}
                                    </span>
                                    <span
                                        onClick={handleChangeAddress}
                                        style={{ color: '#9255FD', cursor: 'pointer' }}>Thay đổi</span>
                                </div>
                            </WrapperInfo>
                            <WrapperInfo>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>Tạm tính</span>
                                    <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                                        {convertPrice(priceMemo)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>Giảm giá</span>
                                    <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                                        {`${(priceDiscountMemo)} %`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span>Phí giao hàng</span>
                                    <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>
                                        {convertPrice(diliveryPriceMemo)}
                                    </span>
                                </div>
                            </WrapperInfo>
                            <WrapperTotal>
                                <span>Tổng tiền</span>
                                <span style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ color: 'rgb(254, 56, 52)', fontSize: '24px', fontWeight: 'bold' }}>
                                        {convertPrice(totalPriceMemo)}
                                    </span>
                                    <span style={{ color: '#000', fontSize: '11px' }}>(Đã bao gồm VAT nếu có)</span>
                                </span>
                            </WrapperTotal>
                        </div>
                        <ButtonComponent
                            onClick={() => handleAddCard()}
                            size={40}
                            styleButton={{
                                background: 'rgb(255, 57, 69)',
                                height: '48px',
                                width: '320px',
                                border: 'none',
                                borderRadius: '4px'
                            }}
                            label={'Mua hàng'}
                            styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                        ></ButtonComponent>
                    </WrapperRight>
                </div>
            </div>
            <ModalComponent title="Cập nhật thông tin giao hàng" open={isOpenModalUpdateInfo} onCancel={handleCancleUpdate} onOk={handleUpdateInforUser}>
                <Loading isPending={isPending}>
                    <Form
                        form={form}
                        name="basic"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        // onFinish={onUpdateUser}
                        autoComplete="on"

                    >
                        <Form.Item
                            label="Tên người nhận hàng"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng điền vào trường này' }]}
                        >
                            <InputComponent value={stateUserDetails['name']} onChange={handleOnchangeDetails} name="name" />
                        </Form.Item>
                        {/* <Form.Item
                            label="Thành phố"
                            name="city"
                            rules={[{ required: true, message: 'Vui lòng điền vào trường này!' }]}
                        >
                            <InputComponent value={stateUserDetails['city']} onChange={handleOnchangeDetails} name="city" />
                        </Form.Item> */}
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[{ required: true, message: 'Vui lòng điền vào trường này' }]}
                        >
                            <InputComponent value={stateUserDetails.phone} onChange={handleOnchangeDetails} name="phone" />
                        </Form.Item>

                        <Form.Item
                            label="Địa chỉ nhận hàng"
                            name="address"
                            rules={[{ required: true, message: 'Vui lòng điền vào trường này' }]}
                        >
                            <InputComponent value={stateUserDetails.address} onChange={handleOnchangeDetails} name="address" />
                        </Form.Item>
                    </Form>
                </Loading>
            </ModalComponent>
        </div>
    );
}

export default OrderPage;