import { useState, useMemo, useEffect } from "react";
import { categoryPage } from "grandus-lib/utils/fetches";
import { get, map, isEmpty, isArray } from "lodash";
import { Button, Row, Col } from "antd";
import { getSeoTitleData, hasActiveFilters } from "grandus-lib/hooks/useFilter";
import EnhancedEcommerce from "grandus-lib/utils/ecommerce";
import TagManager from "grandus-lib/utils/gtag";

import ProductCard from "components/product/card/ProductCard";
import MetaData from "grandus-lib/components-atomic/MetaData";
import Breadcrumbs from "components/breadcrumbs/Breadcrumbs";
import CategoryParameters from "components/category/CategoryParameters";
import CategoryOrdering from "components/category/CategoryOrdering";
import CategoryPromotedProducts from "components/category/CategoryPromotedProducts";
import CategorySelected from "components/category/CategorySelected";
import Pagination from "components/pagination/Pagination";

import styles from "./category.page.default.module.scss";

import {
  Title,
  CoverPhoto,
  Description,
  SubCategories,
} from "./category.partials.default";

export const JSXCategoryParameters = ({ filter, handleGetData = null }) => {
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
            <CategoryParameters
              initialData={filter}
              handleGetData={handleGetData}
            />
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

  useEffect(() => {
    const list = hasActiveFilters(filter) ? "category filter" : "category";
    TagManager.push(
      EnhancedEcommerce.impressions(products, list, {
        page: pagination?.currentPage,
        perPage: pagination?.perPage,
      })
    );
  }, [products]);

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
          <Row gutter={[0, 15]}>
            <Title
              title={get(category, "name")}
              subtitle={isEmpty(seoTitleData) ? "" : seoTitleData.join(", ")}
            />

            <CoverPhoto photo={category?.coverPhoto} />

            <Description description={category?.description} />

            <SubCategories
              subCategories={get(category, "childCategories", [])}
            />

            {!isEmpty(get(category, "promotedProducts", [])) ? (
              <Col xs={24}>
                {useMemo(
                  () => (
                    <CategoryPromotedProducts
                      products={get(category, "promotedProducts")}
                    />
                  ),
                  [category?.promotedProducts]
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

          {isArray(products) && !isEmpty(products) ? (
            <>
              <Row gutter={[15, 15]}>
                {map(products, (product, index) => {
                  return (
                    <Col
                      xs={12}
                      sm={8}
                      md={8}
                      lg={6}
                      key={`products-category-${product?.id}-${index}`}
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

              <Pagination {...pagination} />
            </>
          ) : (
            <Row gutter={[15, 15]}>
              <Col xs={24}>
                <Title title={"Ľutujeme, nenašli sa produkty"} />
                <Description
                  description={
                    "Vášmu výberu nezodpovedaju žiadne produkty. Zmente prosím kategóriu alebo kombináciu filtrov."
                  }
                />
              </Col>
            </Row>
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
