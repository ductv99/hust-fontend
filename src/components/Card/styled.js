import { Card } from "antd";
import styled from "styled-components";

export const WrraperCard = styled(Card)`
width: 200px;
& img{
    height:200px;
    width:200px;
}
background-color: #fff;

`
export const StyleNameProduct = styled.div`
font-weigh:400;
font-size:12px;
line-height:16px;
color: rgb(56,56,61);

`
export const WrraperReportText = styled.div`
font-size:11px;
color:rgb(128,128,137)
display:flex;
align-items:center;
margin: 8px 0 0;

`
export const WrraperPriceText = styled.div`
color:rgb(255,66,78);
font-size:16px;
font-weight:500;
`

export const WrraperDisscountText = styled.span`
color:rgb(255,66,78);
font-size:12px;
font-weight:500
`
export const WrapperStyleTextSell = styled.span`
    font-size: 15px;
    line-height: 24px;
    color: rgb(120, 120, 120)
`