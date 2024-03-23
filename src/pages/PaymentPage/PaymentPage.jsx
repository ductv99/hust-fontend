import { Form, Radio } from 'antd'
import React, { useEffect, useState } from 'react'
import { Lable, WrapperInfo, WrapperLeft, WrapperRadio, WrapperRight, WrapperTotal } from './styled';

import ButtonComponent from '../../components/ButtonComponent/ButtonComponent';
import { useDispatch, useSelector } from 'react-redux';
import { convertPrice } from "../../untils";
import { useMemo } from 'react';
import ModalComponent from '../../components/ModalComponent/ModalComponent';
import InputComponent from '../../components/InputComponent/InputComponent';
import { useMutationHook } from "../../hook/userMutationHook";
import * as  UserService from '../../service/UserService'
import * as OrderService from '../../service/OrderService'
import * as PaymentService from '../../service/PaymentService'
import Loading from '../../components/Loading/Loading';
import * as message from '../../components/Message/Message'
import { updateUser } from "../../redux/slides/userSile";
import { useNavigate } from 'react-router-dom';
import { removeAllOrderProduct } from '../../redux/slides/orderSlice';
import { PayPalButton } from 'react-paypal-button-v2';


const PaymentPage = () => {
    const order = useSelector((state) => state.order)
    const user = useSelector((state) => state.user)
    const navigate = useNavigate()
    const [delivery, setDelivery] = useState('fast')
    const [payment, setPayment] = useState('later_money')
    const [sdkReady, setSdkReady] = useState(false)


    const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false)
    const [stateUserDetails, setStateUserDetails] = useState({
        name: '',
        phone: '',
        address: '',
    })
    const [form] = Form.useForm();

    const dispatch = useDispatch()



    useEffect(() => {
        form.setFieldsValue(stateUserDetails)
    }, [form, stateUserDetails])

    useEffect(() => {
        if (isOpenModalUpdateInfo) {
            setStateUserDetails({
                name: user?.name,
                address: user?.address,
                phone: `0${user?.phone}`
            })
        }
    }, [isOpenModalUpdateInfo])

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
        console.log(priceMemo)
        if (priceMemo <= 500000 && priceMemo > 0) {
            return 30000
        } else if (priceMemo > 500000 || priceMemo === 0) {
            return 0
        }
    }, [priceMemo])

    const totalPriceMemo = useMemo(() => {
        return Number(priceMemo) - Number(priceDiscountMemo) + Number(diliveryPriceMemo)
    }, [priceMemo, priceDiscountMemo, diliveryPriceMemo])

    const handleAddOrder = () => {
        if (user?.access_token && order?.orderItemsSelected && user?.name && user?.address && user?.phone && user?.id && priceMemo) {
            mutationAddOrder.mutate({
                token: user?.access_token, ...stateUserDetails, orderItems: order?.orderItemsSelected,
                fullName: user?.name, address: user?.address, phone: user?.phone,
                paymentMethod: payment, itemsPrice: priceMemo, shippingPrice: diliveryPriceMemo,
                totalPrice: totalPriceMemo, user: user?.id, email: user?.email
            })
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
    const mutationAddOrder = useMutationHook(
        (data) => {
            const {
                token,
                ...rests } = data
            const res = OrderService.createOrder(
                { ...rests }, token)
            return res
        },
    )

    const { isPending, data } = mutationUpdate
    const { data: dataAdd, isPending: isLoadingAddOrder, isSuccess, isError } = mutationAddOrder
    useEffect(() => {
        if (isSuccess && dataAdd?.status === 'success') {
            const arrOrder = []
            order?.orderItemsSelected?.forEach(element => {
                arrOrder.push(element.sizeId)
            });
            dispatch(removeAllOrderProduct({ listChecked: arrOrder }))
            message.success('Đặt hàng thành công')
            navigate('/orderSuccess', {
                state: {
                    delivery,
                    payment,
                    orders: order?.orderItemsSlected,
                    totalPriceMemo: totalPriceMemo
                }
            })
        } else if (isError) {
            message.error()
        }
    }, [isSuccess, isError])

    const handleCancleUpdate = () => {
        setStateUserDetails({
            name: '',
            email: '',
            phone: '',
            isAdmin: false,
        })
        form.resetFields()
        setIsOpenModalUpdateInfo(false)
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
    const handleDilivery = (e) => {
        setDelivery(e.target.value)
    }

    const handlePayment = (e) => {
        setPayment(e.target.value)
    }

    const addPaypalScript = async () => {
        const { data } = await PaymentService.getConfig()
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `https://www.paypal.com/sdk/js?client-id=${data}`
        script.async = true
        script.onload = () => {
            setSdkReady(true)
        }
        document.body.appendChild(script)
    }


    useEffect(() => {
        if (!window.paypal) {
            addPaypalScript()
        } else {
            setSdkReady(true)
        }
    }, [])

    const onSuccessPaypal = (details, data) => {
        mutationAddOrder.mutate({
            token: user?.access_token, ...stateUserDetails, orderItems: order?.orderItemsSelected,
            fullName: user?.name, address: user?.address, phone: user?.phone,
            paymentMethod: payment, itemsPrice: priceMemo, shippingPrice: diliveryPriceMemo,
            totalPrice: totalPriceMemo, user: user?.id, isPaid: true, paidAt: details.update_time,
            email: user?.email
        })
    }
    return (
        <div style={{ background: '#f5f5fa', with: '100%', height: '100vh' }}>
            <Loading isPending={isLoadingAddOrder}>
                <div style={{ height: '100%', width: '1270px', margin: '0 auto' }}>
                    <h3 style={{ fontWeight: 'bold' }}>Thanh toán</h3>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <WrapperLeft>
                            <WrapperInfo>
                                <div>
                                    <Lable>Chọn phương thức giao hàng</Lable>
                                    <WrapperRadio onChange={handleDilivery} value={delivery}>
                                        <Radio value="fast"><span style={{ color: '#ea8500', fontWeight: 'bold' }}>FAST</span> Giao hàng tiết kiệm</Radio>
                                        <Radio value="gojek"><span style={{ color: '#ea8500', fontWeight: 'bold' }}>GO_JEK</span> Giao hàng tiết kiệm</Radio>
                                    </WrapperRadio>
                                </div>
                            </WrapperInfo>
                            <WrapperInfo>
                                <div>
                                    <Lable>Chọn phương thức thanh toán</Lable>
                                    <WrapperRadio onChange={handlePayment} value={payment}>
                                        <Radio value="later_money"> Thanh toán tiền mặt khi nhận hàng</Radio>
                                        <Radio value="paypal"> Thanh toán tiền bằng paypal</Radio>
                                    </WrapperRadio>
                                </div>
                            </WrapperInfo>
                        </WrapperLeft>
                        <WrapperRight>
                            <div style={{ width: '100%' }}>
                                <WrapperInfo>
                                    <div>
                                        <span>Địa chỉ: </span>
                                        <span style={{ fontWeight: 'bold' }}>{user?.address} </span>
                                        <span onClick={handleChangeAddress} style={{ color: '#9255FD', cursor: 'pointer' }}>Thay đổi</span>
                                    </div>
                                </WrapperInfo>
                                <WrapperInfo>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>Tạm tính</span>
                                        <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>{convertPrice(priceMemo)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>Giảm giá</span>
                                        <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>{convertPrice(priceDiscountMemo)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>Phí giao hàng</span>
                                        <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold' }}>{convertPrice(diliveryPriceMemo)}</span>
                                    </div>
                                </WrapperInfo>
                                <WrapperTotal>
                                    <span>Tổng tiền</span>
                                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: 'rgb(254, 56, 52)', fontSize: '24px', fontWeight: 'bold' }}>{convertPrice(totalPriceMemo)}</span>
                                        <span style={{ color: '#000', fontSize: '11px' }}>(Đã bao gồm VAT nếu có)</span>
                                    </span>
                                </WrapperTotal>
                            </div>
                            {payment === 'paypal' && sdkReady ? (
                                <div style={{ width: '320px' }}>
                                    <p>Quy đổi (USD): {(totalPriceMemo / 23000).toFixed(2)} $</p>
                                    <PayPalButton
                                        amount={(totalPriceMemo / 23000).toFixed(2)}
                                        // shippingPreference="NO_SHIPPING" // default is "GET_FROM_FILE"
                                        onSuccess={onSuccessPaypal}
                                        onError={() => {
                                            alert("Error ")
                                        }}
                                    />
                                </div>
                            ) : (
                                <ButtonComponent
                                    onClick={() => handleAddOrder()}
                                    size={40}
                                    styleButton={{
                                        background: 'rgb(255, 57, 69)',
                                        height: '48px',
                                        width: '320px',
                                        border: 'none',
                                        borderRadius: '4px'
                                    }}
                                    label={'Đặt hàng'}
                                    styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                                ></ButtonComponent>
                            )}
                        </WrapperRight>
                    </div>
                </div>
                <ModalComponent title="Cập nhật thông tin giao hàng" open={isOpenModalUpdateInfo} onCancel={handleCancleUpdate} onOk={handleUpdateInforUser}>
                    <Loading isPending={isPending}>
                        <Form
                            name="basic"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            // onFinish={onUpdateUser}
                            autoComplete="on"
                            form={form}
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
            </Loading>
        </div>
    )
}

export default PaymentPage