import {
  Button,
  DatePicker,
  Form,
  Input,
  Link,
  Space,
  Table,
  Tooltip,
} from '@arco-design/web-react'
import { useReactive } from 'ahooks'
import { useEffect, useState } from 'react'
const FormItem = Form.Item
const { MonthPicker } = DatePicker

import { IconInfoCircle } from '@arco-design/web-react/icon'
import dayjs from 'dayjs'

import TextLineClamp from '../components/TextLineClamp.jsx'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 90,
  },
  {
    title: 'title',
    dataIndex: 'title',
    width: 200,
    render: (text, record) => <TextLineClamp text={text} />,
  },
  {
    title: 'url',
    dataIndex: 'url',
    render: (text, record) => <TextLineClamp text={text} />,
  },
  {
    title: 'typedCount',
    dataIndex: 'typedCount',
    width: 130,
    // defaultSortOrder: 'descend',
    sorter: (a, b) => a.typedCount - b.typedCount,
  },
  {
    title: 'visitCount',
    dataIndex: 'visitCount',
    width: 120,
    sortDirections: [
      'descend',
      // 'ascend'
    ],
    // defaultSortOrder: 'descend',
    sorter: (a, b) => a.visitCount - b.visitCount,
  },
  {
    title: '最后访问',
    dataIndex: 'lastVisitTime',
    width: 116,
    defaultSortOrder: 'descend',
    sorter: (a, b) => a.lastVisitTime - b.lastVisitTime,
    render: (ms) => dayjs(ms).format('YYYY-MM-DD HH:mm:ss'),
  },
]

const innerColumns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 90,
  },
  {
    title: 'referringVisitId',
    dataIndex: 'referringVisitId',
    width: 200,
  },
  {
    title: 'visitId',
    dataIndex: 'visitId',
    // width: 90,
  },
  {
    title: 'isLocal',
    dataIndex: 'isLocal',
    width: 130,
    render: (text) => (text ? 'true' : 'false'),
  },
  {
    title: 'transition',
    dataIndex: 'transition',
    width: 120,
  },
  {
    title: 'visitTime',
    dataIndex: 'visitTime',
    width: 180,
    render: (ms) => dayjs(ms).format('YYYY-MM-DD HH:mm:ss'),
  },
]

const prevMonth = dayjs().subtract(1, 'month').format('YYYY-MM')

export const Options = () => {
  const [form] = Form.useForm()

  const [selectedRowKeys, setSelectedRowKeys] = useState(['4'])

  const d = useReactive({
    keyword: '',
    startDate: prevMonth,
    tableData: [],
    selectedRows: [],
  })

  const actionColumn = {
    title: '操作',
    dataIndex: 'action',
    width: 150,
    fixed: 'right',
    render: (text, record) => {
      return (
        <Space size="mini">
          <Link size="mini" href={record.url} target="_blank" icon>
            打开
          </Link>
          <Button onClick={del.bind(null, record)} size="mini" type="text" status="danger">
            删除
          </Button>
        </Space>
      )
    },
  }

  const innerActionColumn = {
    title: '操作',
    dataIndex: 'action',
    width: 102,
    fixed: 'right',
    render: (text, record, index) => {
      return (
        <Space size="mini">
          <Button
            onClick={delRow.bind(null, record, index)}
            size="mini"
            type="text"
            status="danger"
          >
            删除
          </Button>
        </Space>
      )
    },
  }

  async function del(row) {
    try {
      await chrome.history.deleteUrl({
        url: row.url,
      })
      reset()
    } catch (e) {
      console.log(e)
    }
  }

  async function batchDel() {
    try {
      for (let { url } of d.selectedRows) {
        await chrome.history.deleteUrl({
          url,
        })
      }
      reset()
    } catch (e) {
      console.log(e)
    }
  }

  async function delRow({ id, visitTime }, index) {
    try {
      console.log(id, index)
      let res = await chrome.history.deleteRange({
        startTime: visitTime,
        endTime: visitTime + 1,
      })
      for (let items of d.tableData) {
        if (items.id === id) {
          let arr = [...items.list]
          arr.splice(index, 1)
          items.list = [...arr]
          break
        }
      }
      d.tableData = [...d.tableData]
    } catch (e) {
      console.log(e)
    }
  }

  function reset() {
    search({
      keyword: d.keyword,
      startDate: d.startDate,
    })
    setSelectedRowKeys([])
    d.selectedRows = []
  }

  async function getHistory() {
    try {
      let prevMonthMs = dayjs(`${d.startDate}`).startOf('month').valueOf()
      let historyItems = await chrome.history.search({
        maxResults: 10000000,
        text: d.keyword,
        startTime: prevMonthMs,
        endTime: Date.now(),
      })

      let arr = []

      for (let item of historyItems) {
        let url = item.url
        let items = { ...item }
        try {
          let res = await chrome.history.getVisits({ url: url })
          items.list = res || []
        } catch (e) {
          console.log(e)
        }
        arr.push(items)
      }

      console.log('historyItems', arr.length)
      d.tableData = arr
    } catch (e) {
      console.log(e)
    }
  }

  function expandedRowRender(record) {
    return (
      <div className="flex justify-between">
        <div className="flex-auto">
          子项:
          <br />
          {record.list.length}
        </div>
        <Table
          className="w-100% pl-54px"
          rowKey="visitId"
          border
          columns={[...innerColumns, innerActionColumn]}
          data={record.list}
          pagination={false}
        />
      </div>
    )
  }

  async function search({ keyword, startDate } = {}) {
    try {
      // console.log({ keyword, startDate })
      d.keyword = keyword
      d.startDate = startDate || prevMonth
      console.log(d.keyword, d.startDate)
      getHistory()
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getHistory()
  }, [])

  return (
    <>
      <main id="main-box" className="relative py-15px px-20px bg-white">
        <Form
          form={form}
          layout="inline"
          className="w-100%"
          initialValues={{
            keyword: d.keyword,
            startDate: d.startDate,
          }}
          // autoComplete="off"
          onSubmit={search}
        >
          <FormItem label="" field="keyword">
            <Input
              allowClear
              onClear={search.bind(null, { keyword: '', startDate: d.startDate })}
              className="w-350px"
              placeholder="输入title或url关键字搜索🔍"
            />
          </FormItem>
          <FormItem label="" field="startDate">
            <MonthPicker
              placeholder="开始日期，默认查询上月1号到现在的记录"
              prefix={
                <Tooltip content="从每月1号开始计算">
                  <IconInfoCircle />
                </Tooltip>
              }
              onChange={(v) => {
                search({ startDate: v, keyword: d.keyword })
              }}
              className="w-350px"
            />
          </FormItem>
          <FormItem label="">
            <Button type="primary" htmlType="submit" style={{ marginRight: 24 }}>
              查询
            </Button>
          </FormItem>
        </Form>
        <Table
          rowKey="id"
          border
          virtualized
          scroll={{
            y: 'calc(100vh - 155px)',
          }}
          columns={[...columns, actionColumn]}
          data={d.tableData}
          expandedRowRender={expandedRowRender}
          // pagination={false}
          pagination={{
            sizeCanChange: true,
            showTotal: true,
            showJumper: true,
            // total: 96,
            // pageSize: 10,
            // current: 1,
            defaultPageSize: 50,
            sizeOptions: [20, 50, 100, 200, 500],
            pageSizeChangeResetCurrent: true,
          }}
          renderPagination={(paginationNode) => (
            <div className="flex justify-between items-center mt-10px">
              <Button disabled={d.selectedRows.length === 0} onClick={batchDel} status="danger">
                批量删除
              </Button>
              {paginationNode}
            </div>
          )}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              // console.log('onChange:', selectedRowKeys, selectedRows)
              setSelectedRowKeys(selectedRowKeys)
              d.selectedRows = selectedRows
            },
          }}
        />
      </main>
    </>
  )
}

export default Options
