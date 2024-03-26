import React, { useState, useEffect } from "react";
import { WrapperContainerLeft, WrapperTextLight } from './styled'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import Loading from '../../components/Loading/Loading'
import { EyeFilled, EyeInvisibleFilled } from '@ant-design/icons'
import { useLocation, useNavigate } from "react-router-dom";
import * as UserService from '../../service/UserService'
import { useMutationHook } from '../../hook/userMutationHook'
import { jwtDecode } from "jwt-decode";
import { useDispatch } from 'react-redux'
import { updateUser } from "../../redux/slides/userSile";


const SignInPage = () => {
    const location = useLocation()
    const mutation = useMutationHook(
        data => UserService.loginUser(data)
    )
    const { data, isPending, isSuccess } = mutation
    const [isShowPassword, setIsShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const dispatch = useDispatch();
  
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleNavSignUp = () => {
        navigate('/sign-up')
    }
    const handleOnchangeEmail = (value) => {
        setEmail(value)
    }
    const handleOnchangePassword = (value) => {
        setPassword(value)
    }
    const handleSignIn = () => {
        mutation.mutate({
            email,
            password
        })
    }
    useEffect(() => {
        if (data?.status === 'success') {
            if (location?.state) {
                navigate(location?.state)
            } else {
                navigate('/')
            }
            localStorage.setItem('access_token', JSON.stringify(data?.access_token))
            localStorage.setItem('refresh_token', JSON.stringify(data?.refresh_token))

            if (data?.access_token) {
                const decode = jwtDecode(data?.access_token)
                // console.log('dc', decode)
                if (decode?.id) {
                    handleGetDetailsUser(decode?.id, data?.access_token)
                }
            }
        }
    }, [isSuccess])

    const handleGetDetailsUser = async (id, token) => {
        const storage = localStorage.getItem('refresh_token')
        const refresh_token = JSON.parse(storage)

        const res = await UserService.getDetailsUser(id, token)
        // console.log('res', res)
        dispatch(updateUser({ ...res?.data, access_token: token, refresh_token }))

    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', height: '100vh' }}>
            <div style={{ width: '500px', height: '445px', borderRadius: '6px', background: '#fff' }}>
                <WrapperContainerLeft>
                    <h1>L&D Store</h1>
                    <p>Đăng nhập và tạo tài khoản</p>
                    <InputForm style={{ marginBottom: '10px', height: '40px' }} placeholder="abc@gmail.com"
                        value={email} onChange={handleOnchangeEmail} />
                    <div style={{ position: 'relative' }}>
                        <span
                            onClick={() => setIsShowPassword(!isShowPassword)}
                            style={{
                                zIndex: 10,
                                position: 'absolute',
                                top: '4px',
                                right: '8px'
                            }}
                        >{
                                isShowPassword ? (
                                    <EyeFilled />
                                ) : (
                                    <EyeInvisibleFilled />
                                )
                            }
                        </span>
                        <InputForm style={{ height: '40px' }}
                            placeholder="Password"
                            type={isShowPassword ? "text" : "password"}
                            value={password}
                            onChange={handleOnchangePassword}
                        />
                    </div>
                    {data?.status === 'ERR' && <span style={{ color: 'red' }}>{data?.message}</span>}
                    <Loading isPending={isPending}>
                        <ButtonComponent
                            disabled={!email.length || !password.length}
                            onClick={handleSignIn}
                            size={40}
                            styleButton={{
                                background: 'rgb(255, 57, 69)',
                                height: '48px',
                                width: '100%',
                                border: 'none',
                                borderRadius: '4px',
                                margin: '26px 0 10px',
                            }}
                            label={'Đăng nhập'}
                            styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                        />
                    </Loading>
                    <WrapperTextLight>Quên mật khẩu ?</WrapperTextLight>
                    <p>Chưa có tài khoản? <WrapperTextLight onClick={handleNavSignUp}>Tạo tài khoản</WrapperTextLight></p>
                </WrapperContainerLeft>
            </div>
        </div>
    );
}

export default SignInPage;