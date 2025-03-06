import { getImageUrl } from "grandus-lib/utils";
import isEmpty from "lodash/isEmpty";
import upperFirst from "lodash/upperFirst";

const convertDateStringToDateObject = (dateString = "") => {
  const regex = /^(?<date>\d{1,2}).(?<month>\d{1,2}).(?<fullYear>\d{4})\s(?<uTCHours>\d{1,2}):(?<minutes>\d{2}):(?<seconds>\d{2})$/gm
  const date = new Date();

  const matches = (regex.exec(dateString))?.groups;
  matches.month -= 1; // numbered from 0 to 11

  if (!isEmpty(matches)) {
    Object.keys(matches).forEach((groupName) => {
      date[`set${upperFirst(groupName)}`](matches[groupName]);
    });
  }

  return date;
};

const MicroDataArticle = ({ data = null, webInstance = null }) => {
  if (isEmpty(data) || isEmpty(webInstance)) {
    return null;
  }

  const { domain } = webInstance;
  const { title, photo, createTime } = data;

  const schemaArticles = data.map((blog) => ({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: blog?.title,
    image: blog?.photo?.path ? [getImageUrl(blog.photo, "400x250", "jpg")] : [],
    author: {
      "@type": "Organization",
      name: "bezeckepotreby.sk",
      logo: `${domain}/img/logo.svg`,
    },
    publisher: {
      "@type": "Organization",
      name: "bezeckepotreby.sk",
      logo: `${domain}/img/logo.svg`,
    },
    datePublished: blog?.createTime ? convertDateStringToDateObject(blog?.createTime) : blog?.publishTime,
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ schemaArticles }),
      }}
    />
  );
};

export default MicroDataArticle;
