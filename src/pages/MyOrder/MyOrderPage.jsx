import React, { useEffect, useMemo, useState } from "react";
import { WrapperFooterItem, WrapperStatus, WrapperContainer, WrapperItemOrder, WrapperHeaderItem, WrapperListOrder, WrapperRight, WrapperStyleHeader, WrapperStyleHeaderDilivery, WrapperTotal } from './styled';
import { useQuery } from "@tanstack/react-query";
import * as OrderService from '../../service/OrderService'
import { useSelector } from "react-redux";
import Loading from "../../components/Loading/Loading";
import { convertPrice } from "../../untils";
import * as message from '../../components/Message/Message'
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutationHook } from "../../hook/userMutationHook";
const MyOrderPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)
    const { state } = location
    const fetchMyOrder = async () => {
        const res = await OrderService.getOrderByUserId(state?.id, state?.token);
        return res.data;
    };
    const queryOrder = useQuery({
        queryKey: ['order'],
        queryFn: fetchMyOrder,
    });

    // if (state?.id && state?.token) {
    //     queryOrder()
    // }

    const mutation = useMutationHook(
        (data) => {
            const { id, token, orderItems, userId } = data
            const res = OrderService.cancelOrder(id, token, orderItems, userId)
            return res
        }
    )
    const { isPending, data } = queryOrder
    const handleCanceOrder = (order) => {
        mutation.mutate({ id: order._id, token: state?.token, orderItems: order?.orderItems, userId: user.id }, {
            onSuccess: () => {
                queryOrder.refetch()
            },
        })
    }

    const { isPending: isLoadingCancel, isSuccess: isSuccessCancel, isError: isErrorCancle, data: dataCancel } = mutation

    useEffect(() => {
        if (isSuccessCancel && dataCancel?.status === 'OK') {
            message.success()
        } else if (isSuccessCancel && dataCancel?.status === 'ERR') {
            message.error(dataCancel?.message)
        } else if (isErrorCancle) {
            message.error()
        }
    }, [isErrorCancle, isSuccessCancel])

    const handleDetailsOrder = (id) => {
        navigate(`/details-order/${id}`)
    }
    const renderProduct = (data) => {
        return data?.map((order) => {
            return <WrapperHeaderItem key={order?._id}>
                <img src={order?.image}
                    style={{
                        width: '70px',
                        height: '70px',
                        objectFit: 'cover',
                        border: '1px solid rgb(238, 238, 238)',
                        padding: '2px'
                    }}
                />
                <div style={{
                    width: 260,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginLeft: '10px',
                    marginTop: '20px'
                }}>{order?.name}</div>
                <span style={{ fontSize: '13px', color: '#242424', marginTop: '20px', marginLeft: 'auto' }}><span style={{ fontWeight: "bold" }}>Màu sắc:</span>{order?.color === "black" ? "Đen" : order?.color === 'white' ? "Trắng" : order?.color === "green" ? "Xanh" : order?.color === 'pink' ? "Hồng" : ''}</span>
                <span style={{ fontSize: '13px', color: '#242424', marginTop: '20px', marginLeft: 'auto' }}><span style={{ fontWeight: "bold" }}>Size: </span>{order?.size}</span>
                <span style={{ fontSize: '13px', color: '#242424', marginTop: '20px', marginLeft: 'auto' }}><span style={{ fontWeight: "bold" }}>Số lượng: </span>{order?.amount}</span>
                <span style={{ fontSize: '13px', color: '#242424', marginTop: '20px', marginLeft: 'auto' }}><span style={{ fontWeight: "bold" }}>Đơn giá: </span>{convertPrice(order?.price)}</span>
            </WrapperHeaderItem>
        })
    }
    return (
        <Loading isPending={isPending}>
            <WrapperContainer>
                <div style={{ height: '100%', width: '1270px', margin: '0 auto' }}>
                    <h4 style={{ fontWeight: 'bold' }}>Đơn hàng của tôi</h4>
                    <WrapperListOrder>
                        {data?.map((order) => {
                            // console.log(order)
                            return (
                                < WrapperItemOrder key={order?._id
                                }>
                                    <WrapperStatus>
                                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Trạng thái</span>
                                        {order?.statusOrder === true ?
                                            <span style={{ color: 'red' }}>
                                                Đơn hàng đã bị hủy
                                            </span>
                                            :
                                            <>
                                                <div>
                                                    <span style={{ color: 'rgb(255, 66, 78)' }}>Giao hàng: </span>
                                                    <span style={{ color: 'rgb(90, 32, 193)', fontWeight: 'bold' }}>{`${order.isDelivered ? 'Đã giao hàng' : 'Chưa giao hàng'}`}</span>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'rgb(255, 66, 78)' }}>Thanh toán: </span>
                                                    <span style={{ color: 'rgb(90, 32, 193)', fontWeight: 'bold' }}>{`${order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}`}</span>
                                                </div>
                                            </>
                                        }
                                    </WrapperStatus>
                                    {renderProduct(order?.orderItems)}
                                    <WrapperFooterItem>
                                        <div>
                                            <span style={{ color: 'rgb(255, 66, 78)', fontWeight: 'bold' }}>Tổng tiền: </span>
                                            <span
                                                style={{ fontSize: '13px', color: 'rgb(56, 56, 61)' }}
                                            >{convertPrice(order?.totalPrice)}</span>
                                        </div>

                                        {order?.statusOrder != true &&
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <ButtonComponent
                                                    onClick={() => handleCanceOrder(order)}
                                                    size={40}
                                                    styleButton={{
                                                        height: '36px',
                                                        border: '1px solid #9255FD',
                                                        borderRadius: '4px'
                                                    }}
                                                    label={'Hủy đơn hàng'}
                                                    styleTextButton={{ color: '#9255FD', fontSize: '14px' }}
                                                >
                                                </ButtonComponent>
                                                <ButtonComponent
                                                    onClick={() => handleDetailsOrder(order?._id)}
                                                    size={40}
                                                    styleButton={{
                                                        height: '36px',
                                                        border: '1px solid #9255FD',
                                                        borderRadius: '4px'
                                                    }}
                                                    label={'Xem chi tiết'}
                                                    styleTextButton={{ color: '#9255FD', fontSize: '14px' }}
                                                >
                                                </ButtonComponent>
                                            </div>
                                        }
                                    </WrapperFooterItem>
                                </WrapperItemOrder>
                            )
                        })}
                    </WrapperListOrder>
                </div>
            </WrapperContainer>
        </Loading >
    );
}

export default MyOrderPage;