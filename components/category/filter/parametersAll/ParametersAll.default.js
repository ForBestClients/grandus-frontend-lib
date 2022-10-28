import { useState } from "react";
import { Modal, Button, Tabs } from "antd";
import useFilter, {
  paramsToPath,
  arrayToParams,
  getSystemFilterAttributes,
} from "grandus-lib/hooks/useFilter";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import map from "lodash/map";

import ElementCheckbox from "components/category/categoryElements/CategoryElementCheckbox";
import ElementRadio from "components/category/categoryElements/CategoryElementRadio";
import ElementSelect from "components/category/categoryElements/CategoryElementSelectbox";
import ElementSlider from "components/category/categoryElements/CategoryElementSlider";
import ElementPrice from "components/category/categoryElements/CategoryElementPrice";
import Link from "next/link";

import stylesDefault from "./ParametersAll.default.module.scss";

const { TabPane } = Tabs;

/*
List of options to use with component

Available texts:
options.text : {
  nonGroupedParametersLabel : "Ostatné",
  basicParametersLabel : "Základné",
  allParametersButtonLabel : "Všetky parametre",
  cancelAllFiltrationsButtonLabel : "zrušiť všetky filtre",
  showCount : "Zobraziť",
  itemsCountOne : "položku",
  itemsCountLessThan5 : "položky",
  itemsCountMoreThan5 : "položiek",
  chooseStoreLabel : "Vyberte predajňu",
  storeLabel : "Predajňa"
}

allow / disallow basic filtrations : 
options.filter : {
  sytemFilter : true,
  systemFilter_price : true,
  systemFilter_storeLocation : true,
  systemFilter_status : true
}
*/

const ParametersAll = ({ selected, handleChange, styles, options }) => {
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

  const { filter, isLoading } = useFilter({
    useDataFromRouter: true,
  });

  const categoryData = filter;

  const groupedParameters = groupBy(
    get(categoryData, "parameters", []),
    (parameter) =>
      get(parameter, "group")
        ? get(parameter, "group")
        : get(options, "text.nonGroupedParametersLabel", "Ostatné")
  );

  let iterator = 1;

  return (
    <div className={stylesDefault.wrapper}>
      <Button type="primary" block loading={isLoading} onClick={showModal}>
        {get(options, "text.allParametersButtonLabel", "Všetky parametre")}
      </Button>

      <Link
        href={`/kategoria/${get(
          categoryData,
          "selected.category.data.urlName"
        )}`}
      >
        <Button type="text" block>
          {get(
            options,
            "text.cancelAllFiltrationsButtonLabel",
            "zrušiť všetky filtre"
          )}
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
            <Button type="text">
              {get(
                options,
                "text.cancelAllFiltrationsButtonLabel",
                "zrušiť všetky filtre"
              )}
            </Button>
          </Link>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={handleOk}
          >
            {get(options, "text.showCount", "Zobraziť")}{" "}
            {get(categoryData, "productsCount")
              ? `${get(categoryData, "productsCount")} ${
                  get(categoryData, "productsCount") == 1
                    ? get(options, "text.itemsCountOne", "položku")
                    : get(categoryData, "productsCount") < 5
                    ? get(options, "text.itemsCountLessThan5", "položky")
                    : get(options, "text.itemsCountMoreThan5", "položiek")
                }`
              : ""}
          </Button>,
        ]}
      >
        <Tabs type="card" tabPosition="left">
          {get(options, "filter.systemFilter", true) ? (
            <TabPane
              tab={get(options, "text.basicParametersLabel", "Základné")}
              key="1"
            >
              {get(options, "filter.systemFilter_price", true) ? (
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
              ) : (
                ""
              )}

              {get(options, "filter.systemFilter_storeLocation", true) ? (
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
                    placeholder: get(
                      options,
                      "text.chooseStoreLabel",
                      "Vyberte predajňu"
                    ),
                  }}
                />
              ) : (
                ""
              )}

              {get(options, "filter.systemFilter_status", true) ? (
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
              ) : (
                ""
              )}
            </TabPane>
          ) : (
            ""
          )}

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
