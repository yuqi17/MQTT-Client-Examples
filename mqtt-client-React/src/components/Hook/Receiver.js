import React, { useEffect, useState } from 'react';
import { Card, List } from 'antd';

const Receiver = ({ payload }) => {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (payload.topic) {
      setMessages(messages => [...messages, payload])
    }
  }, [payload])

  const renderListItem = (item) => (
    <List.Item>
      <List.Item.Meta
        title={item.topic}
        description={item.message}
      />
    </List.Item>
  )

  return (
    <Card
      title="Receiver"
    >
      <div style={{ height: 200, overflowY: 'scroll' }}>
        <List
          size="small"

          bordered
          dataSource={messages}
          renderItem={renderListItem}
        />
      </div>
    </Card>

  );
}

export default Receiver;
