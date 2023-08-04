import React, { useEffect, useState } from 'react'
import Connection from './Connection'
import mqtt from 'mqtt'
import { Button, notification } from 'antd'
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';

function getTime() {
  return dayjs().format('HH:mm:ss')
}

function Weather({ data = {} }) {
  return (
    <div style={{ backgroundColor: '#fff', color: '#000', textAlign: 'center', fontSize: 14, width: '100%', padding: '8px' }}>
      <span style={{ marginRight: 10 }}>
        当前:
     </span>
      <span style={{ marginRight: 10 }}>
        温度:{`${data.temperature}℃`}
      </span>

      <span>
        湿度:{`${data.humidity}%`}
      </span>
    </div>
  )
};

const HookMqtt = () => {
  const [client, setClient] = useState(null)
  const [weather, setWeather] = useState({
    humidity: 0,
    temperature: 0
  });
  const [list, setList] = useState([]);
  const [connectStatus, setConnectStatus] = useState('连接')

  const mqttConnect = (host, mqttOption) => {
    setConnectStatus('连接中...')
    setClient(mqtt.connect(host, mqttOption))
  }

  useEffect(() => {
    if (client) {
      client.on('connect', () => {
        setConnectStatus('已连接');

        notification.success({
          message: '连接成功!'
        });

        mqttSub({
          topic: 'weather',
          qos: 0
        });
        mqttSub({
          topic: 'switch/feedback',
          qos: 0
        });

      });

      client.on('error', (err) => {
        notification.error('连接出现错误! ')
        console.log(err)
        client.end()
      })

      client.on('reconnect', () => {
        setConnectStatus('重连中...')
      });

      client.on('message', (topic, message) => {// topic 是string, message是 uint8_array 
        console.log(`received message:\n ${message} \n from topic: ${topic}`)
        if (topic == 'weather') {
          const data = JSON.parse(`${message}`);// { humidity:20, temperature:13}
          setWeather(data);
          setList(oldValue => [...oldValue, { ...data, time: getTime(new Date()) }]);
        } else if (topic == 'switch/feedback') {
          notification.info({
            message: `${message}`
          })
        }
      });
    }
  }, [client])

  const mqttDisconnect = () => {
    if (client) {
      try {
        client.end(false, () => {
          setConnectStatus('连接')
          notification.warning({
            message: '连接已关闭!'
          })
        })
      } catch (error) {
        console.log('disconnect error:', error)
      }
    }
  }

  const mqttPublish = (context) => {
    if (client) {
      const { topic, qos, payload } = context
      client.publish(topic, payload, { qos }, (error) => {
        if (error) {
          console.log('Publish error: ', error)
        }
      })
    }
  }

  const mqttSub = (subscription) => {
    if (client) {
      const { topic, qos } = subscription
      client.subscribe(topic, { qos }, (error) => {
        if (error) {
          console.log('Subscribe to topics error', error)
          return
        }
        console.log(`Subscribe to topics: ${topic}`)
      })
    }
  }

  return (
    <>
      <Connection
        connect={mqttConnect}
        disconnect={mqttDisconnect}
        connectBtn={connectStatus}
      />

      <Weather data={weather} />

      <div style={{ background: '#fff', width: '100%', marginBottom: 20 }}>
        <ReactECharts
          option={{
            legend: {
              data: ['温度', '湿度']
            },
            xAxis: {
              type: 'category',
              data: list.map(item => item.time),
              axisLabel: {
                show: false,
                rotate: 45,
                interval: 0// 每隔一个标签显示一个
              }
            },
            yAxis: {
              type: 'value',
            },
            // 设置缩放滑块
            dataZoom: [
              {
                type: 'slider',
                xAxisIndex: 0,
                start: 0,
                end: 100
              }
            ],
            series: [
              {
                name: '湿度',
                data: list.map(item => item.humidity),
                type: 'line',
                smooth: true,
              },
              {
                name: '温度',
                data: list.map(item => item.temperature),
                type: 'line',
                smooth: true,
              },
            ],
            tooltip: {
              trigger: 'axis',
            }
          }} />
      </div>

      <div style={{ backgroundColor: '#fff', padding: 10, width: '100%', display: 'flex', justifyContent: 'space-around' }}>
        <Button type='danger' onClick={() => {
          mqttPublish({
            qos: 0,
            topic: 'switch',
            payload: `{state:"off"}`
          })
        }}>关闭空调</Button>
        <Button type='primary' onClick={() => {
          mqttPublish({
            qos: 0,
            topic: 'switch',
            payload: `{state:"on"}`
          })
        }}>打开空调</Button>
      </div>
    </>
  )
}

export default HookMqtt
