import React, { useEffect, useRef, useState } from "react";
import { WrapperHeader, WrapperUploadFile } from "./styled"
import { PlusCircleOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Select, Space } from "antd";
import AdminTable from "../AdminTable/AdminTable";
import InputComponent from "../../../../components/InputComponent/InputComponent";
import ModalComponent from "../../../../components/ModalComponent/ModalComponent";
import Loading from "../../../../components/Loading/Loading";
import { useSelector } from "react-redux";
import { useMutationHook } from "../../../../hook/userMutationHook";
import { getBase64 } from "../../../../untils";
import DrawerComponent from "../../../../components/DrawerComponent/DrawerComponent";
import { useQuery } from "@tanstack/react-query";
import * as message from '../../../../components/Message/Message'
import * as UserService from '../../../../service/UserService'




const AdminUser = () => {
    const [rowSelected, setRowSelected] = useState('')
    const searchInput = useRef(null)
    const user = useSelector((state) => state?.user)
    const [isOpenDrawer, setIsOpenDrawer] = useState(false)
    const [form] = Form.useForm()
    const [isPendingUpdate, setIsPendingUpdate] = useState(false)
    const [roleSelected, setRoleSelected] = useState(null)
    const [isModalOpenDelele, setIsModalOpenDelele] = useState(false)

    const handleCancelDelete = () => {
        setIsModalOpenDelele(false)
    }
    const getAllUser = async () => {
        const res = await UserService.getAllUser(user?.access_token)
        return res
    }
    const queryUser = useQuery({
        queryKey: ['user'],
        queryFn: getAllUser,
    });

    const { isLoading, data: users } = queryUser

    const dataTable = users?.data?.length && users?.data?.map((user) => {
        return {
            ...user, key: user._id, isAdmin: user.isAdmin ? "Admin" : 'Client', phone: !user.phone ? "Không có số điện thoại" : '0' + user.phone, name: !user.name ? "Chưa đặt tên" : user.name
        }
    })

    const handleChange = (value) => {
        setRoleSelected(value)
    };
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        // setSearchText(selectedKeys[0]);
        // setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        // setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <InputComponent
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Lọc
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Xóa
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    });
    const renderAction = () => {
        return (
            <div>
                <DeleteOutlined style={{ color: 'red', fontSize: '30px', cursor: 'pointer' }} onClick={() => { setIsModalOpenDelele(true) }} />
                <EditOutlined style={{ color: 'orange', fontSize: '30px', cursor: 'pointer' }} onClick={() => { setIsOpenDrawer(true) }} />
            </div>
        )
    }
    const handleCloseDrawer = () => {
        setIsOpenDrawer(false);
        setRoleSelected(null)
        form.resetFields()
    };

    const DeleteUser = () => {
        console.log(rowSelected)
        mutationDelete.mutate({ id: rowSelected, token: user?.access_token },
            {
                onSettled: () => {
                    queryUser.refetch()
                }
            }
        )
    }

    const mutationUpdate = useMutationHook(
        (data) => {
            // console.log("dataaa", data)
            const {
                id,
                access_token,
                ...rests } = data
            const res = UserService.updateUser(id, { ...rests }, access_token)
            return res
        },
    )
    const mutationDelete = useMutationHook(
        (data) => {
            const { id, access_token, } = data
            const res = UserService.deleteUser(id, access_token)
            return res
        },
    )
    const mutationDeleteMany = useMutationHook(
        (data) => {
            const { access_token, ...ids } = data
            const res = UserService.deleteManyUser(ids, access_token)
            return res
        },
    )
    const { isPending: isPendingUpdated, isSuccess: isSuccessUpdated, isError: isErrorUpdated } = mutationUpdate
    const { data: dataDelete, isPending: isPendingDelete, isSuccess: isSuccessDelete, isError: isErrorDelete } = mutationDelete
    const { data: dataDeleteMany, isPending: isPendingDeleteMany, isSuccess: isSuccessDeleteMany, isError: isErrorDeleteMany } = mutationDeleteMany

    useEffect(() => {
        if (isSuccessUpdated) {
            handleCloseDrawer()
            message.success()
        } else if (isErrorUpdated) {
            message.error()
        }
    }, [isSuccessUpdated])
    useEffect(() => {
        if (dataDelete?.status === "success") {
            handleCancelDelete()
            message.success()
        } else if (isErrorDelete) {
            message.error()
        }
    }, [isSuccessDelete])
    useEffect(() => {
        if (isSuccessDeleteMany && dataDeleteMany?.status === "success") {

            message.success()
            // queryProduct.refetch()
        } else if (isErrorDeleteMany) {
            message.error()
        }
    }, [isSuccessDeleteMany])
    const handleDeleteManyUser = (ids) => {
        // console.log("idDelete", _id)
        mutationDeleteMany.mutate({ ids: ids, token: user?.access_token },
            {
                onSettled: () => {
                    queryUser.refetch()
                }
            }
        )
    }
    const onUpdateRoleUser = () => {
        const isAdmin = roleSelected;
        // console.log('admin', isAdmin);

        mutationUpdate.mutate({
            id: rowSelected,
            isAdmin,
            token: user?.access_token,
        }, {
            onSettled: () => {
                queryUser.refetch()
            }
        }
        );
    }
    const columns = [
        {
            title: 'Tên người dùng',
            dataIndex: 'name',
            sorter: (a, b) => a.name.length - b.name.length,
            ...getColumnSearchProps('name')
        },
        {
            title: 'Email',
            dataIndex: 'email',
            // sorter: (a, b) => a.email - b.email,
            ...getColumnSearchProps('email')
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            // sorter: (a, b) => a.phone - b.phone,
            ...getColumnSearchProps('phone')

        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            // sorter: (a, b) => a.phone - b.phone,
            ...getColumnSearchProps('address')

        },
        {
            title: 'Loại tài khoản',
            dataIndex: 'isAdmin',
            sorter: (a, b) => a.isAdmin.length - b.isAdmin.length
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            render: renderAction,
        },
    ];


    return (
        <div>
            <WrapperHeader>
                Quản lý người dùng
            </WrapperHeader>
            <div style={{ marginTop: '20px' }}>
                <AdminTable
                    columns={columns}
                    data={dataTable}
                    isLoading={isLoading}
                    handleDeleteMany={handleDeleteManyUser}
                    onRow={(record, rowIndex) => {
                        console.log('x', record)
                        return {
                            onClick: event => {
                                setRowSelected(record._id)
                            }
                        }
                    }}
                />
            </div>
            <DrawerComponent title="Cập nhật quyền người dùng" isOpen={isOpenDrawer} onClose={() => setIsOpenDrawer(false)} width="520px" >
                <Loading
                    isPending={isPendingUpdate || isPendingUpdated}
                >
                    <Form
                        name="basic"
                        labelCol={{
                            span: 6,
                        }}
                        wrapperCol={{
                            span: 18,
                        }}
                        style={{
                            maxWidth: 600,
                        }}
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={onUpdateRoleUser}
                        autoComplete="on"
                        form={form}
                    >
                        <Form.Item
                            label="Loại tài khoản"
                            name="isAdmin"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập vào trường này',
                                },
                            ]}
                        >
                            <Select
                                // defaultValue={false}
                                style={{
                                    width: 120,
                                }}
                                onChange={handleChange}
                                options={[
                                    {
                                        value: false,
                                        label: 'Client',
                                    },
                                    {
                                        value: true,
                                        label: 'Admin',
                                    }
                                ]}
                            />
                        </Form.Item>

                        <Form.Item
                            name="remember"
                            valuePropName="checked"
                            wrapperCol={{
                                offset: 20,
                                span: 16,
                            }}
                        >
                            <Button type="primary" htmlType="submit" >
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Form>
                </Loading>
            </DrawerComponent>
            <ModalComponent forceRender title="Xóa người dùng" open={isModalOpenDelele} onCancel={handleCancelDelete} onOk={DeleteUser}>
                <Loading isPending={isPendingDelete}>
                    <>
                        Bạn có chắc chắn muốn xóa ?
                    </>
                </Loading>
            </ModalComponent>
        </div>

    );
}

export default AdminUser;