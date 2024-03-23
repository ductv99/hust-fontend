import React from "react";
import ProductDetails from '../../components/ProductDetails/ProductDetails'
import { useNavigate, useParams } from "react-router-dom";

const ProductDetailsPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    return (
        <div style={{ padding: '0 120px', background: '#efefef', height: '1000px' }}>
            {/* <h5><span style={{ cursor: "pointer", fontWeight: 'bold' }} onClick={() => { navigate("/") }}>Trang chủ</span> {'>>'} Chi tiết sản phẩm</h5> */}

            <nav aria-label="breadcrumb" className="w-full p-4">
                <ol className="flex h-8 space-x-2">
                    <li className="flex items-center">
                        <a rel="noopener noreferrer" href="/" title="Back to homepage" className="hover:underline">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 pr-1 ">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                            </svg>
                        </a>
                    </li>
                    <li className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" className="w-2 h-2 mt-1 transform rotate-90 fill-current">
                            <path d="M32 30.031h-32l16-28.061z"></path>
                        </svg>
                        <a rel="noopener noreferrer" href="#" className="flex items-center px-1 capitalize text-black hover:underline">Chi tiết sản phẩm</a>
                    </li>
                </ol>
            </nav>
            <ProductDetails idProduct={id} />
        </div>
    );
}

export default ProductDetailsPage
// width: 100 %; background - color: ;