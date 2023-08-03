import React, { createContext, useEffect, useState } from 'react'
import Connection from './Connection'
import Publisher from './Publisher'
import Subscriber from './Subscriber'
import mqtt from 'mqtt'
import { notification } from 'antd'
import ReactECharts from 'echarts-for-react';


export const QosOption = createContext([])
const qosOption = [
  {
    label: '0',
    value: 0,
  },
  {
    label: '1',
    value: 1,
  },
  {
    label: '2',
    value: 2,
  },
];


function getTime(nowDate) {
  return `${nowDate.getHours()}:${nowDate.getMinutes()}:${nowDate.getSeconds()}`
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

  const [connectStatus, setConnectStatus] = useState('Connect')

  const mqttConnect = (host, mqttOption) => {
    setConnectStatus('Connecting')
    setClient(mqtt.connect(host, mqttOption))
  }

  useEffect(() => {
    if (client) {
      client.on('connect', () => {
        setConnectStatus('Connected')
        notification.success({
          message: 'connection successful'
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
        notification.error('Connection error! ')
        console.log(err)
        client.end()
      })

      client.on('reconnect', () => {
        setConnectStatus('Reconnecting')
      });

      // 

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
          setConnectStatus('Connect')
          notification.success({
            message: 'disconnected successfully'
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

  const mqttUnSub = (subscription) => {
    if (client) {
      const { topic, qos } = subscription
      client.unsubscribe(topic, { qos }, (error) => {
        if (error) {
          console.log('Unsubscribe error', error)
          return
        }
        console.log(`unsubscribed topic: ${topic}`)
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

      <div style={{ background: '#fff', width: '100%' }}>
        <ReactECharts
          option={{
            legend: {
              data: ['温度', '湿度']
            },
            xAxis: {
              type: 'category',
              data: list.map(item => item.time),
              axisLabel: {
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


      <QosOption.Provider value={qosOption}>
        <Subscriber
          params={{
            topic: 'weather',
            qos: 0,
          }}
          unSub={mqttUnSub}
        />

        <Publisher publish={mqttPublish} />

      </QosOption.Provider>

    </>
  )
}

export default HookMqtt
