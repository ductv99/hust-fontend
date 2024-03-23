import { Row } from "antd";
import styled from "styled-components";
// export const WrapperHeader = styled(Row)`
// padding: 10px 120px;
// background-color: rgb(26,148,255);
// box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
// position: sticky;
// align-items: center;
// gap:16px;
// flex-wrap:nowrap;
// width: 1270px;
// padding: 10px 0;
// `

export const WrapperHeader = styled(Row)`
    align-items: center;
    gap: 16px;
    flex-wrap: nowrap;
    width: 1270px;
    padding: 10px 0;
`
// background-color: rgb(226 232 240);

export const WrapperTextHeader = styled.span`
font-size: 18px;
color: #fff;
font-weight: bold;
text-align:left;
`
// font-family: 'Redressed', sans-serif;
export const WrraperAccountHeader = styled.div`
display: flex;
align-items: center;
color:#fff;
gap:10px;
font-size:12px
`

export const WrraperTextHeaderSmall = styled.span`
font-size: 12px;
color:#fff;
white-space:nowrap;
`
export const WrapperContentPopup = styled.p`
    cursor: pointer;
    &:hover {
        color: rgb(26, 148, 255);
    }
`