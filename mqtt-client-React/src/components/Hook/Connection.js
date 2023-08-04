import React, { useState } from 'react'
import { Card, Button, Form, Input, Row, Col, Select } from 'antd'

/**
 * this demo uses EMQX Public MQTT Broker (https://www.emqx.com/en/mqtt/public-mqtt5-broker), here are the details:
 *
 * Broker host: broker.emqx.io
 * WebSocket port: 8083
 * WebSocket over TLS/SSL port: 8084
 */

const Connection = ({ connect, disconnect, connectBtn }) => {
  const [form] = Form.useForm();

  const [expand, setExpand] = useState(true);

  const initialConnectionOptions = {
    // ws or wss
    protocol: 'wss',
    host: 'broker.emqx.io',
    clientId: 'emqx_react_' + Math.random().toString(16).substring(2, 8),// 一个clientId 只能绑定一次, 两个绑定一样的clientId 会导致都连接不上
    // ws -> 8083; wss -> 8084
    port: 8084,
    /**
     * By default, EMQX allows clients to connect without authentication.
     * https://docs.emqx.com/en/enterprise/v4.4/advanced/auth.html#anonymous-login
     */
    username: 'jonas',
    password: 'abc123',
  }

  const handleProtocolChange = (value) => {
    form.setFieldsValue({
      port: value === 'wss' ? 8084 : 8083,
    })
  }

  const onFinish = (values) => {
    const { protocol, host, clientId, port, username, password } = values
    const url = `${protocol}://${host}:${port}/mqtt`
    const options = {
      clientId,
      username,
      password,
      clean: true,
      reconnectPeriod: 1000, // ms
      connectTimeout: 30 * 1000, // ms
    }
    connect(url, options)
  }

  const handleConnect = () => {
    form.submit()
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const ConnectionForm = (
    <Form
      layout="vertical"
      name="basic"
      form={form}
      initialValues={initialConnectionOptions}
      onFinish={onFinish}
    >
      <Row gutter={20}>
        <Col lg={{ span: 8 }} sm={{ span: 24 }}>
          <Form.Item label="协议" name="protocol">
            <Select onChange={handleProtocolChange}>
              <Select.Option value="ws">ws</Select.Option>
              <Select.Option value="wss">wss</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col lg={{ span: 8 }} sm={{ span: 24 }}>
          <Form.Item label="主机" name="host">
            <Input />
          </Form.Item>
        </Col>
        <Col lg={{ span: 8 }} sm={{ span: 24 }}>
          <Form.Item label="端口" name="port">
            <Input />
          </Form.Item>
        </Col>
        <Col lg={{ span: 8 }} sm={{ span: 24 }}>
          <Form.Item label="客户端ID" name="clientId">
            <Input />
          </Form.Item>
        </Col>
        <Col lg={{ span: 8 }} sm={{ span: 24 }}>
          <Form.Item label="用户名" name="username">
            <Input />
          </Form.Item>
        </Col>
        <Col lg={{ span: 8 }} sm={{ span: 24 }}>
          <Form.Item label="密码" name="password">
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )

  return (
    <Card
      title="MQTT连接"
      extra={
        <Button onClick={() => setExpand(!expand)} type='link'>{expand ? '收起' : '展开'}</Button>
      }
      bodyStyle={{ display: expand ? 'block' : 'none' }}
      actions={expand ? [
        <Button type="primary" onClick={handleConnect}>
          {connectBtn}
        </Button>,
        <Button danger onClick={handleDisconnect}>
          关闭连接
        </Button>,
      ] : null}
    >
      {expand && ConnectionForm}
    </Card>
  )
}

export default Connection
