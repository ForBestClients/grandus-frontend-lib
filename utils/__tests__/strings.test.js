import { capfl } from "../strings";

const capitalizeFirstLetterTests = () => {
  test("capitalize first letter", () => {
    expect(capfl("test")).toEqual("Test");
    expect(capfl("longer string with dot. And another sentence")).toEqual("Longer string with dot. And another sentence");
  });
};

capitalizeFirstLetterTests();
