import React, { useState } from "react";
import Loading from "../../../../components/Loading/Loading";
import { Button, Table } from "antd";
const AdminTable = (props) => {
    const { selectionType = 'checkbox', data = [], columns = [], isLoading = false, handleDeleteMany } = props
    const [rowSelectedRowKeys, setRowSelectedRowKeys] = useState([])

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setRowSelectedRowKeys(selectedRowKeys)
            // console.log(`selectedRowKeys: ${selectedRowKeys}`); 
        },
        // getCheckboxProps: (record) => ({
        //     disabled: record.name === 'Disabled User',
        //     // Column configuration not to be checked
        //     name: record.name,
        // }),
    };

    const handleDeleteAll = () => {
        handleDeleteMany(rowSelectedRowKeys)
    }
    return (
        <div>
            <Loading isPending={isLoading}>
                <div style={{ paddingBottom: "20px" }}>
                    {rowSelectedRowKeys.length > 0 && <Button type="primary" onClick={handleDeleteAll}>Xóa tất cả</Button>}

                </div>
                <Table
                    rowSelection={{
                        type: selectionType,
                        ...rowSelection,
                    }}
                    columns={columns}
                    dataSource={data}
                    {
                    ...props
                    }
                />
            </Loading>
        </div>
    );
}

export default AdminTable;