import useSWR from "swr";
import { get, indexOf, remove, uniq } from "lodash";
import Link from "next/link";
import { getCategoryLinkAttributes } from "grandus-lib/hooks/useFilter";
import { useState } from "react";

import styles from "./Menu.default.module.scss";

import dynamic from "next/dynamic";
const Image = dynamic(() =>
  import("grandus-lib/components-atomic/image/Image")
);

const Menu = ({ isOpen = false, updateOpenedMenu, options = {} }) => {
  const { data, error } = useSWR(
    "/api/lib/v1/categories",
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const [openedCategories, setOpenedCategory] = useState([]);
  const onClickToggleOpenCategory = (categoryId) => {
    if (indexOf(openedCategories, categoryId) >= 0) {
      setOpenedCategory(remove(openedCategories, (n) => n != categoryId));
    } else {
      setOpenedCategory(uniq([...openedCategories, categoryId]));
    }
  };
  return (
    <div className={styles["megamenu"]}>
      <nav style={{ listStyle: "none" }}>
        {!data ? (
          <ul className={styles.main} style={{ height: "50px" }}>
            <li>&nbsp;</li>
          </ul>
        ) : (
          <ul className={`${styles.main} ${isOpen ? styles.open : ""}`}>
            <li className={styles.logo}>
              <Link href="/" as={`/`}>
                <a
                  className={styles.mobile}
                  onClick={() => {
                    updateOpenedMenu(false);
                  }}
                >
                  {options?.logo ? (
                    <Image
                      photo={options.logo}
                      size={
                        options.logo?.id +
                        (options.logo?.resolution
                          ? options.logo.resolution
                          : "/180x44")
                      }
                      type={"png"}
                    />
                  ) : (
                    ""
                  )}
                </a>
              </Link>
              <a
                href="#"
                onClick={() => {
                  updateOpenedMenu(false);
                  return false;
                }}
                className={styles.mobile}
              >
                x
              </a>
            </li>
            <li>
              <Link href="/porovnanie" as={`/porovnanie`}>
                <a
                  className={styles.mobile}
                  onClick={() => {
                    updateOpenedMenu(false);
                  }}
                >
                  Porovnanie
                </a>
              </Link>
            </li>
            <li>
              <Link href="/wishlist" as={`/wishlist`}>
                <a
                  className={styles.mobile}
                  onClick={() => {
                    updateOpenedMenu(false);
                  }}
                >
                  Wishlist
                </a>
              </Link>
            </li>
            <li className={styles.separator}></li>
            {data.map((item, index) => {
              const submenuItemsCount = get(item, "children", []).length;
              return (
                <li key={`menu-item-${get(item, "id")}-${index}`}>
                  {get(item, "externalUrl") ? (
                    <>
                      <a
                        className={
                          submenuItemsCount ? styles["has-submenu"] : ""
                        }
                        href={get(item, "externalUrl")}
                      >
                        {get(item, "name")}
                      </a>
                      <a
                        className={`${
                          submenuItemsCount ? styles["has-submenu"] : ""
                        } ${styles.mobile}`}
                        href={get(item, "externalUrl")}
                        onClick={function (e) {
                          if (submenuItemsCount) {
                            e.preventDefault();
                            onClickToggleOpenCategory(get(item, "id"));
                          }
                        }}
                      >
                        {get(item, "name")}
                      </a>
                    </>
                  ) : (
                    <>
                      <Link
                        {...getCategoryLinkAttributes(get(item, "urlName"))}
                        scroll={true}
                      >
                        <a
                          className={
                            submenuItemsCount ? styles["has-submenu"] : ""
                          }
                        >
                          {get(item, "name")}
                        </a>
                      </Link>
                      <a
                        className={`${
                          submenuItemsCount ? styles["has-submenu"] : ""
                        } ${styles.mobile}`}
                        onClick={function () {
                          onClickToggleOpenCategory(get(item, "id"));
                        }}
                      >
                        {get(item, "name")}
                      </a>
                    </>
                  )}

                  {submenuItemsCount ? (
                    <div
                      className={`${styles["megamenu-item"]} ${
                        indexOf(openedCategories, get(item, "id")) >= 0
                          ? styles.open
                          : ""
                      }`}
                    >
                      {get(item, "children", []).map((subItem, index) => {
                        const hasSubSubmenu = get(subItem, "children", [])
                          .length;
                        return (
                          <div
                            key={`menu-sub-item-${get(item, "id")}-${get(
                              subItem,
                              "id"
                            )}-${index}`}
                            className={`${styles["mo-column"]} ${
                              styles[
                                `mo-col-${
                                  submenuItemsCount > 5 ? 5 : submenuItemsCount
                                }`
                              ]
                            }`}
                          >
                            {index == 0 ? (
                              <Link
                                {...getCategoryLinkAttributes(
                                  get(item, "urlName")
                                )}
                                scroll={true}
                              >
                                <a
                                  className={`${styles["megamenu-title"]} ${styles.mobile}`}
                                  onClick={() => {
                                    updateOpenedMenu(false);
                                  }}
                                >
                                  Všetko z kategórie {get(item, "name")}
                                </a>
                              </Link>
                            ) : (
                              ""
                            )}
                            <Link
                              {...getCategoryLinkAttributes(
                                get(subItem, "urlName")
                              )}
                              scroll={true}
                            >
                              <a
                                className={`${styles["megamenu-title"]} ${
                                  hasSubSubmenu ? styles["has-submenu"] : ""
                                }`}
                              >
                                <Image
                                  photo={get(subItem, "alternativePhoto", {})}
                                  size={"20x28"}
                                  type={"png"}
                                />
                                {get(subItem, "name")}
                              </a>
                            </Link>
                            <a
                              className={`${
                                hasSubSubmenu ? styles["has-submenu"] : ""
                              } ${styles.mobile}`}
                              onClick={function () {
                                onClickToggleOpenCategory(get(subItem, "id"));
                              }}
                            >
                              {get(subItem, "name")}
                            </a>
                            {hasSubSubmenu ? (
                              <div
                                className={`${styles["megamenu-wrap"]} ${
                                  indexOf(
                                    openedCategories,
                                    get(subItem, "id")
                                  ) >= 0
                                    ? styles.open
                                    : ""
                                }`}
                              >
                                <ul>
                                  <li>
                                    <Link
                                      {...getCategoryLinkAttributes(
                                        get(subItem, "urlName")
                                      )}
                                      scroll={true}
                                    >
                                      <a
                                        className={`${styles.mobile}`}
                                        onClick={() => {
                                          updateOpenedMenu(false);
                                        }}
                                      >
                                        Všetko z kategórie{" "}
                                        {get(subItem, "name")}
                                      </a>
                                    </Link>
                                  </li>
                                  {subItem.children.map((subSubItem, index) => {
                                    if (index == 6 && hasSubSubmenu !== index) {
                                      return (
                                        <li
                                          key={`menu-sub-item-${get(
                                            item,
                                            "id"
                                          )}-${get(subItem, "id")}-${get(
                                            subSubItem,
                                            "id",
                                            "000"
                                          )}-${index}`}
                                        >
                                          <Link
                                            {...getCategoryLinkAttributes(
                                              get(subItem, "urlName")
                                            )}
                                            scroll={true}
                                          >
                                            <a>
                                              <u>Zobraziť ďaľšie</u>
                                            </a>
                                          </Link>
                                        </li>
                                      );
                                    }
                                    if (index > 6) {
                                      return "";
                                    }
                                    return (
                                      <li
                                        key={`menu-sub-item-${get(
                                          item,
                                          "id"
                                        )}-${get(subItem, "id")}-${get(
                                          subSubItem,
                                          "id"
                                        )}-${index}`}
                                      >
                                        <Link
                                          {...getCategoryLinkAttributes(
                                            get(subSubItem, "urlName")
                                          )}
                                          scroll={true}
                                        >
                                          <a
                                            className={styles.always}
                                            onClick={() => {
                                              updateOpenedMenu(false);
                                            }}
                                          >
                                            {get(subSubItem, "name")}
                                          </a>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    ""
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );
};

export default Menu;