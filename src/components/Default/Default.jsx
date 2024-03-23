import Footer from "../Footer/Footer";
import Header from "../Header/Header";

const Default = ({ children }) => {
    return (<div>
        <Header />
        {children}
        <Footer />
    </div>);
}

export default Default;