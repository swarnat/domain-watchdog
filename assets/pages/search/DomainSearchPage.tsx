import React, {useState} from "react";
import {
    Avatar,
    Badge,
    Card,
    Divider,
    Empty,
    Flex,
    Form,
    FormProps,
    Input,
    List,
    message,
    Skeleton,
    Space,
    Tag,
    Timeline,
    Typography
} from "antd";
import {
    BankOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    IdcardOutlined,
    ReloadOutlined,
    SearchOutlined,
    ShareAltOutlined,
    SignatureOutlined,
    SyncOutlined,
    ToolOutlined,
    UserOutlined
} from "@ant-design/icons";
import {Domain, getDomain} from "../../utils/api";
import {AxiosError} from "axios"
import vCard from 'vcf'

const {Title} = Typography

type FieldType = {
    ldhName: string
}

export default function DomainSearchPage() {

    const [domain, setDomain] = useState<Domain | null>()
    const [messageApi, contextHolder] = message.useMessage()

    const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
        setDomain(null)
        getDomain(values.ldhName).then(d => {
            setDomain(d)
            messageApi.success('Found !')
        }).catch((e: AxiosError) => {
            const data = e?.response?.data as { detail: string }
            setDomain(undefined)
            messageApi.error(data.detail ?? 'An error occurred')
        })
    }

    return <Flex gap="middle" align="center" justify="center" vertical>
        <Card title="Domain finder">
            {contextHolder}
            <Form
                name="basic"
                labelCol={{span: 8}}
                wrapperCol={{span: 16}}
                style={{width: '50em'}}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item<FieldType>
                    name="ldhName"
                    rules={[{
                        required: true,
                        message: 'Required'
                    }, {
                        pattern: /^(?=.*\.)\S*[^.\s]$/,
                        message: 'This domain name does not appear to be valid',
                        max: 63,
                        min: 2
                    }]}
                >
                    <Input size="large" prefix={<SearchOutlined/>} placeholder="example.com" autoFocus={true}
                           autoComplete='off'/>
                </Form.Item>
            </Form>

            <Skeleton loading={domain === null} active>
                {
                    domain &&
                    (!domain.deleted ? <Space direction="vertical" size="middle" style={{width: '100%'}}>
                            <Badge.Ribbon text={`.${domain.tld.tld.toUpperCase()} (${domain.tld.type})`}
                                          color={
                                              domain.tld.type === 'ccTLD' ? 'purple' :
                                                  (domain.tld.type === 'gTLD' && domain.tld.specification13) ? "volcano" :
                                                      domain.tld.type === 'gTLD' ? "green"
                                                          : "cyan"
                                          }>
                                <Card title={`${domain.ldhName}${domain.handle ? ' (' + domain.handle + ')' : ''}`}
                                      size="small">
                                    {domain.status.length > 0 &&
                                        <>
                                            <Divider orientation="left">EPP Status Codes</Divider>
                                            <Flex gap="4px 0" wrap>
                                                {
                                                    domain.status.map(s =>
                                                        <Tag color={s === 'active' ? 'green' : 'blue'}>{s}</Tag>
                                                    )
                                                }
                                            </Flex>
                                        </>
                                    }
                                    <Divider orientation="left">Timeline</Divider>
                                    <Timeline
                                        mode="right"
                                        items={domain.events
                                            .sort((e1, e2) => new Date(e2.date).getTime() - new Date(e1.date).getTime())
                                            .map(({action, date}) => {

                                                    let color, dot
                                                    if (action === 'registration') {
                                                        color = 'green'
                                                        dot = <SignatureOutlined style={{fontSize: '16px'}}/>
                                                    } else if (action === 'expiration') {
                                                        color = 'red'
                                                        dot = <ClockCircleOutlined style={{fontSize: '16px'}}/>
                                                    } else if (action === 'transfer') {
                                                        color = 'orange'
                                                        dot = <ShareAltOutlined style={{fontSize: '16px'}}/>
                                                    } else if (action === 'last changed') {
                                                        color = 'blue'
                                                        dot = <SyncOutlined style={{fontSize: '16px'}}/>
                                                    } else if (action === 'deletion') {
                                                        color = 'red'
                                                        dot = <DeleteOutlined style={{fontSize: '16px'}}/>
                                                    } else if (action === 'reregistration') {
                                                        color = 'green'
                                                        dot = <ReloadOutlined style={{fontSize: '16px'}}/>
                                                    }

                                                    return {
                                                        label: new Date(date).toUTCString(),
                                                        children: action,
                                                        color,
                                                        dot,
                                                        pending: new Date(date).getTime() > new Date().getTime()
                                                    }
                                                }
                                            )
                                        }
                                    />
                                    {
                                        domain.entities.length > 0 &&
                                        <>
                                            <Divider orientation="left">Entities</Divider>
                                            <List
                                                className="demo-loadmore-list"
                                                itemLayout="horizontal"
                                                dataSource={domain.entities}
                                                renderItem={(e) => {
                                                    const jCard = vCard.fromJSON(e.entity.jCard)
                                                    let name = ''
                                                    if (jCard.data.fn !== undefined && !Array.isArray(jCard.data.fn)) name = jCard.data.fn.valueOf()

                                                    return <List.Item>
                                                        <List.Item.Meta
                                                            avatar={<Avatar style={{backgroundColor: '#87d068'}}
                                                                            icon={e.roles.includes('registrant') ?
                                                                                <SignatureOutlined/> : e.roles.includes('registrar') ?
                                                                                    <BankOutlined/> :
                                                                                    e.roles.includes('technical') ?
                                                                                        <ToolOutlined/> :
                                                                                        e.roles.includes('administrative') ?
                                                                                            <IdcardOutlined/> :
                                                                                            <UserOutlined/>}/>}
                                                            title={e.entity.handle}
                                                            description={name}
                                                        />
                                                        <div>{e.roles.join(', ')}</div>
                                                    </List.Item>
                                                }}
                                            />
                                        </>
                                    }
                                </Card>
                            </Badge.Ribbon>
                        </Space>
                        : <Empty
                            description={
                                <Typography.Text>
                                    Although the domain exists in my database, it has been deleted from the WHOIS by its
                                    registrar.
                                </Typography.Text>
                            }/>)
                }
            </Skeleton>
        </Card>
    </Flex>
}