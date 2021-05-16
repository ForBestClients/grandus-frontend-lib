import { removeParameter, addParameter } from "../url";

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

removeParameterTests();
addParameterTests();
