import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    orderItems: [
    ],
    orderItemsSelected: [
    ],
    shippingAddress: {
    },
    paymentMethod: '',
    itemsPrice: 0,
    shippingPrice: 0,
    totalPrice: 0,
    user: '',
    isPaid: false,
    paidAt: '',
    isDelivered: false,
    deliveredAt: '',
}

export const orderSilde = createSlice({
    name: 'order',
    initialState,
    reducers: {
        addOrderProduct: (state, action) => {
            const { orderItem } = action.payload
            const itemOrder = state?.orderItems?.find((item) => item?.sizeId === orderItem.sizeId)
            if (itemOrder) {
                // console.log('1', itemOrder.countInstock)
                itemOrder.amount += orderItem?.amount
                state.isSucessOrder = true
                state.isErrorOrder = false
            } else {
                state.orderItems.push(orderItem)
            }

        },
        increaseAmount: (state, action) => {
            const { sizeId } = action.payload
            const itemOrder = state?.orderItems?.find((item) => item?.sizeId === sizeId)
            const itemsOrderSelected = state?.orderItemsSelected?.find((item) => item?.sizeId === sizeId)
            if (itemsOrderSelected) {
                itemOrder.amount++
                itemsOrderSelected.amount++
            }
        },
        decreaseAmount: (state, action) => {
            const { sizeId } = action.payload
            const itemOrder = state?.orderItems?.find((item) => item?.sizeId === sizeId)
            const itemsOrderSelected = state?.orderItemsSelected?.find((item) => item?.sizeId === sizeId)
            if (itemsOrderSelected && itemOrder.amount > 1) {
                itemOrder.amount--
                itemsOrderSelected.amount--
            }
        },
        removeOrderProduct: (state, action) => {
            const { sizeId } = action.payload
            const itemOrder = state?.orderItems?.filter((item) => item?.sizeId !== sizeId)
            const itemsOrderSelected = state?.orderItemsSelected?.filter((item) => item?.sizeId !== sizeId)
            state.orderItems = itemOrder
            state.orderItemsSelected = itemsOrderSelected
        },
        removeAllOrderProduct: (state, action) => {
            const { listChecked } = action.payload
            const itemOrder = state?.orderItems?.filter((item) => !listChecked.includes(item.sizeId))
            const itemsOrderSelected = state?.orderItemsSelected?.filter((item) => !listChecked.includes(item.sizeId))
            state.orderItems = itemOrder
            state.orderItemsSelected = itemsOrderSelected
        },
        selectedOrder: (state, action) => {
            const { listChecked } = action.payload
            const orderSelected = []
            state.orderItems.forEach((order) => {
                if (listChecked.includes(order.sizeId)) {
                    orderSelected.push(order)
                }
            })
            state.orderItemsSelected = orderSelected
        },

        resetCart: (state) => {
            state.orderItems = []
            state.orderItemsSelected = []
        }
    }
})

export const { addOrderProduct, selectedOrder, resetCart, increaseAmount, decreaseAmount, removeOrderProduct, removeAllOrderProduct } = orderSilde.actions
export default orderSilde.reducer