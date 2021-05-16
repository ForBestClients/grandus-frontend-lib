import { getCategoryLinkAttributes } from "../useFilter";

//getCategoryLinkAttributes - TEST SUITE
const getCategoryLinkAttributesTests = () => {
  const outputEmpty = {
    href: {
      pathname: `/`,
      query: {},
    },
    as: {
      pathname: `/`,
      query: {},
    },
  };

  let output = {};

  test("getCategoryLinkAttributes - empty values", () => {
    expect(getCategoryLinkAttributes()).toEqual(outputEmpty);
    expect(getCategoryLinkAttributes(false)).toEqual(outputEmpty);
    expect(getCategoryLinkAttributes(false, "test")).toEqual(outputEmpty);
    expect(getCategoryLinkAttributes({})).toEqual(outputEmpty);

    output = {
      href: {
        pathname: `/kategoria/[category]/[[...parameters]]`,
        query: {},
      },
      as: {
        pathname: `/kategoria/test-category/`,
        query: {},
      },
    };
    expect(getCategoryLinkAttributes("test-category")).toEqual(output);

    output = {
      href: {
        pathname: `/kategoria/[category]/[[...parameters]]`,
        query: {},
      },
      as: {
        pathname: `/kategoria/test-category/key1/value1,value2`,
        query: {},
      },
    };
    expect(
      getCategoryLinkAttributes("test-category", "key1/value1,value2")
    ).toEqual(output);

    output = {
      href: "/test/absolute/path",
    };
    expect(
      getCategoryLinkAttributes(
        "test-category",
        "key1/value1,value2",
        {},
        { absoluteHref: "/test/absolute/path" }
      )
    ).toEqual(output);
    expect(
      getCategoryLinkAttributes(
        false,
        "",
        {},
        { absoluteHref: "/test/absolute/path" }
      )
    ).toEqual(output);
  });
};

getCategoryLinkAttributesTests();
