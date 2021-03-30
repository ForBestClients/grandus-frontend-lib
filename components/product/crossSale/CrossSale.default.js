import { get, isEmpty, map, orderBy } from "lodash";

import Image from "grandus-lib/components-atomic/image/Image";
import ProductCard from "components/product/card/ProductCard";

import styles from "./CrossSale.default.module.scss";

import { Tabs, Carousel } from "antd";
const { TabPane } = Tabs;

const CrossSaleHeadline = ({ title, photo = {} }) => {
  return (
    <span>
      {get(photo, "id") ? (
        <Image photo={photo} size={"30x30"} type={"jpg"} />
      ) : (
        ""
      )}{" "}
      {title}
    </span>
  );
};

const CrossSale = ({ data, options }) => {
  if (isEmpty(data)) {
    return "";
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 1000,
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
    ...get(options, 'carouselSettings', {})
  };

  return (
    <div className={styles.wrapper}>
      <Tabs>
        {map(orderBy(data, ["priority"], ["desc"]), (rule, i) => {
          if (get(rule, "hash")) {
            return;
          }

          if (isEmpty(get(rule, "products", []))) {
            return;
          }

          const { name, photo = {} } = rule;
          return (
            <TabPane
              tab={<CrossSaleHeadline title={name} photo={photo} />}
              key={i}
            >
              <Carousel autoplay {...settings} style={{ padding: "15px 0" }}>
                {get(rule, "products", []).map((product, index) => {
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
            </TabPane>
          );
        })}
      </Tabs>
    </div>
  );
};

export default CrossSale;
