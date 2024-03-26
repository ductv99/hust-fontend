import React, { useState, useEffect } from "react";
import { Col, Row } from "antd";
import { StarFilled, PlusOutlined, MinusOutlined } from "@ant-design/icons"
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import {
    WrapperStyleNameProduct,
    WrapperStyleTextSell,
    WrapperPriceProduct,
    WrapperPriceTextProduct,
    WrapperAddressProduct,
    WrapperQualityProduct,
    WrapperInputNumber
} from './styled'
import { useDispatch, useSelector } from "react-redux";
import * as ProductService from '../../service/ProductService'
import { useQuery } from "@tanstack/react-query";
import Loading from "../../components/Loading/Loading";
import { useLocation, useNavigate } from "react-router-dom";
import { addOrderProduct, resetCart } from "../../redux/slides/orderSlice";
import { convertPrice } from "../../untils";
import * as message from '../../components/Message/Message'
import { useMutationHook } from "../../hook/userMutationHook";
import * as OrderService from '../../service/OrderService'

const ProductDetails = ({ idProduct }) => {
    const navigate = useNavigate()
    const order = useSelector((state) => state.order)
    const location = useLocation()
    const [numberProduct, setNumberProduct] = useState(0)
    const user = useSelector((state) => state?.user)
    // const order = useSelector((state) => state.order)
    const dispatch = useDispatch()
    const onChange = (value) => {
        setNumberProduct(Number(value))
    }
    const fetchGetDetailProduct = async (idProduct) => {
        const id = idProduct?.queryKey && idProduct.queryKey[1]
        const res = await ProductService.getDetailProduct(id)
        return res.data
    }
    const handleChangeCount = (type) => {
        if (type === 'increase') {
            setNumberProduct(numberProduct + 1)
        }
        else if (type === 'decrease' && numberProduct > 1) {
            setNumberProduct(numberProduct - 1)
        }
    }

    const { isLoading, data: productDetail } = useQuery({
        queryKey: ['productDetail', idProduct],
        queryFn: fetchGetDetailProduct,
        enabled: !!idProduct
    });
    const renderStars = (num) => {
        const stars = [];
        for (let i = 0; i < num; i++) {
            stars.push(<StarFilled key={i} style={{ fontSize: '12px', color: 'rgb(253,216,54)' }} />);
        }
        return stars;
    };
    const handleAddOrderProduct = () => {
        let checkRq = true
        if (!user?.id) {
            navigate('/sign-in', { state: location.pathname })
            checkRq = false
        } else if (!selectedColor) {
            checkRq = false
            message.success('Vui lòng chọn màu sắc')
        } else if (!selectedSize) {
            checkRq = false
            message.success('Vui lòng chọn size')
        } else if (numberProduct <= 0) {
            checkRq = false
            message.success('Nhập số lượng')
        }

        if (checkRq) {
            let sizeId = null
            productDetail?.countInStock.forEach(item => {
                if (item.color === selectedColor) {
                    item.sizes.forEach(size => {
                        if (size.size === selectedSize) {
                            sizeId = size._id
                        }
                    })
                }
            })
            dispatch(addOrderProduct({
                orderItem: {
                    name: productDetail?.name,
                    amount: numberProduct,
                    image: productDetail?.image[0],
                    price: productDetail?.price,
                    product: productDetail?._id,
                    discount: productDetail?.discount,
                    sizeId: sizeId,
                    color: selectedColor,
                    size: selectedSize
                }
            }
            ))
            message.success('Đã thêm vào giỏ hàng')
        }
    }
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
        createCart()
        if (isSuccess && status === "success") {
            fetchCart()
        }
    }, [order])


    const [selectedImage, setSelectedImage] = useState(productDetail?.image[0]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const [selectedColor, setSelectedColor] = useState(productDetail?.countInStock[0].color);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedSize, setSelectedSize] = useState(null);
    const handleColorClick = (color, sizes) => {
        setSelectedColor(color);
        setSelectedSizes(sizes)
    };

    const handleSizeClick = (size) => {
        setSelectedSize(size);
    };
    let qty;
    return (
        <Loading isPending={isLoading}>
            <Row style={{ padding: '16px', background: '#fff', borderRadius: '4px', height: 'fit-content', width: '1280px', margin: 'auto' }}>
                {/* <Col span={10} style={{ borderRight: '1px solid #e5e5e5', paddingRight: '8px' }}>
                    <Image src={productDetail?.image[0]} alt='product' preview={false} style={{ width: "400px", height: "500px" }} />
                    <Row style={{ paddingTop: '10px', justifyContent: 'space-between' }}>
                        <WrapperStyleColImage>
                            <WrapperStyleImageSmall src={imageTest} alt='product' preview="false" />
                        </WrapperStyleColImage>
                        <WrapperStyleColImage>
                            <WrapperStyleImageSmall src={imageTest} alt='product' preview="false" />
                        </WrapperStyleColImage>
                        <WrapperStyleColImage>
                            <WrapperStyleImageSmall src={imageTest} alt='product' preview="false" />
                        </WrapperStyleColImage>
                        <WrapperStyleColImage>
                            <WrapperStyleImageSmall src={imageTest} alt='product' preview="false" />
                        </WrapperStyleColImage>
                        <WrapperStyleColImage>
                            <WrapperStyleImageSmall src={imageTest} alt='product' preview="false" />
                        </WrapperStyleColImage>
                        <WrapperStyleColImage>
                            <WrapperStyleImageSmall src={imageTest} alt='product' preview="false" />
                        </WrapperStyleColImage>
                    </Row>
                </Col> */}
                <Col span={10} style={{ borderRight: '1px solid #e5e5e5', paddingRight: '8px' }}>
                    {selectedImage ? (
                        <img src={selectedImage} alt='product' style={{ width: "400px", height: "500px", margin: 'auto' }} />
                    ) : (
                        <img src={productDetail?.image[0]} alt='product' style={{ width: "400px", height: "500px", margin: 'auto' }} />
                    )}
                    <Row style={{ paddingTop: '10px', justifyContent: 'space-between' }}>
                        {productDetail?.image.map((image, index) => (
                            <div key={index} onClick={() => handleImageClick(image)}>
                                <img style={{ width: '72px', height: '72px' }} src={image} alt='product' />
                            </div>
                        ))}
                    </Row>
                </Col>
                <Col span={14} style={{ paddingLeft: '10px' }}>
                    <WrapperStyleNameProduct>{productDetail?.name}</WrapperStyleNameProduct>
                    <div>
                        {renderStars(productDetail?.rating)} {' '}
                        <WrapperStyleTextSell>| Đã bán {productDetail?.selled ? productDetail?.selled : 0}+</WrapperStyleTextSell>
                    </div>
                    <WrapperPriceProduct>
                        <WrapperPriceTextProduct>
                            {convertPrice(productDetail?.price)}
                        </WrapperPriceTextProduct>
                    </WrapperPriceProduct>
                    <WrapperAddressProduct>
                        <span style={{ fontWeight: 'bold' }}>Giao đến: </span>
                        <span >{user?.address}</span>
                        {/* <span className='change-address'>Đổi địa chỉ</span> */}
                    </WrapperAddressProduct>
                    <div style={{ paddingTop: '20px', borderTop: '1px solid #e5e5e5' }}>
                        <span style={{ fontWeight: 'bold', }}>
                            Mô tả: {' '}
                        </span>
                        {productDetail?.description}
                    </div>

                    <div style={{ padding: '10px 0', borderTop: '1px solid #e5e5e5' }}>
                        <span style={{ fontWeight: 'bold' }}>Màu sắc:</span>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingTop: '5px' }}>
                            {productDetail?.countInStock.map((item) => {
                                return (
                                    item?.sizes?.length != 0 &&
                                    < div
                                        key={item?._id}
                                        style={{
                                            width: '31px',
                                            height: '31px',
                                            border: `1px solid ${selectedColor === item.color ? 'red' : 'rgb(11, 119,226)'}`,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => { handleColorClick(item.color, item.sizes) }}
                                    >
                                        <div
                                            style={{
                                                width: '25px', height: '25px', backgroundColor: item.color
                                            }}>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div style={{ margin: '5px 0 5px', padding: '5px 0', borderTop: '1px solid #e5e5e5' }}>
                        <span style={{ fontWeight: 'bold' }}>Size:</span>
                        <div style={{ display: 'flex', flexDirection: 'row', gap: 10, paddingTop: '5px' }}>
                            {selectedSizes?.map((item) => item.quantity === 0 ? "Sản phẩm tạm thời hết hàng" : <div
                                key={item?._id}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    border: `1px solid ${selectedSize === item.size ? 'red' : 'rgb(11, 119, 226)'}`,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    handleSizeClick(item.size);
                                }}
                            >
                                <div style={{ width: '25px', height: '25px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {item.size}
                                </div>
                            </div>)}
                        </div>
                    </div>

                    <div style={{ margin: '10px 0 20px', padding: '10px 0', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
                        <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>Số lượng: </div>
                        <WrapperQualityProduct>
                            <div>
                                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => handleChangeCount('decrease')}>
                                    <MinusOutlined style={{ color: '#000', fontSize: '20px' }} />
                                </button>
                                <WrapperInputNumber onChange={onChange} size="small" defaultValue={1} value={numberProduct} />
                                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => handleChangeCount('increase')} >
                                    <PlusOutlined style={{ color: '#000', fontSize: '20px' }} />
                                </button>
                            </div>
                        </WrapperQualityProduct>
                        {
                            selectedSizes?.map((item) => item.quantity < numberProduct ? "Sản phẩm không đủ số lượng" : "")
                        }
                    </div>
                    <div style={{ display: 'flex', aliggItems: 'center', gap: '12px' }}>
                        <div>
                            <ButtonComponent
                                size={40}
                                styleButton={{
                                    background: 'rgb(255, 57, 69)',
                                    height: '48px',
                                    width: '220px',
                                    border: 'none',
                                    borderRadius: '4px'
                                }}
                                onClick={handleAddOrderProduct}
                                label={'Chọn mua'}
                                styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                            ></ButtonComponent>
                            {/* {errorLimitOrder && <div style={{ color: 'red' }}>San pham het hang</div>} */}
                        </div>
                        {/* <ButtonComponent
                            size={40}
                            styleButton={{
                                background: '#fff',
                                height: '48px',
                                width: '220px',
                                border: '1px solid rgb(13, 92, 182)',
                                borderRadius: '4px'
                            }}
                            label={'Mua trả sau'}
                            styleTextButton={{ color: 'rgb(13, 92, 182)', fontSize: '15px' }}
                        ></ButtonComponent> */}
                    </div>

                </Col>
            </Row>

        </Loading>
    );
}

export default ProductDetails;