import { removeParameter, addParameter, getCleanedUrl } from "../url";

//removeParameter - TEST SUITE
const removeParameterTests = () => {
  const input = {
    key1: ["value1"],
    key2: ["value2", "value3"],
    key3: ["value4", "value5", "value6", "value7"],
    key4: ["value8", "value9", "value10"],
  };
  let output = {};

  test("removeParameter - empty values", () => {
    expect(removeParameter()).toEqual({});
    expect(removeParameter({})).toEqual({});
    expect(removeParameter([])).toEqual({});
    expect(removeParameter("string")).toEqual({});
    expect(removeParameter({}, "key3")).toEqual({});
    expect(removeParameter("", "key3", "value4")).toEqual({});
  });

  test("removeParameter - without key or non existing key", () => {
    expect(removeParameter(input)).toEqual({});
    expect(removeParameter(input, false)).toEqual({});
    expect(removeParameter(input, "")).toEqual({});
    expect(removeParameter(input, "test")).toEqual(input);
  });

  test("removeParameter - removing key groups", () => {
    output = {
      key1: ["value1"],
      key3: ["value4", "value5", "value6", "value7"],
      key4: ["value8", "value9", "value10"],
    };
    expect(removeParameter(input, "key2")).toEqual(output);

    output = {
      key1: ["value1"],
      key3: ["value4", "value5", "value6", "value7"],
    };
    let inputAjusted = removeParameter(input, "key2");
    expect(removeParameter(inputAjusted, "key4")).toEqual(output);

    expect(removeParameter(input, false)).toEqual({});
    expect(removeParameter(input, "")).toEqual({});
    expect(removeParameter(input, "test")).toEqual(input);
  });

  test("removeParameter - removing values", () => {
    output = {
      key1: ["value1"],
      key2: ["value2"],
      key3: ["value4", "value5", "value6", "value7"],
      key4: ["value8", "value9", "value10"],
    };
    expect(removeParameter(input, "key2", "value3")).toEqual(output);

    output = {
      key1: ["value1"],
      key2: ["value3"],
      key3: ["value4", "value5", "value6", "value7"],
      key4: ["value8", "value9", "value10"],
    };
    expect(removeParameter(input, "key2", "value2")).toEqual(output);

    output = {
      key1: ["value1"],
      key2: ["value2", "value3"],
      key3: ["value4", "value5", "value6", "value7"],
      key4: ["value8", "value10"],
    };
    expect(removeParameter(input, "key4", "value9")).toEqual(output);

    output = {
      key2: ["value2", "value3"],
      key3: ["value4", "value5", "value6", "value7"],
      key4: ["value8", "value9", "value10"],
    };
    expect(removeParameter(input, "key1", "value1")).toEqual(output);

    output = {
      key1: ["value1"],
      key2: ["value2", "value3"],
      key3: ["value5", "value6", "value7"],
      key4: ["value8", "value9", "value10"],
    };
    expect(removeParameter(input, "key3", "value4")).toEqual(output);

    output = {
      key1: ["value1"],
      key2: ["value2", "value3"],
      key3: ["value4", "value5", "value6"],
      key4: ["value8", "value9", "value10"],
    };
    expect(removeParameter(input, "key3", "value7")).toEqual(output);

    expect(removeParameter(input, "key5")).toEqual(input);
    expect(removeParameter(input, "key5", "value1")).toEqual(input);
    expect(removeParameter(input, "key1", "value2")).toEqual(input);
  });
};

//addParameter - TEST SUITE
const addParameterTests = () => {
  const input = {
    key1: ["value1"],
    key2: ["value2", "value3"],
  };

  let output = {};

  test("addParameter - empty values", () => {
    expect(addParameter()).toEqual({});
    expect(addParameter({})).toEqual({});
    expect(addParameter([])).toEqual({});
    expect(addParameter("string")).toEqual({});
    expect(addParameter({}, "key3")).toEqual({});
    expect(addParameter("", "key3", "value4")).toEqual({});
  });

  test("addParameter - adding keys", () => {
    expect(addParameter(input, "key1")).toEqual(input);
    expect(addParameter(input, "key3")).toEqual(input);
    expect(addParameter(input, "key1", "value1")).toEqual(input);
    expect(addParameter(input, "key1", ["value1"])).toEqual(input);

    output = {
      key1: ["value1b"],
      key2: ["value2", "value3"],
    };
    expect(addParameter(input, "key1", "value1b")).toEqual(output);
    expect(addParameter(input, "key1", ["value1b"])).toEqual(output);

    output = {
      key1: ["value1", "value1b"],
      key2: ["value2", "value3"],
    };
    expect(addParameter(input, "key1", "value1b", false)).toEqual(output);
    expect(addParameter(input, "key1", ["value1b"], false)).toEqual(output);

    output = {
      key1: ["value1"],
      key2: ["value1", "value2", "value3"],
    };
    expect(addParameter(input, "key2", ["value1"], false)).toEqual(output);

    output = {
      key1: ["value1"],
      key2: ["value2", "value3"],
      key3: ["value4"],
    };
    expect(addParameter(input, "key3", "value4")).toEqual(output);
    expect(addParameter(input, "key3", ["value4"])).toEqual(output);
    expect(addParameter(input, "key3", "value4", false)).toEqual(output);
    expect(addParameter(input, "key3", ["value4"], false)).toEqual(output);
  });
};

//addParameter - TEST SUITE
const getCleanedUrlTests = () => {
  const input = {
    path: "test/path",
    path2: "test/path?category=123&test=2",
    path3: "test/path?category=123&test=2?url=wrong",
    parameters: {
      category: "obuv",
      parameters: [
        "velkost",
        "41-1-3",
        "typ-doslapu",
        "neutralny",
        "typ-bezeckej-obuvi",
        "treningova",
        "farba",
        "modra,oranzova",
      ],
      unused: ["123", "456"],
    },
    query: {
      category: "obuv",
      parameters: [
        "velkost",
        "41-1-3",
        "typ-doslapu",
        "neutralny",
        "typ-bezeckej-obuvi",
        "treningova",
        "farba",
        "modra,oranzova",
      ],
      orderBy: "price-asc",
      limit: "45",
    },
  };

  let output = { path: "test/path?orderBy=price-asc&limit=45" };

  test("addParameter - empty values", () => {
    expect(getCleanedUrl("")).toEqual("");
    expect(getCleanedUrl({})).toEqual(false);
    expect(getCleanedUrl([])).toEqual(false);
    expect(getCleanedUrl({ test: "test" })).toEqual(false);
  });

  test("addParameter - functional tests", () => {
    expect(getCleanedUrl({})).toEqual(false);
    expect(getCleanedUrl([])).toEqual(false);
    expect(getCleanedUrl({ test: "test" })).toEqual(false);

    expect(getCleanedUrl(input.path)).toEqual(input.path);
    expect(getCleanedUrl(input.path, input.parameters)).toEqual(input.path);
    expect(getCleanedUrl(input.path, input.parameters, input.query)).toEqual(
      output.path
    );
    expect(getCleanedUrl(input.path2)).toEqual(input.path);
    expect(getCleanedUrl(input.path2, input.parameters)).toEqual(input.path);
    expect(getCleanedUrl(input.path2, input.parameters, input.query)).toEqual(
      output.path
    );
    expect(getCleanedUrl(input.path3)).toEqual(input.path);
    expect(getCleanedUrl(input.path3, input.parameters)).toEqual(input.path);
    expect(getCleanedUrl(input.path3, input.parameters, input.query)).toEqual(
      output.path
    );
  });
};

removeParameterTests();
addParameterTests();
getCleanedUrlTests();
