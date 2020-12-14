import { hot } from "react-hot-loader";
import * as React from "react";
import { readFileSync, writeFile } from "fs";
import styled from "styled-components";
import {
  Input,
  Popconfirm,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Alert,
  Typography,
  Upload,
  message,
} from "antd";
const { Text } = Typography;
const { Search } = Input;
import "antd/dist/antd.css";
import {
  PlusOutlined,
  LogoutOutlined,
  SmileOutlined,
  SaveOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
export interface IProjectItem {
  Key: string;
  ptBR: string;
  enUS: string;
  esES: string;
  deDE: string;
}

const MyLayout = styled.div`
  height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 60px 1fr 45px;
`;

const MyHeader = styled.div`
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  justify-content: space-between;
  background-color: #ccc;
`;

const MyContent = styled.div`
  overflow-y: scroll;
  background-color: #ddd;
`;

const MyFooter = styled.div`
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  background-color: #ccc;
`;

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

//Resgata path
let stringsPathSaved = window.localStorage.getItem("stringsPath");
if (!stringsPathSaved)
  stringsPathSaved = "E:\\projetosGit\\PubliWeb\\PubliRES\\strings.json";

const App = () => {
  const [jsonFileName, setJsonFileName] = React.useState(stringsPathSaved);
  const [updated, setUpdated] = React.useState(false);
  const [items, setItems] = React.useState<Array<IProjectItem>>([]);
  const [itemsFiltered, setItemsFiltered] = React.useState<Array<IProjectItem>>(
    []
  );
  const [alertChaveExiste, setAlertChaveExiste] = React.useState<boolean>(
    false
  );
  const [form] = Form.useForm();

  const [modalTitle, setModalTitle] = React.useState("Novo");
  const [modalKey, setModalKey] = React.useState("");
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  React.useEffect(() => {
    LoadJson(jsonFileName);
  }, []);

  function LoadJson(fileName: string) {
    try {
      const rawItems = readFileSync(fileName);
      const lista = JSON.parse(rawItems.toString());
      setItems(lista);
      setItemsFiltered(lista);
    } catch (error) {
      message.error("informe o arquivo string.json");
    }
  }

  const propsUpload = {
    multiple: false,
    beforeUpload: (file: any) => {
      console.log(file.type);
      if (file.name !== "strings.json") {
        message.error(
          `Encontre o arquivo strings.json na pasta \\projetosGit\\PubliWeb\\PubliRES`
        );
      } else {
        setJsonFileName(file.path);
        LoadJson(file.path);
        window.localStorage.setItem("stringsPath", file.path);
      }
      return false;
    },
  };

  const showModalEdita = (item: IProjectItem) => {
    form.setFieldsValue(item);
    setModalKey(item.Key);
    setModalTitle("Editar " + item.Key);
    setIsModalVisible(true);
  };

  const showModalNovo = () => {
    setModalKey("");
    setModalTitle("Novo");
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onFinish = (itemEdited: IProjectItem) => {
    const itemFound = items.find(
      (i) => i.Key.toLocaleLowerCase() == itemEdited.Key.toLocaleLowerCase()
    );

    if (modalKey == "") {
      //inclusão
      if (itemFound !== undefined) {
        setAlertChaveExiste(true);
      } else {
        let _items = [...items, itemEdited];
        _items = _items.sort((a, b) =>
          a.Key.toLocaleLowerCase() > b.Key.toLocaleLowerCase() ? 1 : b.Key.toLocaleLowerCase() > a.Key.toLocaleLowerCase() ? -1 : 0
        );
        setItems(_items);

        let _itemsFiltered = [...itemsFiltered, itemEdited];
        _itemsFiltered = _itemsFiltered.sort((a, b) =>
          a.Key.toLocaleLowerCase() > b.Key.toLocaleLowerCase() ? 1 : b.Key.toLocaleLowerCase() > a.Key.toLocaleLowerCase() ? -1 : 0
        );
        setItemsFiltered(_itemsFiltered);

        setIsModalVisible(false);
        setUpdated(true);
      }
    } else {
      //alteracao
      if (
        itemFound !== undefined &&
        itemFound.Key.toLocaleLowerCase() !== modalKey.toLocaleLowerCase()
      ) {
        setAlertChaveExiste(true);
      } else {
        let _itemsFiltered = [...itemsFiltered];
        _itemsFiltered[
          _itemsFiltered.findIndex(
            (i) => i.Key.toLowerCase() == modalKey.toLocaleLowerCase()
          )
        ] = itemEdited;

        _itemsFiltered = _itemsFiltered.sort((a, b) =>
          a.Key.toLocaleLowerCase() > b.Key.toLocaleLowerCase() ? 1 : b.Key.toLocaleLowerCase() > a.Key.toLocaleLowerCase() ? -1 : 0
        );
        setItemsFiltered(_itemsFiltered);

        let _items = [...items];
        _items[
          items.findIndex(
            (i) => i.Key.toLowerCase() == modalKey.toLocaleLowerCase()
          )
        ] = itemEdited;

        _items = _items.sort((a, b) =>
          a.Key.toLocaleLowerCase() > b.Key.toLocaleLowerCase() ? 1 : b.Key.toLocaleLowerCase() > a.Key.toLocaleLowerCase() ? -1 : 0
        );

        setItems(_items);

        setIsModalVisible(false);
        setUpdated(true);
      }
    }
  };

  const onReset = () => {
    setIsModalVisible(false);
  };

  const onSearch = (search: string) => {
    const s = search.toLowerCase();

    setItemsFiltered(
      items.filter(
        (i) =>
          i.Key.toLowerCase().indexOf(s) !== -1 ||
          i.ptBR.toLowerCase().indexOf(s) !== -1 ||
          i.enUS.toLowerCase().indexOf(s) !== -1 ||
          i.esES.toLowerCase().indexOf(s) !== -1 ||
          i.deDE.toLowerCase().indexOf(s) !== -1
      )
    );
  };

  const Save = () => {
    const jsonData = JSON.stringify(items, null, 2);
    writeFile(jsonFileName, jsonData, function (err) {
      if (err) console.log(err);
      else {
        setUpdated(false);
      }
    });
  };

  const DeleteItem = (record: IProjectItem) => {
    setItems(
      items.filter(
        (i) => i.Key.toLocaleLowerCase() !== record.Key.toLocaleLowerCase()
      )
    );
    setItemsFiltered(
      itemsFiltered.filter(
        (i) => i.Key.toLocaleLowerCase() !== record.Key.toLocaleLowerCase()
      )
    );
    setUpdated(true);
  };

  return (
    <MyLayout>
      <MyHeader>
        <h3>
          <SmileOutlined rotate={45} /> <span>Editor de Recursos</span>
        </h3>

        <Search
          placeholder="Digite o texto para pesquisa"
          onSearch={onSearch}
          enterButton="Pesquisar"
          allowClear
          style={{ width: "50%", margin: "0 10px" }}
        />

        <Button type="primary" icon={<PlusOutlined />} onClick={showModalNovo}>
          Novo
        </Button>
      </MyHeader>
      <MyContent>
        <Table<IProjectItem> dataSource={itemsFiltered} rowKey="Key">
          <Table.Column<IProjectItem> key="Key" title="Chave" dataIndex="Key" />
          <Table.Column<IProjectItem>
            key="ptBR"
            title="Português"
            dataIndex="ptBR"
          />
          <Table.Column<IProjectItem>
            key="enUS"
            title="Inglês"
            dataIndex="enUS"
          />
          <Table.Column<IProjectItem>
            key="Action"
            title="Ação"
            render={(text: string, record: IProjectItem) => {
              return (
                <Space size="middle">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      showModalEdita(record);
                    }}
                  >
                    Altera
                  </Button>

                  <Popconfirm
                    title="Confirma a exclusão desta chave ?"
                    okText="Excluir"
                    cancelText="Cancela"
                    onConfirm={() => {
                      DeleteItem(record);
                    }}
                    placement="left"
                  >
                    <Button icon={<DeleteOutlined />}>Excluir</Button>
                  </Popconfirm>
                </Space>
              );
            }}
          />
        </Table>
      </MyContent>

      <Modal
        title={modalTitle}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical" onFinish={onFinish} form={form}>
          <Form.Item name="Key" label="Chave" rules={[{ required: true }]}>
            <Input
              onChange={() => {
                setAlertChaveExiste(false);
              }}
            />
          </Form.Item>
          {alertChaveExiste ? (
            <Alert
              message="Chave já existe"
              type="warning"
              closable
              afterClose={() => {
                setAlertChaveExiste(false);
              }}
            />
          ) : null}
          <Form.Item name="ptBR" label="Português" rules={[{ required: true }]}>
            <TextArea
              placeholder="Texto em português"
              autoSize={{ minRows: 3 }}
            />
          </Form.Item>
          <Form.Item name="enUS" label="Inglês" rules={[{ required: false }]}>
            <TextArea placeholder="Texto em inglês" autoSize={{ minRows: 3 }} />
          </Form.Item>
          <Form.Item name="esES" label="Espanhol" rules={[{ required: false }]}>
            <TextArea
              placeholder="Texto em Espanhol"
              autoSize={{ minRows: 3 }}
            />
          </Form.Item>
          <Form.Item name="deDE" label="Alemão" rules={[{ required: false }]}>
            <TextArea placeholder="Texto em Alemão" autoSize={{ minRows: 3 }} />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Space>
              <Button type="primary" htmlType="submit">
                Salva
              </Button>
              <Button htmlType="button" onClick={onReset}>
                Cancela
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <MyFooter>
        <Space size={100}>
          <Space>
            {updated && (
              <Button type="primary" icon={<SaveOutlined />} onClick={Save}>
                Salvar alterações
              </Button>
            )}
            <Button type="primary" icon={<LogoutOutlined />}>
              Sair do App
            </Button>
          </Space>

          <div>
            <Text keyboard>Arquivo de recursos: {jsonFileName}</Text>
            <Upload showUploadList={false} {...propsUpload}>
              <Button
                type="primary"
                icon={<FolderOpenOutlined />}
                size="small"
                danger={true}
              />
            </Upload>
          </div>
        </Space>
      </MyFooter>
    </MyLayout>
  );
};

export default hot(module)(App);
