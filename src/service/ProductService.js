import axios from "axios";
import { axiosJWT } from "./UserService";


//is not find uppercase 
export const getAllProduct = async (search, limit) => {
    let res = {}
    if (search?.length > 0) {
        // res = await axios.get(`${process.env.REACT_APP_API_KEY}/product/get-all?filter=name&filter=${search}`)
        // console.log(search)
        res = await axios.get(`${process.env.REACT_APP_API_KEY}/product/get-all?filter=name&filter=${search}&limit=${limit}`);
        console.log(res)
    } else {
        res = await axios.get(`${process.env.REACT_APP_API_KEY}/product/get-all?limit=${limit}`)
    }
    return res.data
}

export const getProductType = async (type, page, limit) => {
    if (type) {
        const res = await axios.get(`${process.env.REACT_APP_API_KEY}/product/get-all?filter=type&filter=${type}&limit=${limit}&page=${page}`);
        return res.data
    }
}

export const createProduct = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_KEY}/product/create`, data)
    return res.data
}

export const getDetailProduct = async (id) => {
    const res = await axios.get(`${process.env.REACT_APP_API_KEY}/product/get-details/${id}`)
    return res.data
}

export const updateProduct = async (id, data, access_token) => {
    const res = await axiosJWT.put(`${process.env.REACT_APP_API_KEY}/product/update/${id}`, data, {
        headers: {
            token: `Bearer ${access_token}`
        }
    })
    return res.data
}

export const deleteProduct = async (id, access_token) => {
    console.log("ok2", access_token)
    const res = await axiosJWT.delete(`${process.env.REACT_APP_API_KEY}/product/delete/${id}`, {
        headers: {
            token: `Bearer ${access_token}`
        }
    })
    return res.data
}

export const deleteManyProduct = async (ids, access_token) => {
    const res = await axiosJWT.post(`${process.env.REACT_APP_API_KEY}/product/delete-many`, ids, {
        headers: {
            token: `Bearer ${access_token}`
        }
    })
    return res.data
}
export const getAllProductType = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_KEY}/product/get-all-type`)
    return res.data
}