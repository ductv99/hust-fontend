import styled from "styled-components";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";

export const WrapperTypeProduct = styled.div`
    display: flex;
    align-items: center;
    gap: 24px;
    justify-content: center;
    font-weight: bold;
    height: 40px;
`

export const WrapperButtonMore = styled(ButtonComponent)`
    &:hover {
        color: #fff;
        background: rgb(13,92,182);
        span {
            color: #fff;
        }
    }
    width: 100%;
    text-align: center;
    cursor: ${(props) => props.disabled ? 'not-allowed' : 'pointer'};
    color: ${(props) => props.disabled ? '#fff' : 'transparent'};

`

export const WrapperProducts = styled.div`
    display: flex;
    gap: 15px;
    margin-top:20px;
    flex-wrap: wrap;
`

