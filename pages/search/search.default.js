import { useMemo } from "react";
import { searchPage } from "grandus-lib/utils/fetches";
import { getSeoTitleData } from "grandus-lib/hooks/useFilter";
import { get, isArray, isEmpty, map } from "lodash";
import { Row, Col } from "antd";
import {
  getSearchLinkAttributes,
  getSearchLinkAttributesFromRouter,
  paramsToPath,
} from "grandus-lib/hooks/useFilter";

import { useRouter } from "next/router";

import ProductCard from "components/product/card/ProductCard";
import MetaData from "grandus-lib/components-atomic/MetaData";
import Breadcrumbs from "components/breadcrumbs/Breadcrumbs";
import CategoryOrdering from "components/category/CategoryOrdering";
import CategorySelected from "components/category/CategorySelected";
import Pagination from "components/pagination/Pagination";

import { Title, Description } from "../category/category.partials.default";
import { JSXCategoryParameters } from "../category/category.default";

const handleGetData = (router, newState) => {
  const data = getSearchLinkAttributes(
    get(router, "query.term"),
    paramsToPath(newState),
    get(router, "query"),
    { toDelete: ["term", "parameters", "page"] },
    router
  );

  return data;
};

const handleOrderingLinkAttributes = (router, ordering) => {
  return getSearchLinkAttributesFromRouter(router, {
    dataToChange: { orderBy: ordering },
    toDelete: ["term", "parameters", "page"],
  });
};

const handlePaginationLinkAttributes = (router, data) => {
  return getSearchLinkAttributesFromRouter(router, data);
};

const Search = (props) => {
  const { products, pagination, filter, meta } = props;
  const router = useRouter();
  const searchTerm = get(router, "query.term");
  const seoTitleData = getSeoTitleData(filter);
  const title = `Hľadaný výraz: "${searchTerm}"`;
  const breadcrumbs = { childrens: [{ name: "Vyhľadávanie", href: "/" }] };
  const hasProducts = isArray(products) && !isEmpty(products);
  return (
    <div className={"container guttered"}>
      <MetaData {...meta} title={title} />
      {useMemo(
        () => (
          <Breadcrumbs data={breadcrumbs} current={title} />
        ),
        [breadcrumbs]
      )}

      <Row gutter={[15, 15]} justify="space-around">
        <Col xs={24} md={8} lg={4}>
          {hasProducts ? (
            <JSXCategoryParameters
              filter={filter}
              handleGetData={handleGetData}
            />
          ) : (
            ""
          )}
        </Col>
        <Col xs={24} md={16} lg={20}>
          <Row gutter={[0, 15]}>
            {hasProducts ? (
              <Title
                title={title}
                subtitle={isEmpty(seoTitleData) ? "" : seoTitleData.join(", ")}
              />
            ) : (
              ""
            )}

            {useMemo(
              () => (
                <Col xs={24}>
                  {hasProducts ? (
                    <CategoryOrdering
                      handleLinkAttributes={handleOrderingLinkAttributes}
                    />
                  ) : (
                    ""
                  )}
                </Col>
              ),
              []
            )}

            {useMemo(
              () => (
                <Col xs={24}>
                  <CategorySelected handleGetData={handleGetData} />
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
                      key={`products-search-${product?.id}-${index}`}
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

              <Pagination
                {...pagination}
                handleLinkAttributes={handlePaginationLinkAttributes}
              />
            </>
          ) : (
            <Row gutter={[15, 15]}>
              <Col xs={24}>
                <Title
                  title={`Je nám ľúto, pre hľadaný výraz "${searchTerm}" sa nenašli žiadne výsledky`}
                />
                <Description
                  description={
                    "Vášmu výberu nezodpovedaju žiadne produkty. Zmente prosím hľadanú frázu, kategóriu alebo kombináciu filtrov."
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
  return searchPage.serverSideProps(context);
}

export default Search;
