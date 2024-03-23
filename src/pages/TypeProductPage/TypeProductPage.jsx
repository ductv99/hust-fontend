import React, { useEffect, useState } from "react";
import Navbar from '../../components/Navbar/Navbar'
import Card from "../../components/Card/Card";
import { WrapperProducts, WrapperNavbar } from "./styled"
import { Row, Pagination, Col } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import *  as ProductService from "../../service/ProductService"
import Loading from "../../components/Loading/Loading";
import { useSelector } from "react-redux";
import { useDebounce } from "../../hook/useDebounce";


const TypeProductPage = () => {
    const { state } = useLocation()
    const navigate = useNavigate()
    const searchProduct = useSelector((state) => state?.product?.search)
    const searchDebounce = useDebounce(searchProduct, 500)
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState()
    const [panigate, setPanigate] = useState({
        page: 0,
        limit: 10,
        total: 1
    })
    const fetchProductType = async (type, page, limit) => {
        const res = await ProductService.getProductType(type, page, limit)
        if (res?.status === "OK") {
            setIsLoading(true)
            setProducts(res?.data)
            setIsLoading(false)
            setPanigate({ ...panigate, total: res?.totalPage })
        }
    }
    useEffect(() => {
        if (state) {
            fetchProductType(state, panigate.page, panigate.limit)
        }
    }, [state, panigate.page, panigate.limit])

    const onChange = (current, pageSize) => {
        setPanigate({ ...panigate, page: current - 1, limit: pageSize })
    }
    return (
        <Loading isPending={isLoading}>

            <div style={{ width: '100%', background: '#efefef', height: 'calc(100vh - 64px)' }}>
                <div style={{ width: '1270px', margin: '0 auto', height: '100%' }}>
                    <h5><span style={{ cursor: "pointer", fontWeight: 'bold' }} onClick={() => { navigate("/") }}>Trang chủ</span> {'>>'} Danh mục sản phẩm </h5>
                    <Row style={{ flexWrap: 'nowrap', height: 'calc(100% - 20px)' }}>
                        <WrapperNavbar span={4} >
                            <Navbar />
                        </WrapperNavbar>
                        <Col span={20} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <WrapperProducts >
                                {products?.filter((pro) => {
                                    if (searchDebounce === '') {
                                        return pro
                                    } else if (pro?.name?.toLowerCase()?.includes(searchDebounce?.toLowerCase())) {
                                        return pro
                                    }
                                }).map((product) => {
                                    return (
                                        <Card key={product._id}
                                            countInstock={product.countInstock}
                                            description={product.description}
                                            image={product.image}
                                            name={product.name}
                                            price={product.price}
                                            rating={product.rating}
                                            selled={product.selled}
                                            discount={product.discount}
                                            type={product.type}
                                            id={product._id}
                                        />
                                    )
                                })}
                            </WrapperProducts>
                            <Pagination showQuickJumper defaultCurrent={panigate.page + 1} total={panigate?.total} onChange={onChange} style={{ textAlign: 'center', marginTop: '10px' }} />
                        </Col>
                    </Row>
                </div>
            </div>
        </Loading>

    );
}

export default TypeProductPage;