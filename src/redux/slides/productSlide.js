import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    search: ''
}

export const productSilde = createSlice({
    name: 'product',
    initialState,
    reducers: {
        searchProduct: (state, action) => {
            state.search = action.payload
        }
    }
})

export const { searchProduct } = productSilde.actions
export default productSilde.reducer