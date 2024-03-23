import React from "react";
import { useNavigate } from "react-router-dom";
const TypeProduct = ({ name }) => {
    const navigate = useNavigate()
    const handleNavType = (type) => {
        navigate(`/product/${type.normalize('NFD').replace(/[\u0300-\u036f]/g, '')?.replace(/ /g, '_')}`, { state: type })
    }
    return (
        // <div style={{ padding: '0 10px', cursor: 'pointer', margin: 'auto 10px', textTransform: 'uppercase', fontWeight: 'bold',  }} onClick={() => { handleNavType(name) }}>{name}</div>
        <div
            style={{
                padding: '0 10px',
                cursor: 'pointer',
                margin: 'auto 10px',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                transition: 'color 0.3s',
                color: 'black',
            }}
            onClick={() => { handleNavType(name) }}
            onMouseEnter={(e) => { e.target.style.color = 'rgb(11,112,229)' }}
            onMouseLeave={(e) => { e.target.style.color = 'black' }}
        >
            {name}
        </div>
    );
}

export default TypeProduct;