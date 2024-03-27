import React from 'react'
import { WrapperAllPrice, WrapperContentInfo, WrapperHeaderUser, WrapperInfoUser, WrapperItem, WrapperItemLabel, WrapperLabel, WrapperNameProduct, WrapperProduct, WrapperStyleContent } from './style'
import { useLocation, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import * as OrderService from '../../service/OrderService'
import { useQuery } from '@tanstack/react-query'
import { orderContant } from '../../contant'
import { useMemo } from 'react'
import { convertPrice } from '../../untils'
import Loading from '../../components/Loading/Loading'

const DetailsOrderPage = () => {
    const params = useParams()

    const location = useLocation()
    const { state } = location
    const { id } = params

    const fetchDetailsOrder = async () => {
        console.log("deatil", id, state?.token)
        const res = await OrderService.getDetailsOrder(id, state?.token)
        return res.data
    }

    const queryOrder = useQuery({ queryKey: ['orders-details'], queryFn: fetchDetailsOrder })
    const { isPending, data } = queryOrder

    const priceMemo = useMemo(() => {
        const result = data?.orderItems?.reduce((total, cur) => {
            return total + ((cur.price * cur.amount))
        }, 0)
        return result
    }, [data])

    return (
        <Loading isPending={isPending}>
            <div style={{ width: '100%', height: '100vh', background: '#f5f5fa' }}>
                <div style={{ width: '1270px', margin: '0 auto', height: '1270px' }}>
                    <h4 style={{ fontWeight: 'bold' }} >Chi tiết đơn hàng</h4>
                    <WrapperHeaderUser>
                        <WrapperInfoUser>
                            <WrapperLabel>Địa chỉ người nhận</WrapperLabel>
                            <WrapperContentInfo>
                                <div className='name-info'>{data?.shippingAddress?.fullName}</div>
                                <div className='address-info'><span>Địa chỉ: </span> {data?.shippingAddress?.address}</div>
                                <div className='phone-info'><span>Điện thoại: </span> 0{data?.shippingAddress?.phone}</div>
                            </WrapperContentInfo>
                        </WrapperInfoUser>
                        <WrapperInfoUser>
                            <WrapperLabel>Hình thức giao hàng</WrapperLabel>
                            <WrapperContentInfo>
                                <div className='delivery-info'><span className='name-delivery'>FAST </span>Giao hàng tiết kiệm</div>
                                <div className='delivery-fee'><span>Phí giao hàng: </span> {data?.shippingPrice}</div>
                            </WrapperContentInfo>
                        </WrapperInfoUser>
                        <WrapperInfoUser>
                            <WrapperLabel>Hình thức thanh toán</WrapperLabel>
                            <WrapperContentInfo>
                                <div className='payment-info'>{orderContant.payment[data?.paymentMethod]}</div>
                                <div className='status-payment'>{data?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</div>
                            </WrapperContentInfo>
                        </WrapperInfoUser>
                    </WrapperHeaderUser>
                    <WrapperStyleContent>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ width: '670px', fontWeight: 'bold' }}>Sản phẩm</div>
                            <WrapperItemLabel>Màu sắc</WrapperItemLabel>
                            <WrapperItemLabel>Size</WrapperItemLabel>
                            <WrapperItemLabel>Giá</WrapperItemLabel>
                            <WrapperItemLabel>Số lượng</WrapperItemLabel>
                            <WrapperItemLabel>Giảm giá</WrapperItemLabel>
                        </div>
                        {data?.orderItems?.map((order) => {
                            return (
                                <WrapperProduct key={order._id}>
                                    <WrapperNameProduct>
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
                                            marginTop: '20px',
                                            height: '70px',
                                        }}>{order?.name}</div>
                                    </WrapperNameProduct>
                                    <WrapperItem >
                                        {order?.color === "black" ? "Đen" : order?.color === 'white' ? "Trắng" : order?.color === "green" ? "Xanh" : order?.color === 'pink' ? "Hồng" : ''}
                                    </WrapperItem>
                                    <WrapperItem>{order?.size}</WrapperItem>
                                    <WrapperItem>{convertPrice(order?.price)}</WrapperItem>
                                    <WrapperItem>{order?.amount}</WrapperItem>
                                    <WrapperItem>0</WrapperItem>
                                </WrapperProduct>
                            )
                        })}

                        <WrapperAllPrice>
                            <WrapperItemLabel>Tạm tính</WrapperItemLabel>
                            <WrapperItem>{convertPrice(priceMemo)}</WrapperItem>
                        </WrapperAllPrice>
                        <WrapperAllPrice>
                            <WrapperItemLabel>Phí vận chuyển</WrapperItemLabel>
                            <WrapperItem>{convertPrice(data?.shippingPrice)}</WrapperItem>
                        </WrapperAllPrice>
                        <WrapperAllPrice>
                            <WrapperItemLabel>Tổng cộng</WrapperItemLabel>
                            <WrapperItem>{convertPrice(data?.totalPrice)}</WrapperItem>
                        </WrapperAllPrice>
                    </WrapperStyleContent>
                </div>
            </div>
        </Loading>
    )
}

export default DetailsOrderPage