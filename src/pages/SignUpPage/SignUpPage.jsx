import React, { useEffect, useState } from "react";
import { WrapperContainerLeft, WrapperTextLight } from './styled'
import InputForm from '../../components/InputForm/InputForm'
import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'
import { useNavigate } from "react-router-dom";
import * as UserService from '../../service/UserService'
import Loading from "../../components/Loading/Loading";
import { useMutationHook } from '../../hook/userMutationHook'
import * as message from '../../components/Message/Message'

const SignUpPage = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const mutation = useMutationHook(
        data => UserService.signUpUser(data)
    )

    const { data, isPending, isSuccess, isError } = mutation

    const handleNavLogin = () => {
        navigate('/sign-in')
    }

    const handleOnchangeEmail = (value) => {
        setEmail(value)
    }
    const handleOnchangePassword = (value) => {
        setPassword(value)
    }
    const handleOnchangeConfirmPassword = (value) => {
        setConfirmPassword(value)
    }
    const handleSignUp = () => {
        mutation.mutate({ email, password, confirmPassword })
    }

    useEffect(() => {
        if (data?.status === 'success') {
            message.success()
            handleNavLogin()
        } else if (isError) {
            message.error()
        }
    },  [isError, isSuccess])
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.53)', height: '100vh' }}>
            <div style={{ width: '500px', height: '445px', borderRadius: '6px', background: '#fff' }}>
                <WrapperContainerLeft>
                    <h1>L&D Store</h1>
                    <p>Đăng nhập và tạo tài khoản</p>
                    <InputForm style={{ marginBottom: '10px', height: '50px' }}
                        placeholder="abc@gmail.com"
                        value={email} onChange={handleOnchangeEmail}
                    />
                    <InputForm style={{ marginBottom: '10px', height: '50px' }}
                        placeholder="Password" type="password"
                        value={password}
                        onChange={handleOnchangePassword}
                    />
                    <InputForm style={{ height: '50px' }} placeholder="Confirm Password" type="password"
                        value={confirmPassword}
                        onChange={handleOnchangeConfirmPassword}
                    />
                    {data?.status === 'ERR' && <span style={{ color: 'red' }}>{data?.message}</span>}
                    <Loading isPending={isPending}>
                        <ButtonComponent
                            disabled={!email.length || !password.length || !confirmPassword.length}
                            onClick={handleSignUp}
                            size={40}
                            styleButton={{
                                background: 'rgb(255, 57, 69)',
                                height: '48px',
                                width: '100%',
                                border: 'none',
                                borderRadius: '4px',
                                margin: '26px 0 10px',
                            }}
                            label={'Đăng ký'}
                            styleTextButton={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}
                        />
                    </Loading>
                    {/* <WrapperTextLight>Quên mật khẩu ?</WrapperTextLight> */}
                    <p>Bạn đã có tài khoản? <WrapperTextLight onClick={handleNavLogin}>Đăng nhập</WrapperTextLight></p>
                </WrapperContainerLeft>
            </div>
        </div>
    );
}

export default SignUpPage;