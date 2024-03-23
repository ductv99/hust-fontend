import React from "react";

const Banner = () => {
    const bannerStyle = {
        width: "1080px",
        padding: "1rem",
        paddingTop: "2rem",
        backgroundColor: "rgb(26, 148, 255)",
        color: "#fff",
        borderRadius: "0.5rem",
        margin: "auto"
        // margin: "10px auto 0",
    };

    const headingStyle = {
        textAlign: "center",
        fontSize: "6rem",
        color: "#fff",
        letterSpacing: "0.2rem",
        fontWeight: "bold",
        marginBottom: "2rem",
    };

    const promoTextStyle = {
        textAlign: "center",
        fontSize: "3rem",
        marginTop: "2rem",
        marginBottom: "0",
    };

    const discountStyle = {
        color: "#FFD700",
    };

    return (
        <div className="pt-10">
            <div style={bannerStyle}>
                <div>
                    <div>
                        <h2 style={headingStyle}>
                            <span style={discountStyle}>FREE SHIPPING</span>
                            <br></br>
                            cho đơn hàng <span style={discountStyle}>{'>'} 500K</span>
                        </h2>
                        <div style={promoTextStyle}>
                            <span style={{ fontFamily: 'Redressed, sans-serif' }}></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;