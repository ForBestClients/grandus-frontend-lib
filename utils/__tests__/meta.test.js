import { adjustTitle, adjustDescription } from "../meta";

//adjustTitle - TEST SUITE
const adjustTitleTests = () => {
  test("adjustTitle - empty values", () => {
    expect(adjustTitle()).toEqual("");
    expect(adjustTitle({})).toEqual("");
    expect(adjustTitle([])).toEqual("");
    expect(adjustTitle("text")).toEqual("text");
    expect(adjustTitle({}, "brand")).toEqual("brand");
    expect(adjustTitle("", "brand", "suffix")).toEqual("suffix brand");
  });

  test("adjustTitle - tests", () => {
    expect(adjustTitle("text", "branding", "suffix", "prefix")).toEqual(
      "prefix text suffix branding"
    );
    expect(
      adjustTitle(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum volutpat ligula scelerisque, tincidunt quam eu, lacinia dui. Nullam in elementum nibh, quis viverra est.",
        "branding",
        "suffix",
        "prefix"
      )
    ).toEqual("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ves");
    expect(
      adjustTitle(
        "Lorem",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      )
    ).toEqual("Lorem");
    expect(adjustTitle("Lorem", "Lorem ipsum dolor")).toEqual(
      "Lorem Lorem ipsum dolor"
    );
  });
};

adjustTitleTests();
