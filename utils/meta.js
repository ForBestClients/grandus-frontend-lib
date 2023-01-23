import truncate from "lodash/truncate";
import isEmpty from "lodash/isEmpty";
import trim from "lodash/trim";

const TITLE_LENGTH_MAX = 60;
const DESCRIPTION_LENGTH_MAX = 155;

export const adjustTitle = (
  title,
  branding = "",
  suffix = "",
  prefix = "",
  options = { maxLength: TITLE_LENGTH_MAX, omission: "" }
) => {
  let result = isEmpty(title) ? "" : trim(title, " ");

  const MAX_LENGTH = options?.maxLength ? options.maxLength : TITLE_LENGTH_MAX;

  if (result.length <= MAX_LENGTH - suffix.length + 1 && !isEmpty(suffix)) {
    result = result + (result ? " " : "") + suffix.toString();
  }

  if (result.length <= MAX_LENGTH - branding.length + 1 && !isEmpty(branding)) {
    result = result + (result ? " " : "") + branding.toString();
  }

  if (result.length <= MAX_LENGTH - prefix.length + 1 && !isEmpty(prefix)) {
    result = prefix + (result ? " " : "") + result.toString();
  }

  if (result.length > MAX_LENGTH) {
    result = truncate(title, {
      length: MAX_LENGTH,
      omission: options?.omission ? options?.omission : "",
    });
  }

  return result;
};

export const adjustDescription = (content, prefix, suffix, branding) => {
  return adjustTitle(content, prefix, suffix, branding, {
    maxLength: DESCRIPTION_LENGTH_MAX,
    omission: "...",
  });
};
