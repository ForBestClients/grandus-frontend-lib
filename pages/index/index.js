import styles from "./index.page.module.scss";
import { indexPage } from "grandus-lib/utils/fetches";
import EnhancedEcommerce from "grandus-lib/utils/ecommerce";
import TagManager from "grandus-lib/utils/gtag";

import { Row, Col, Divider, Carousel } from "antd";
import { get } from "lodash";
import Link from "next/link";

import dynamic from "next/dynamic";
const MetaData = dynamic(() =>
  import("grandus-lib/components-atomic/MetaData")
);
const Content = dynamic(() =>
  import("grandus-lib/components-atomic/content/Content")
);
const ProductCard = dynamic(() =>
  import("components/product/card/ProductCard")
);
const BlogCard = dynamic(() => import("components/blog/card/BlogCard"));
const Image = dynamic(() =>
  import("grandus-lib/components-atomic/image/Image")
);

const HomepageContent = ({ pages }) => {
  if (!pages) return null;

  return (
    <>
      {pages.map((page, index) => {
        const { id, content, customJavascript, customCss } = page;
        return (
          <Content
            content={content}
            css={customCss}
            js={customJavascript}
            key={`static-page-${id}-${index}`}
          />
        );
      })}
    </>
  );
};

const Homepage = (props) => {
  const {
    meta = {},
    banners = [],
    banners01 = [],
    products = [],
    productsNew = [],
    blogs = [],
    homepageStaticPageLocation1 = [],
    homepageStaticPageLocation2 = [],
    homepageStaticPageLocation3 = [],
    homepageStaticPageLocation4 = [],
    homepageStaticPageLocation5 = [],
  } = props;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    slidesToShow: 6,
    responsive: [
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
        },
      },
    ],
  };

  React.useEffect(() => {
    TagManager.push(
      EnhancedEcommerce.impressions(products, "homepage favourite products")
    );
    TagManager.push(
      EnhancedEcommerce.impressions(productsNew, "homepage new products")
    );
  }, []);

  meta.options = {
    image: {
      dimensions: "1200",
      width: 1200,
      height: -1,
    },
  };
  meta.photo = get(banners, "[0].photo", {});

  return (
    <section className={styles.wrapper}>
      <MetaData {...meta} />
      <main className={"container guttered"}>
        {/* STATIC PAGES LOCATION 01 */}
        <HomepageContent pages={homepageStaticPageLocation1} />

        {/* BANNERS */}
        <div className={styles["homepage-banners-section"]}>
          <Row gutter={[{ xs: 0, sm: 10 }, 10]}>
            <Col xs={24} md={18}>
              <Carousel autoplay>
                {banners.map((banner, index) => {
                  const { id, url, photo } = banner;
                  if (!url) {
                    return (
                      <div
                        key={`banners-${id}-${index}`}
                        className={styles["homepage-banner"]}
                      >
                        <Image
                          photo={photo}
                          size={"1078x426__cropped"}
                          type={"jpg"}
                        />
                      </div>
                    );
                  }

                  if (url.startsWith("/")) {
                    return (
                      <div
                        key={`banners-${id}-${index}`}
                        className={styles["homepage-banner"]}
                      >
                        <Link href={url}>
                          <a>
                            <Image
                              photo={photo}
                              size={"1078x426__cropped"}
                              type={"jpg"}
                            />
                          </a>
                        </Link>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={`banners-${id}-${index}`}
                        className={styles["homepage-banner"]}
                      >
                        <a href={url}>
                          <Image
                            photo={photo}
                            size={"1078x426__cropped"}
                            type={"jpg"}
                          />
                        </a>
                      </div>
                    );
                  }
                })}
              </Carousel>
            </Col>

            <Col xs={24} md={6}>
              <Carousel autoplay>
                {banners01.map((banner, index) => {
                  const { id, url, photo } = banner;

                  if (!url) {
                    return (
                      <div
                        key={`banners-custom-${id}-${index}`}
                        className={styles["homepage-banner"]}
                      >
                        <Image
                          photo={photo}
                          size={"360x432__cropped"}
                          type={"jpg"}
                        />
                      </div>
                    );
                  }

                  if (url.startsWith("/")) {
                    return (
                      <div
                        key={`banners-custom-${id}-${index}`}
                        className={styles["homepage-banner"]}
                      >
                        <Link href={url}>
                          <a>
                            <Image
                              photo={photo}
                              size={"360x432__cropped"}
                              type={"jpg"}
                            />
                          </a>
                        </Link>
                      </div>
                    );
                  } else {
                    return (
                      <a
                        href={url}
                        key={`banners-custom-${id}-${index}`}
                        className={styles["homepage-banner"]}
                      >
                        <Image
                          photo={photo}
                          size={"360x432__cropped"}
                          type={"jpg"}
                        />
                      </a>
                    );
                  }
                })}
              </Carousel>
            </Col>
          </Row>
        </div>

        {/* STATIC PAGES LOCATION 02 */}
        <HomepageContent pages={homepageStaticPageLocation2} />

        <Divider>Odporúčané produkty</Divider>
        <Carousel autoplay {...settings} style={{ padding: "30px 0" }}>
          {products.map((product, index) => {
            return (
              <div
                style={{ padding: "20px", margin: "20px" }}
                key={`products-${product.id}-${index}`}
              >
                <ProductCard {...product} />
              </div>
            );
          })}
        </Carousel>

        {/* STATIC PAGES LOCATION 03 */}
        <HomepageContent pages={homepageStaticPageLocation3} />

        <Divider>Nové na sklade</Divider>
        <Row gutter={[{ xs: 0, sm: 10 }, 10]}>
          {productsNew.map((product, index) => {
            return (
              <Col
                xs={12}
                sm={8}
                md={6}
                lg={4}
                xxl={3}
                key={`products-news-${product.id}-${index}`}
              >
                <ProductCard {...product} />
              </Col>
            );
          })}
        </Row>
      </main>

      {/* STATIC PAGES LOCATION 04 */}
      <HomepageContent pages={homepageStaticPageLocation4} />

      {/* BLOGS */}
      <main className={"container guttered"}>
        <Divider>Posledné z našich blogov</Divider>
        <Row gutter={[{ xs: 0, sm: 10 }, 10]} justify="space-around">
          {blogs.map((blog, index) => {
            const { id } = blog;
            return (
              <Col xs={24} md={8} key={`banners-${id}-${index}`}>
                <BlogCard {...blog} />
              </Col>
            );
          })}
        </Row>
      </main>

      {/* STATIC PAGES LOCATION 05 */}
      <HomepageContent pages={homepageStaticPageLocation5} />
    </section>
  );
};

export async function getServerSideProps(context) {
  return indexPage.serverSideProps(context);
}

export default Homepage;
