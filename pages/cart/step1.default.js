import { useState } from "react";
import {
  DeleteOutlined,
  FrownOutlined,
  LoadingOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import useCart from "grandus-lib/hooks/useCart";
import useWebInstance from "grandus-lib/hooks/useWebInstance";
import { get, find, toNumber, isEmpty } from "lodash";
import EnhancedEcommerce from "grandus-lib/utils/ecommerce";
import TagManager from "grandus-lib/utils/gtag";

import Image from "grandus-lib/components-atomic/image/Image";
import Price from "grandus-lib/components-atomic/price/Price";
import Coupon from "components/cart/Coupon";
import Credits from "components/cart/Credits";
import Isic from "components/cart/Isic";
import Steps from "components/cart/steps/CartSteps";
import Link from "next/link";
import CartSummary from "components/cart/summary/CartSummary";

import { Table, InputNumber, Button, Row, Col, Result, Typography } from "antd";

const { Paragraph } = Typography;

const ItemCountInput = ({ item, itemUpdate, setLoading, inputCountRender }) => {
  const storeId = item?.store?.id;
  const productStore = find(get(item, "product.store"), { id: storeId });
  const [count, setCount] = useState(get(item, "count", 1));

  const { settings } = useWebInstance();

  const productStoreCount = toNumber(get(productStore, "count"));
  const maxPiecesCount = toNumber(get(settings, "cart_max_pieces_count"));

  let maxValue = productStoreCount ? productStoreCount : 1;
  if (toNumber(get(settings, 'order_out_of_stock_products', 0))) {
    maxValue = 999;
  }

  if (maxValue > maxPiecesCount) {
    maxValue = maxPiecesCount;
  }

  const handleChange = (value) => setCount(value);
  const handleBlur = (e) => {
    const value = e.target.value;
    setLoading(true);
    itemUpdate(item?.id, { count: value }, async (response) => {
      const cart = response;
      if (cart) {
        const newCount = get(find(cart?.items, { id: item?.id }), "count", 1);
        setCount(newCount);

        const itemsDifference = toNumber(newCount) - toNumber(item?.count);
        if (itemsDifference < 0) {
          TagManager.push(
            EnhancedEcommerce.cartRemove(
              item?.product,
              Math.abs(itemsDifference)
            )
          );
        } else if (itemsDifference > 0) {
          TagManager.push(
            EnhancedEcommerce.cartAdd(item?.product, Math.abs(itemsDifference))
          );
        }
      }
      setLoading(false);
    });
  };

  if (inputCountRender) {
    return inputCountRender({
      item,
      setLoading,
      count,
      handleChange,
      handleBlur,
    });
  }

  return (
    <>
      {get(item, "measureUnit") ? `1 ${get(item, "measureUnit")} x ` : ""}
      <InputNumber
        style={{ margin: "0 5px" }}
        min={1}
        max={maxValue}
        defaultValue={get(item, "count", 1)}
        value={count}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {get(item, "store.name")}
    </>
  );
};

const ItemRemove = ({ item, itemRemove, setLoading, style = {} }) => {
  return (
    <Button
      style={style}
      type="text"
      danger
      onClick={(e) => {
        setLoading(true);
        itemRemove(get(item, "id"), () => {
          TagManager.push(
            EnhancedEcommerce.cartRemove(item?.product, get(item, "count", 1))
          );
          setLoading(false);
        });
      }}
    >
      <DeleteOutlined /> Odstrániť
    </Button>
  );
};

const Cart = ({ inputCountRender, allowCoupons = true }) => {
  const { cart, itemRemove, itemUpdate, isLoading } = useCart();
  const { settings } = useWebInstance();
  const [loading, setLoading] = useState(false);

  const isProcessing = isLoading || loading;

  React.useEffect(() => {
    TagManager.push(EnhancedEcommerce.checkout(get(cart, "items", []), 1));
  }, []);

  if (isEmpty(get(cart, "items", [])) && isProcessing) {
    return (
      <div className={"container guttered"}>
        <Result
          icon={<LoadingOutlined />}
          title="Nákupný košík"
          subTitle="Nahrávam nákupný košík"
        />
      </div>
    );
  }

  if (isEmpty(get(cart, "items", [])) && !isProcessing) {
    return (
      <div className={"container guttered"}>
        <Result
          icon={<FrownOutlined />}
          title="Prázdny nákupný košík"
          subTitle="Vo Vašom nákupnom košíku sa nenachádzajú žiadne produkty."
          extra={
            <Link href="/" as="/">
              <Button type="primary">Pokračovať na domovskú stránku</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const tableColumns = [
    {
      title: "",
      key: "productImage",
      responsive: ["sm"],
      render: (item) => {
        return (
          <Link
            href="/produkt/[id]"
            as={`/produkt/${get(item, "product.urlTitle")}`}
          >
            <a>
              {get(item, "product.photo") ? (
                <Image
                  photo={get(item, "product.photo")}
                  size={"50x50"}
                  type={"jpg"}
                />
              ) : (
                ""
              )}
            </a>
          </Link>
        );
      },
    },
    {
      title: "Položka",
      key: "productImage",
      render: (item) => {
        const storeId = item?.store?.id;
        const productStore = find(get(item, "product.store"), { id: storeId });
        return (
          <>
            <Paragraph ellipsis={{ rows: 2 }}>
              <Link
                href="/produkt/[id]"
                as={`/produkt/${get(item, "product.urlTitle")}`}
              >
                <a>{get(item, "product.name")}</a>
              </Link>
            </Paragraph>
            <Col xs={24} sm={0}>
              <ItemCountInput
                item={item}
                itemUpdate={itemUpdate}
                setLoading={setLoading}
                inputCountRender={inputCountRender}
              />
            </Col>
          </>
        );
      },
    },
    {
      title: "Počet",
      responsive: ["md"],
      render: (item) => (
        <ItemCountInput
          item={item}
          itemUpdate={itemUpdate}
          setLoading={setLoading}
          inputCountRender={inputCountRender}
        />
      ),
    },
    {
      title: "Cena",
      align: "right",
      render: (item) => (
        <>
          <b style={{ whiteSpace: "nowrap" }}>
            <Price priceData={get(item, "priceTotalData")} />
          </b>
          <Col xs={24} sm={0} style={{ marginTop: "20px" }}>
            <ItemRemove
              style={{ paddingRight: "0" }}
              item={item}
              itemRemove={itemRemove}
              setLoading={setLoading}
            />
          </Col>
        </>
      ),
    },
    {
      title: "",
      align: "right",
      responsive: ["md"],
      render: (item) => (
        <ItemRemove
          item={item}
          itemRemove={itemRemove}
          setLoading={setLoading}
        />
      ),
    },
  ];

  return (
    <div className={"container guttered"}>
      <Row gutter={[{ xs: 0, sm: 15 }, 15]}>
        <Col xs={24}>
          <Steps current={1} />
        </Col>
        <Col xs={24}>
          <Table
            loading={
              loading
                ? { indicator: <LoadingOutlined style={{ fontSize: "4em" }} /> }
                : false
            }
            pagination={false}
            columns={tableColumns}
            dataSource={get(cart, "items", [])}
            rowKey={(record) => record?.id}
          />
        </Col>
        <Col xs={24} md={14}>
          <Row gutter={[{ xs: 0, sm: 15 }, 15]}>
            {allowCoupons ? (
              <Col xs={24}>
                <Coupon />
              </Col>
            ) : null}
            {toNumber(settings?.credits_allow_user) ? (
              <Col xs={24}>
                <Credits />
              </Col>
            ) : (
              ""
            )}
            {toNumber(settings?.isic_active) ? (
              <Col xs={24}>
                <Isic />
              </Col>
            ) : (
              ""
            )}
          </Row>
        </Col>
        <Col xs={24} md={10}>
          <CartSummary
            showProducts={false}
            actions={[
              <Link href="/" as={`/`}>
                <Button type={"text"} icon={<ArrowLeftOutlined />}>
                  späť do obchodu
                </Button>
              </Link>,
              <Link href="/kosik/kontakt" as={`/kosik/kontakt`}>
                <Button size={"large"} type={"primary"} disabled={loading}>
                  Pokračovať v objednávke
                </Button>
              </Link>,
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Cart;
