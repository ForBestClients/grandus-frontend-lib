import { getCategoryLinkAttributes, queryToQueryString } from "../useFilter";

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

//queryToQueryString - TEST SUITE
const queryToQueryStringTests = () => {
  let outputEmpty = "";

  // test("queryToQueryString - empty values", () => {
  //   expect(queryToQueryString()).toEqual(outputEmpty);
  //   expect(queryToQueryString(false)).toEqual(outputEmpty);
  //   expect(queryToQueryString(false, "test")).toEqual(outputEmpty);
  //   expect(queryToQueryString({})).toEqual(outputEmpty);
  // });

  let inputData = {
    query: {
      category: "main",
      orderBy: "price",
      page: 2,
      parameters: ["znacka", "asics"],
    },
    dataToChange: {
      page: 3,
      newParam: "test",
    },
    toDelete: ["category"],
    options: {
      encode: false,
      replace: { parameters: "param" },
    },
  };
  test("queryToQueryString - values", () => {
    expect(queryToQueryString(inputData?.query)).toEqual(
      "orderBy=price&page=2"
    );
    expect(
      queryToQueryString(inputData?.query, inputData?.dataToChange)
    ).toEqual("orderBy=price&page=3&newParam=test");

    inputData.dataToChange = { ...inputData.dataToChange, orderBy: "time" };

    expect(
      queryToQueryString(inputData?.query, inputData?.dataToChange)
    ).toEqual("orderBy=time&page=3&newParam=test");

    expect(
      queryToQueryString(inputData?.query, inputData?.dataToChange, [])
    ).toEqual(
      "category=main&orderBy=time&page=3&parameters=znacka,asics&newParam=test"
    );

    expect(
      queryToQueryString(
        inputData?.query,
        inputData?.dataToChange,
        inputData?.toDelete
      )
    ).toEqual("orderBy=time&page=3&parameters=znacka,asics&newParam=test");

    expect(
      queryToQueryString(inputData?.query, inputData?.dataToChange, [
        "parameters",
      ])
    ).toEqual("category=main&orderBy=time&page=3&newParam=test");

    expect(queryToQueryString(inputData?.query, {}, ["parameters"])).toEqual(
      "category=main&orderBy=price&page=2"
    );

    expect(
      queryToQueryString(
        inputData?.query,
        inputData?.dataToChange,
        inputData?.toDelete,
        {
          replace: { parameters: "param" },
        }
      )
    ).toEqual("orderBy=time&page=3&param=znacka,asics&newParam=test");

    expect(
      queryToQueryString(
        inputData?.query,
        inputData?.dataToChange,
        inputData?.toDelete,
        {
          replace: { orderBy: 1, page: 2, parameters: "3", newParam: 4 },
        }
      )
    ).toEqual("1=time&2=3&3=znacka,asics&4=test");
  });
};

getCategoryLinkAttributesTests();
queryToQueryStringTests();
