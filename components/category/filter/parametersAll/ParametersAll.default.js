import { useState } from "react";
import { Modal, Button, Tabs } from "antd";
import { useRouter } from "next/router";
import useFilter, {
  paramsToPath,
  arrayToParams,
  getSystemFilterAttributes,
} from "grandus-lib/hooks/useFilter";
import { get, split, groupBy, map } from "lodash";

import ElementCheckbox from "components/category/categoryElements/CategoryElementCheckbox";
import ElementRadio from "components/category/categoryElements/CategoryElementRadio";
import ElementSelect from "components/category/categoryElements/CategoryElementSelectbox";
import ElementSlider from "components/category/categoryElements/CategoryElementSlider";
import ElementPrice from "components/category/categoryElements/CategoryElementPrice";
import Link from "next/link";

import stylesDefault from "./ParametersAll.default.module.scss";

const { TabPane } = Tabs;

const ParametersAll = ({ selected, handleChange, styles }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const router = useRouter();
  const { filter, isLoading } = useFilter({
    category: get(router, "query.category"),
    parameters: split(
      paramsToPath(arrayToParams(get(router, "query.parameters", []))),
      "/"
    ),
  });

  const categoryData = filter;

  const groupedParameters = groupBy(
    get(categoryData, "parameters", []),
    (parameter) =>
      get(parameter, "group") ? get(parameter, "group") : "Ostatné"
  );

  let iterator = 1;

  return (
    <div className={stylesDefault.wrapper}>
      <Button type="primary" block loading={isLoading} onClick={showModal}>
        Všetky parametre
      </Button>

      <Link
        href={`/kategoria/${get(
          categoryData,
          "selected.category.data.urlName"
        )}`}
      >
        <Button type="text" block>
          zrušiť všetky filtre
        </Button>
      </Link>

      <Modal
        wrapClassName={stylesDefault.modal}
        title="Všetky parametre"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
        footer={[
          <Link
            href={`/kategoria/${get(
              categoryData,
              "selected.category.data.urlName"
            )}`}
          >
            <Button type="text">zrušiť všetky filtre</Button>
          </Link>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={handleOk}
          >
            Zobraziť{" "}
            {get(categoryData, "productsCount")
              ? `${get(categoryData, "productsCount")} ${
                  get(categoryData, "productsCount") == 1
                    ? "položku"
                    : get(categoryData, "productsCount") < 5
                    ? "položky"
                    : "položiek"
                }`
              : ""}
          </Button>,
        ]}
      >
        <Tabs type="card" tabPosition="left">
          <TabPane tab="Základné" key="1">
            <ElementPrice
              selected={{
                min: get(
                  categoryData,
                  "selected.price.from.data.price",
                  get(categoryData, "minPrice")
                ),
                max: get(
                  categoryData,
                  "selected.price.to.data.price",
                  get(categoryData, "maxPrice")
                ),
              }}
              handleChange={handleChange}
              options={{
                min: get(categoryData, "minPrice"),
                max: get(categoryData, "maxPrice"),
                styles,
              }}
            />

            <ElementSelect
              {...getSystemFilterAttributes(
                get(categoryData, "storeLocations", []),
                "storeLocation",
                {
                  selected,
                  handleChange,
                  styles,
                }
              )}
              attributes={{
                showSearch: true,
                mode: "tags",
                placeholder: "Vyberte predajňu",
              }}
            />

            <ElementCheckbox
              {...getSystemFilterAttributes(
                get(categoryData, "statuses", []),
                "status",
                {
                  selected,
                  handleChange,
                  styles,
                }
              )}
            />
          </TabPane>

          {map(groupedParameters, (group, index) => {
            iterator = iterator + 1;
            return (
              <TabPane tab={index} key={`parameter-${iterator}-${index}`}>
                {map(group, (parameter, index) => {
                  const propsData = {
                    key: `category-all-parameters-${get(
                      parameter,
                      "id"
                    )}-${index}`,
                    parameter: parameter,
                    selected: selected,
                    handleChange: handleChange,
                    options: {
                      styles: styles,
                      //   ...getShowMoreAttributes(
                      //     parameter,
                      //     openedParameter,
                      //     onClickToggleOpen
                      //   ),
                    },
                  };

                  switch (parameter?.type) {
                    case "select":
                      return (
                        <ElementSelect
                          {...propsData}
                          attributes={{ showSearch: true }}
                        />
                      );
                    case "selectMultiple":
                      return (
                        <ElementSelect
                          {...propsData}
                          attributes={{
                            showSearch: false,
                            mode: "multiple",
                          }}
                        />
                      );
                    case "radio":
                      return <ElementRadio {...propsData} />;
                    case "slider":
                      return <ElementSlider {...propsData} />;
                    case "checkbox":
                    case "dropdown": //fallback
                    default:
                      return <ElementCheckbox {...propsData} />;
                  }
                })}
              </TabPane>
            );
          })}
        </Tabs>
      </Modal>
    </div>
  );
};

export default ParametersAll;
