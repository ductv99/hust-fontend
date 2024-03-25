import React from "react";
import { Badge, Col, Popover } from 'antd';
import { useState, useEffect } from 'react';
import { WrapperHeader, WrapperTextHeader, WrraperTextHeaderSmall, WrapperContentPopup, WrraperAccountHeader } from './styled'
import { UserOutlined, ShoppingCartOutlined, CaretDownOutlined } from '@ant-design/icons';
import ButtonInputSearch from "../ButtonInputSearch/ButtonInputSearch";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import *as UserService from "../../service/UserService"
import { useDispatch } from 'react-redux'
import { resetUser } from "../../redux/slides/userSile";
import Loading from "../Loading/Loading";
import { searchProduct } from "../../redux/slides/productSlide";
import { resetCart } from "../../redux/slides/orderSlice";



const Header = ({ isHisddensearch = false, isHisddenCart = false }) => {
    const navigate = useNavigate()
    const user = useSelector((state) => state.user)
    const order = useSelector((state) => state?.order)
    const [userName, setUserName] = useState('')
    const [isOpenPopup, setIsOpenPopup] = useState(false)
    const [imageUser, setImageUser] = useState('')
    const [search, setSearch] = useState('')
    const [countCart, setCountCart] = useState('')
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const handleNavLogin = () => {
        navigate('/sign-in')
    }
    const handleLogout = async () => {
        setLoading(true)
        dispatch(resetUser())
        dispatch(resetCart())
        await UserService.logoutUser()
        localStorage.clear()
        navigate('/')
        setLoading(false)

    }

    useEffect(() => {
        setLoading(true)
        setUserName(user?.name)
        setImageUser(user?.avatar)
        setCountCart(order?.orderItems?.length)
        setLoading(true)
    }, [user?.name, user?.avatar])

    const onSearch = (e) => {
        setSearch(e.target.value)
        dispatch(searchProduct(e.target.value))
    }
    const content = (
        <div>
            {user?.isAdmin && (
                <WrapperContentPopup onClick={() => handleClickNav('admin')}>
                    Quản lý hệ thống
                </WrapperContentPopup>
            )}
            <WrapperContentPopup onClick={() => handleClickNav('profile')}>
                Chỉnh sửa thông tin
            </WrapperContentPopup>
            <WrapperContentPopup onClick={() => handleClickNav('my-order')}>
                Đơn hàng đã đặt
            </WrapperContentPopup>
            <WrapperContentPopup onClick={() => handleClickNav('log-out')}>
                Đăng xuất
            </WrapperContentPopup>
        </div>
    );
    const handleClickNav = (type) => {
        switch (type) {
            case 'admin':
                navigate("/system/admin")
                setIsOpenPopup(false)
                break
            case 'profile':
                navigate("/profile-user")
                setIsOpenPopup(false)
                break
            case 'my-order':
                navigate("/my-order", {
                    state: {
                        id: user?.id,
                        token: user?.access_token
                    }
                })
                setIsOpenPopup(false)
                break
            case 'log-out':
                handleLogout()
                setIsOpenPopup(false)
            default:
                setIsOpenPopup(false)
        }


        // if (type === 'profile') {
        //     navigate("/profile-user")
        // } else if (type === 'admin') {
        //     navigate("/system/admin")
        // } else if (type === 'my-order') {
        //     navigate("/my-order", {
        //         state: {
        //             id: user?.id,
        //             token: user?.access_token
        //         }
        //     })
        // } else {
        //     handleLogout()
        // }

    }

    const openPup = () => {
        if (isOpenPopup) {
            setIsOpenPopup(false)
        } else {
            setIsOpenPopup(true)
        }
    }
    return (
        <div style={{ heiht: '100%', width: '100%', display: 'flex', background: 'rgb(26,148,255)', justifyContent: 'center' }}>
            <WrapperHeader style={{ justifyContent: isHisddensearch && isHisddenCart ? 'space-between' : 'unset' }}>
                <Col span={5}>
                    <WrapperTextHeader onClick={() => navigate('/')}>
                        <span className="self-center text-4xl font-semibold" style={{ fontFamily: 'Redressed, sans-serif' }}>LD Store</span>
                    </WrapperTextHeader>
                </Col>
                {!isHisddensearch && <Col span={13} style={{ marginLeft: '150px' }}>
                    <ButtonInputSearch
                        size="large"
                        bordered={false}
                        // textbutton="Tìm kiếm"
                        placeholder="Tìm kiếm"
                        // backgroundColorButton="#5a20c1"
                        onChange={onSearch}
                    />
                </Col>}
                <Col span={6} style={{ display: 'flex', gap: '54px', alignItems: 'center' }}>
                    <Loading isPending={loading}>
                        <WrraperAccountHeader>
                            {imageUser ? (
                                <img src={imageUser} style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <UserOutlined style={{ fontSize: '3-px' }} />
                            )}
                            {user?.access_token ? (
                                <>
                                    <Popover content={content} trigger='click' open={isOpenPopup}>
                                        <div style={{ cursor: 'pointer' }} onClick={() => openPup()}>{userName?.length ? userName : user?.email}</div>
                                    </Popover>
                                </>
                            ) : (
                                <div onClick={handleNavLogin} style={{ cursor: 'pointer' }}>
                                    <span>Đăng nhập/Đăng ký</span>
                                    <div>
                                        <span>Tài khoản</span>
                                        <CaretDownOutlined />
                                    </div>
                                </div>
                            )}
                        </WrraperAccountHeader>
                    </Loading>
                    {!isHisddenCart && <div onClick={() => navigate('/order')} style={{ cursor: 'pointer' }}>
                        <Badge count={countCart} size="small">
                            <ShoppingCartOutlined style={{ fontSize: '30px', color: '#fff' }} />
                        </Badge>
                        <WrraperTextHeaderSmall>Giỏ hàng</WrraperTextHeaderSmall>
                    </div>}
                </Col>
            </WrapperHeader>
        </div>);
}

export default Header;