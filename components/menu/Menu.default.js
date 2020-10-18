import useSWR from "swr";
import { get, indexOf, remove, uniq } from "lodash";
import Link from "next/link";
import { getCategoryLinkAttributes } from "grandus-lib/hooks/useFilter";
import { getImageUrl } from "grandus-lib/utils";
import { useState } from "react";

import styles from "./Menu.default.module.scss";

import dynamic from "next/dynamic";
const Image = dynamic(() =>
  import("grandus-lib/components-atomic/image/Image")
);

const generateKey = (level = 0, id, key, suffix = "") =>
  `category-menu-level-${level}-${id}-${key}${suffix}`;

const LinkMobileAll = ({ name, urlName, onClickMethod }) => {
  return (
    <Link {...getCategoryLinkAttributes(urlName)} scroll={true}>
      <a className={styles.mobile} onClick={() => onClickMethod(false)}>
        {`Všetko z kategórie ${name}`}
      </a>
    </Link>
  );
};

const LinkMobile = ({ item, onClickMethod, onClickMethod2 }) => {
  const hasSubmenu = get(item, "children", []).length > 0;
  const hasSubmenuCssClass = hasSubmenu ? styles["has-submenu"] : "";
  return (
    <Link
      {...getCategoryLinkAttributes(
        item?.urlName,
        "",
        {},
        { absoluteHref: get(item, "externalUrl") }
      )}
      scroll={true}
    >
      <a
        className={hasSubmenuCssClass + " " + styles.mobile}
        onClick={(e) => {
          if (hasSubmenu) {
            e.preventDefault();
            onClickMethod(item?.id);
          } else {
            onClickMethod2(false);
          }
        }}
      >
        {item?.name}
      </a>
    </Link>
  );
};

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
            <li className={styles.logo + " " + styles.mobile}>
              <Link href="/" as={`/`}>
                <a
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
              >
                x
              </a>
            </li>
            {get(options, "disables.login") ? (
              ""
            ) : (
              <li className={styles.mobile}>
                <Link href="/prihlasenie" as={`/prihlasenie`}>
                  <a
                    onClick={() => {
                      updateOpenedMenu(false);
                    }}
                  >
                    Prihlásenie
                  </a>
                </Link>
              </li>
            )}
            {get(options, "disables.compare") ? (
              ""
            ) : (
              <li className={styles.mobile}>
                <Link href="/porovnanie" as={`/porovnanie`}>
                  <a
                    onClick={() => {
                      updateOpenedMenu(false);
                    }}
                  >
                    Porovnanie
                  </a>
                </Link>
              </li>
            )}

            {get(options, "disables.wishlist") ? (
              ""
            ) : (
              <li className={styles.mobile}>
                <Link href="/wishlist" as={`/wishlist`}>
                  <a
                    onClick={() => {
                      updateOpenedMenu(false);
                    }}
                  >
                    Zoznam obľúbených produktov
                  </a>
                </Link>
              </li>
            )}

            <li className={styles.separator}></li>

            {data.map((item, index) => {
              const submenuItemsCount = get(item, "children", []).length;
              return (
                <li key={generateKey(0, item?.id, index)}>
                  <Link
                    {...getCategoryLinkAttributes(
                      item?.urlName,
                      "",
                      {},
                      { absoluteHref: get(item, "externalUrl") }
                    )}
                    scroll={true}
                  >
                    <a
                      className={submenuItemsCount ? styles["has-submenu"] : ""}
                    >
                      {get(item, "name")}
                    </a>
                  </Link>
                  <LinkMobile
                    item={item}
                    onClickMethod={onClickToggleOpenCategory}
                    onClickMethod2={updateOpenedMenu}
                  />

                  {submenuItemsCount ? (
                    <div
                      className={`${styles["megamenu-item"]} ${
                        indexOf(openedCategories, get(item, "id")) >= 0
                          ? styles.open
                          : ""
                      }`}
                    >
                      <div
                        className={`${styles["column"]} ${
                          get(options, "megamenu.type") == "auto"
                            ? styles["menu-col-auto"]
                            : ""
                        } ${styles.mobile}`}
                      >
                        <LinkMobileAll
                          name={get(item, "name")}
                          urlName={get(item, "urlName")}
                          onClickMethod={updateOpenedMenu}
                        />
                      </div>

                      {get(item, "children", []).map((subItem, index) => {
                        const hasSubSubmenu = get(subItem, "children", [])
                          .length;
                        let divStyle = {};
                        if (get(subItem, "alternativePhoto.path")) {
                          divStyle = {
                            backgroundImage: `url("${getImageUrl(
                              subItem?.alternativePhoto,
                              "150x150",
                              "jpg"
                            )}")`,
                          };
                        }
                        return (
                          <div
                            style={divStyle}
                            key={generateKey(1, subItem?.id, index)}
                            className={`${styles["column"]} ${
                              get(options, "megamenu.type") == "auto"
                                ? styles["menu-col-auto"]
                                : styles[
                                    `menu-col-${
                                      submenuItemsCount > 5
                                        ? 5
                                        : submenuItemsCount
                                    }`
                                  ]
                            }`}
                          >
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
                                {/* <Image
                                  photo={get(subItem, "alternativePhoto", {})}
                                  size={"20x28"}
                                  type={"png"}
                                /> */}
                                {get(subItem, "name")}
                              </a>
                            </Link>
                            <LinkMobile
                              item={subItem}
                              onClickMethod={onClickToggleOpenCategory}
                              onClickMethod2={updateOpenedMenu}
                            />
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
                                    <LinkMobileAll
                                      name={get(subItem, "name")}
                                      urlName={get(subItem, "urlName")}
                                      onClickMethod={updateOpenedMenu}
                                    />
                                  </li>
                                  {subItem.children.map((subSubItem, index) => {
                                    if (index == 6 && hasSubSubmenu !== index) {
                                      return (
                                        <li
                                          key={generateKey(
                                            2,
                                            subSubItem?.id,
                                            index,
                                            "-show-more"
                                          )}
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
                                        key={generateKey(
                                          2,
                                          subSubItem?.id,
                                          index
                                        )}
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
