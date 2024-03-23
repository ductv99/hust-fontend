import React from 'react'
import { WrapperInputStyle } from './styled'

const InputForm = (props) => {
    const { placeholder = 'Điền vào đây', ...rests } = props
    const handleOnchangeInput = (e) => {
        props.onChange(e.target.value)
    }
    return (
        <WrapperInputStyle placeholder={placeholder} value={props.value} {...rests} onChange={handleOnchangeInput} />)
}

export default InputForm