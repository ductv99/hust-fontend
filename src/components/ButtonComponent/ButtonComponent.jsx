import React from "react";
import { Button } from "antd";
const ButtonComponent = ({ size, styleButton, styleTextButton, disabled, bordered, label, ...rest }) => {
    return (
        <Button
            size={size}
            style={{
                ...styleButton,
                background: disabled ? '#ccc' : styleButton.background
            }}
            bordered={bordered}
            {...rest}
        >
            <span style={styleTextButton}>{label}</span>

        </Button>
    );
}

export default ButtonComponent;