import React, { useContext } from 'react'
import { Card, Form, Input, Row, Col, Button, Select } from 'antd'
import { QosOption } from './index'

const Subscriber = ({ params = {}, unSub }) => {
  const [form] = Form.useForm()
  const qosOptions = useContext(QosOption)

  const handleUnsub = () => {
    const values = form.getFieldsValue()
    unSub(values)
  }

  const SubForm = (
    <Form
      layout="vertical"
      name="basic"
      form={form}
      initialValues={params}
    >
      <Row gutter={20}>
        <Col lg={{ span: 12 }} sm={{ span: 24 }} >
          <Form.Item label="Topic" name="topic">
            <Input />
          </Form.Item>
        </Col>
        <Col lg={{ span: 12 }} sm={{ span: 24 }}>
          <Form.Item label="QoS" name="qos">
            <Select options={qosOptions} />
          </Form.Item>
        </Col>
        <Col lg={{ span: 12 }} sm={{ span: 24 }} >
          <Form.Item>
            <Button
              type="danger"
              style={{ marginLeft: '10px' }}
              onClick={handleUnsub}
            >
              Unsubscribe
              </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )

  return <Card title="Subscriber">{SubForm}</Card>
}

export default Subscriber
