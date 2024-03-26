import HomePage from "../pages/HomePage/HomePage"
import OrderPage from "../pages/OrderPage/OrderPage"
import ProductsPage from "../pages/ProductsPage/ProductsPage"
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage"
import TypeProductPage from "../pages/TypeProductPage/TypeProductPage"
import SignInPage from "../pages/SignInPage/SignInPage"
import SignUpPage from "../pages/SignUpPage/SignUpPage"
import PaymentPage from "../pages/PaymentPage/PaymentPage"
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess"
import ProductDetailsPage from "../pages/ProductDetailsPage/ProductDetailsPage"
import ProfilePage from "../pages/Profile/ProfilePage"
import AdminPage from "../pages/Admin/AdminPage/AdminPage"
import MyOrderPage from "../pages/MyOrder/MyOrderPage"
import DetailsOrderPage from "../pages/DetailsOrderPage/DetailsOrderPage"

export const routes = [
    {
        path: '/',
        page: HomePage,
        isShowHeader: true
    },
    {
        path: '/order',
        page: OrderPage,
        isShowHeader: true
    },
    {
        path: '/my-order',
        page: MyOrderPage,
        isShowHeader: true
    },
    {
        path: '/details-order/:id',
        page: DetailsOrderPage,
        isShowHeader: true
    },
    {
        path: '/payment',
        page: PaymentPage,
        isShowHeader: true
    },
    {
        path: '/ordersuccess',
        page: OrderSuccess,
        isShowHeader: true
    },
    {
        path: '/product/:type',
        page: TypeProductPage,
        isShowHeader: true
    },
    {
        path: '/sign-in',
        page: SignInPage,
        isShowHeader: false
    },
    {
        path: '/sign-up',
        page: SignUpPage,
        isShowHeader: false
    },
    {
        path: '/product-details/:id',
        page: ProductDetailsPage,
        isShowHeader: true
    },
    {
        path: '/profile-user',
        page: ProfilePage,
        isShowHeader: true
    },
    {
        path: '/system/admin',
        page: AdminPage,
        isShowHeader: false,
        isPrivate: true
    },
    {
        path: '/system/admin/products-detail/:id',
        page: ProductsPage,
        isShowHeader: false,
        isPrivate: true
    },
    {
        path: '*',
        page: NotFoundPage
    }

]
