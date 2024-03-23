import React, { useEffect, useState } from "react";
// import { Checkbox, Rate } from 'antd'
import { WrapperLabelText, WrapperContent, WrapperTextValue } from './styled'
import *  as ProductService from "../../service/ProductService"
import TypeProduct from "../../components/TypeProduct/TypeProduct";

const Navbar = () => {
    const [category, setCategory] = useState([])
    const fetchProductAllType = async () => {
        const res = await ProductService.getAllProductType()
        if (res?.status === "OK") {
            setCategory(res?.data)
        }
    }
    useEffect(() => {
        fetchProductAllType()
    }, [])

    return (
        <div>
            <WrapperLabelText>
                Danh mục sản phẩm
            </WrapperLabelText>
            <WrapperContent>
                {category.map((item) => {
                    return (
                        <WrapperTextValue>
                        <TypeProduct name={item} key={item} />
                        </WrapperTextValue>
                    )

                })}
            </WrapperContent>
        </div>
    );
}

export default Navbar;