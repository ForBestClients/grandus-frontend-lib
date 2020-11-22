import { useState, useMemo } from "react";
import { get, map, isEmpty, isArray } from "lodash";
import { Result, Button, Row, Col, Divider } from "antd";
import Link from "next/link";
import { categoryPage } from "grandus-lib/utils/fetches";
import { FrownOutlined } from "@ant-design/icons";
import {
  getSeoTitleData,
  hasActiveFilters,
  getCategoryLinkAttributes,
} from "grandus-lib/hooks/useFilter";
import EnhancedEcommerce from "grandus-lib/utils/ecommerce";
import TagManager from "grandus-lib/utils/gtag";

import Image from "grandus-lib/components-atomic/image/Image";
import ProductCard from "components/product/card/ProductCard";
import MetaData from "grandus-lib/components-atomic/MetaData";
import Breadcrumbs from "components/breadcrumbs/Breadcrumbs";
import CategoryParameters from "components/category/CategoryParameters";
import CategoryOrdering from "components/category/CategoryOrdering";
import CategorySelected from "components/category/CategorySelected";
import Pagination from "components/pagination/Pagination";

import styles from "./category.page.default.module.scss";

import dynamic from "next/dynamic";
const CategoryPromotedProducts = dynamic(
  () => import("components/category/CategoryPromotedProducts"),
  { ssr: false }
);

export const JSXCategoryParameters = ({ filter }) => {
  const [openedFilter, setOpenedFilter] = useState(false);
  const buttonText = openedFilter ? "Zatvoriť filter" : "Otvoriť filter";
  const toggleFilter = () => {
    if (openedFilter) {
      setOpenedFilter(false);
    } else {
      setOpenedFilter(true);
    }
  };
  return (
    <>
      <Button
        onClick={toggleFilter}
        size={"large"}
        block
        className={styles.filterToggle}
      >
        {buttonText}
      </Button>
      <div className={`${styles.filter} ${openedFilter ? styles.open : ""}`}>
        <Button
          onClick={toggleFilter}
          type={"danger"}
          size={"large"}
          className={styles.filterToggleFixed}
        >
          {buttonText}
        </Button>
        <Button
          onClick={toggleFilter}
          size={"large"}
          block
          className={styles.filterToggle}
        >
          {buttonText}
        </Button>
        {useMemo(
          () => (
            <CategoryParameters initialData={filter} />
          ),
          [filter]
        )}
      </div>
    </>
  );
};

const Category = (props) => {
  const { category, products, pagination, filter, meta, breadcrumbs } = props;

  const seoTitleData = getSeoTitleData(filter);

  React.useEffect(() => {
    const list = hasActiveFilters(filter) ? "category filter" : "category";
    TagManager.push(
      EnhancedEcommerce.impressions(products, list, {
        page: pagination?.currentPage,
        perPage: pagination?.perPage,
      })
    );
  }, [products]);

  const JSXtitle = (
    <Col xs={24}>
      <h1>
        {get(category, "name")}
        {!isEmpty(seoTitleData) ? (
          <small> | {seoTitleData.join(", ")}</small>
        ) : (
          ""
        )}
      </h1>
    </Col>
  );

  let JSXcoverPhoto = "";
  if (category?.coverPhoto) {
    JSXcoverPhoto = (
      <Col xs={24}>
        <div>
          <Image
            className={"image"}
            photo={category?.coverPhoto}
            size={"1200x180__cropped"}
            type={"jpg"}
          />
        </div>
      </Col>
    );
  }

  let JSXdescription = "";
  if (get(category, "description")) {
    JSXdescription = (
      <Col xs={24}>
        <div
          dangerouslySetInnerHTML={{
            __html: get(category, "description", ""),
          }}
        />
      </Col>
    );
  }

  let JSXsubcategories = "";
  if (!isEmpty(get(category, "childCategories", []))) {
    JSXsubcategories = (
      <Row gutter={[15, 15]}>
        {map(get(category, "childCategories", []), (subCategory, index) => {
          const { id, name, urlName, mainPhoto = null } = subCategory;
          return (
            <Col key={`subcategory-${id}-${index}`}>
              <Link {...getCategoryLinkAttributes(urlName)}>
                <Button
                  icon={<Image photo={mainPhoto} size={"18x18"} type={"png"} />}
                >
                  {name}
                </Button>
              </Link>
            </Col>
          );
        })}
      </Row>
    );
  }

  return (
    <div className={"container guttered"}>
      <MetaData {...meta} />
      {useMemo(
        () => (
          <Breadcrumbs data={breadcrumbs} />
        ),
        [breadcrumbs]
      )}

      <Row gutter={[15, 15]} justify="space-around">
        <Col xs={24} md={8} lg={4}>
          <JSXCategoryParameters />
        </Col>
        <Col xs={24} md={16} lg={20}>
          {isArray(products) && !isEmpty(products) ? (
            <>
              <Row gutter={[0, 15]}>
                {JSXtitle}

                {JSXcoverPhoto}

                {JSXdescription}

                {JSXsubcategories}

                {!isEmpty(get(category, "promotedProducts", [])) ? (
                  <Col xs={24}>
                    {useMemo(
                      () => (
                        <CategoryPromotedProducts
                          products={get(category, "promotedProducts")}
                        />
                      ),
                      []
                    )}
                  </Col>
                ) : (
                  ""
                )}

                {useMemo(
                  () => (
                    <Col xs={24}>
                      <CategoryOrdering />
                    </Col>
                  ),
                  []
                )}

                {useMemo(
                  () => (
                    <Col xs={24}>
                      <CategorySelected />
                    </Col>
                  ),
                  []
                )}
              </Row>

              <Row gutter={[15, 15]}>
                {map(products, (product, index) => {
                  return (
                    <Col
                      xs={12}
                      sm={8}
                      md={8}
                      lg={6}
                      key={`products-category-${product.id}-${index}`}
                    >
                      <ProductCard
                        {...product}
                        options={{
                          eecProduct: {
                            position: index + 1,
                            page: pagination?.currentPage,
                            perPage: pagination?.perPage,
                          },
                        }}
                      />
                    </Col>
                  );
                })}
              </Row>

              <Divider />
              <Pagination {...pagination} />
            </>
          ) : (
            <>
              {useMemo(
                () => (
                  <CategorySelected />
                ),
                []
              )}
              <Result
                icon={<FrownOutlined />}
                title="Ľutujeme, nenašli sa produkty"
                subTitle={`Vášmu výberu nezodpovedaju žiadne produkty. Zmente prosím kategóriu alebo kombináciu filtrov.`}
              />
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export async function getServerSideProps(context) {
  return categoryPage.serverSideProps(context);
}

export default Category;
