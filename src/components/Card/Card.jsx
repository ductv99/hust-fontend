import React from "react";
import { StyleNameProduct, WrraperDisscountText, WrraperCard, WrraperPriceText, WrraperReportText, WrapperStyleTextSell } from "./styled";
import { StarFilled } from "@ant-design/icons"
import { useNavigate } from "react-router-dom";
import { convertPrice } from "../../untils";
const Card = (props) => {
    // countInStock, description, type,
    const { discount, image, name, price, rating, selled, id } = props
    const navigate = useNavigate()
    const handleDetailProduct = (id) => {
        navigate(`/product-details/${id}`)
    }
    return (
        <WrraperCard
            hoverable
            headStyle={{ width: '200px', height: '200px' }}
            style={{ width: 200 }}
            bodyStyle={{ padding: '10px' }}
            cover={<img alt="example" src={image} />}
            onClick={() => handleDetailProduct(id)}
        >
            <StyleNameProduct>
                {name}
            </StyleNameProduct>
            <WrraperReportText>
                <span>
                    <span>{rating}</span> <StarFilled style={{ fontSize: '12px', color: 'rgb(253,216,54)' }} />
                </span>
                <WrapperStyleTextSell>| Đã bán {selled || 0}+</WrapperStyleTextSell>
            </WrraperReportText>
            <WrraperPriceText>
                <span style={{ marginRight: '8px' }}>{convertPrice(price)} </span>
                <WrraperDisscountText>
                    {/* - {discount || 0}% */}
                </WrraperDisscountText>
            </WrraperPriceText>
        </WrraperCard>
    );
}

export default Card;