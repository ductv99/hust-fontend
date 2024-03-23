import React, { useEffect, useState } from "react";
import { WrapperHeader, WrapperContentProfile, WrapperLabel, WrapperInput, WrapperUploadFile } from "./styled"
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import { useSelector } from "react-redux";
import * as UserService from '../../service/UserService'
import { useMutationHook } from '../../hook/userMutationHook'
import Loading from "../../components/Loading/Loading";
import * as message from '../../components/Message/Message'
import { useDispatch } from 'react-redux'
import { updateUser } from "../../redux/slides/userSile";
import { UploadOutlined } from '@ant-design/icons'
import { Button } from "antd";
import { getBase64 } from "../../untils";

const ProfilePage = () => {

    const user = useSelector((state) => state.user)
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [avatar, setAvatar] = useState("")

    const mutation = useMutationHook(
        (data) => {
            const { id, access_token, ...rests } = data
            UserService.updateUser(id, rests, access_token)
        })
    const dispatch = useDispatch();

    const { data, isPending, isSuccess, isError } = mutation

    useEffect(() => {
        setEmail(user.email);
        setName(user.name);
        setPhone(`0${user.phone}`);
        setAddress(user.address);
        setAvatar(user.avatar);
    }, [user])

    useEffect(() => {
        if (isSuccess && data?.status === "success") {
            message.success()
            handleGetDetailsUser(user?.id, user?.access_token)
        } else if (isError) {
            message.error()
        }

    }, [isSuccess, isError])

    const handleOnchangeEmail = (value) => {
        setEmail(value)
    }
    const handleOnchangeName = (value) => {
        setName(value)
    }
    const handleOnchangePhone = (value) => {
        setPhone(value)
    }
    const handleOnchangeAddress = (value) => {
        setAddress(value)
    }
    const handleOnchangeAvatar = async ({ fileList }) => {
        const file = fileList[0]
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj)
        }
        setAvatar(file.preview)
    }


    const handleGetDetailsUser = async (id, token) => {
        const res = await UserService.getDetailsUser(id, token)
        dispatch(updateUser({ ...res?.data, access_token: token }))
    }

    const handleUpdate = () => {
        mutation.mutate({ id: user?.id, email, name, phone, address, avatar, access_token: user?.access_token })
        message.success()
        // console.log("ud", email, name, phone, address, avatar)
        // window.location.reload();
    }
    return (
        <div className='body' style={{ width: '100%', backgroundColor: '#efefef', }}>
            <div style={{ width: '1270px', margin: 'auto', height: '680px', }}>
                <WrapperHeader>Thông tin người dùng</WrapperHeader>
                <Loading isPending={isPending} >
                    <WrapperContentProfile >
                        <WrapperInput>
                            <WrapperLabel htmlFor="name">Tên người dùng</WrapperLabel>
                            <InputForm id='name' style={{ marginBottom: '10px', height: '40px' }}
                                value={name}
                                onChange={handleOnchangeName}
                            />
                            {/* <ButtonComponent
                            onClick={handleUpdate}
                            size={40}
                            styleButton={{
                                height: '30px',
                                width: 'fit-content',
                                borderRadius: '4px',
                                padding: '2px 6px 6px',
                                background: 'rgb(26, 148, 255)'
                            }}
                            label={'Cập nhật'}
                            styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                        ></ButtonComponent> */}
                        </WrapperInput>
                        <WrapperInput>
                            <WrapperLabel htmlFor="email">Email</WrapperLabel>
                            <InputForm id='email' style={{ marginBottom: '10px', height: '40px' }}
                                value={email}
                                onChange={handleOnchangeEmail}
                            />
                            {/* <ButtonComponent
                            onClick={handleUpdate}
                            size={40}
                            styleButton={{
                                height: '30px',
                                width: 'fit-content',
                                borderRadius: '4px',
                                padding: '2px 6px 6px',
                                background: 'rgb(26, 148, 255)'
                            }}
                            label={'Cập nhật'}
                            styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                        ></ButtonComponent> */}
                        </WrapperInput>
                        <WrapperInput>
                            <WrapperLabel htmlFor="phone">Số điện thoại</WrapperLabel>
                            <InputForm id='phone' style={{ marginBottom: '10px', height: '40px' }}
                                value={phone}
                                onChange={handleOnchangePhone}
                            />
                            {/* <ButtonComponent
                            onClick={handleUpdate}
                            size={40}
                            styleButton={{
                                height: '30px',
                                width: 'fit-content',
                                borderRadius: '4px',
                                padding: '2px 6px 6px',
                                background: 'rgb(26, 148, 255)'
                            }}
                            label={'Cập nhật'}
                            styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                        ></ButtonComponent> */}
                        </WrapperInput>
                        <WrapperInput>
                            <WrapperLabel htmlFor="avatar">Ảnh đại diện</WrapperLabel>
                            <WrapperUploadFile onChange={handleOnchangeAvatar} maxCount={1}>
                                <Button icon={<UploadOutlined />}>Select File</Button>
                            </WrapperUploadFile>
                            {
                                avatar && (<img src={avatar} style={{ height: '60px', width: '60px', borderRadius: '50%', objectFit: 'cover' }} />)
                            }
                        </WrapperInput>
                        <WrapperInput>
                            <WrapperLabel htmlFor="address">Địa chỉ</WrapperLabel>
                            <InputForm id='address' style={{ marginBottom: '10px', height: '40px' }}
                                value={address}
                                onChange={handleOnchangeAddress}
                            />
                            {/* <ButtonComponent
                            onClick={handleUpdate}
                            size={40}
                            styleButton={{
                                height: '30px',
                                width: 'fit-content',
                                borderRadius: '4px',
                                padding: '2px 6px 6px',
                                background: 'rgb(26, 148, 255)'
                            }}
                            label={'Cập nhật'}
                            styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                        ></ButtonComponent> */}
                        </WrapperInput>
                        <WrapperInput style={{ display: 'flex', justifyContent: 'end' }}>
                            {/* <WrapperLabel htmlFor="name">Tên người dùng</WrapperLabel>
                        <InputForm id='name' style={{ marginBottom: '10px', height: '40px' }}
                            value={name}
                            onChange={handleOnchangeName}
                        /> */}
                            <ButtonComponent
                                onClick={handleUpdate}
                                size={40}
                                styleButton={{
                                    height: '30px',
                                    width: 'fit-content',
                                    borderRadius: '4px',
                                    padding: '2px 6px 6px',
                                    background: 'rgb(26, 148, 255)'
                                }}
                                label={'Cập nhật'}
                                styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                            ></ButtonComponent>
                        </WrapperInput>
                    </WrapperContentProfile>
                </Loading>
            </div >
        </div>
    );
}

export default ProfilePage;