import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
    access_token: '',
    id: '',
    isAdmin: false,
    // city: ''
    refreshToken: ''
}

export const userSlide = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser: (state, action) => {
            const { name = '', email = '', access_token = "", phone = "", address = "", avatar = "", _id = '', isAdmin, refreshToken = '' } = action.payload
            state.name = name ? name : state.name;
            state.email = email ? email : state.email;
            state.address = address ? address : state.address;
            state.phone = phone ? phone : state.phone;
            state.avatar = avatar ? avatar : state.avatar;
            state.id = _id ? _id : state.id
            state.access_token = access_token ? access_token : state.access_token;
            state.isAdmin = isAdmin ? isAdmin : state.isAdmin;
            state.refreshToken = refreshToken ? refreshToken : state.refreshToken;

            // state.city = city
        },
        resetUser: (state) => {
            state.name = "";
            state.email = "";
            state.access_token = "";
            state.phone = "";
            state.address = "";
            state.avatar = "";
            state.id = "";
            state.isAdmin = false;
            state.refreshToken = ''
            // state.city = ""
        },

    },
})

// Action creators are generated for each case reducer function
export const { updateUser, resetUser } = userSlide.actions

export default userSlide.reducer