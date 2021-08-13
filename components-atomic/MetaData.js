import Head from "next/head";
import { useRouter } from "next/router";
import { getImageUrl } from "grandus-lib/utils";

import get from "lodash/get";
import split from "lodash/split";

import { adjustTitle, adjustDescription } from "grandus-lib/utils/meta";

const MetaData = (props) => {
  const {
    title,
    description,
    keywords,
    photo = {},
    noindex = false,
    options = {},
  } = props;

  const router = useRouter();
  const routerPage = get(router, "query.page");

  const metaTitle = adjustTitle(
    title,
    get(options, "title.branding"),
    get(options, "title.suffix"),
    get(options, "title.prefix"),
    {
      maxLength: get(options, "title.maxLength"),
    }
  );
  const metaDescription = adjustDescription(
    description,
    get(options, "description.branding"),
    get(options, "description.suffix"),
    get(options, "description.prefix")
  );

  const canonicalUrl =
    get(split(router?.asPath, "?"), "[0]", "") +
    (routerPage && routerPage > 1 ? `?page=${routerPage}` : "");

  return (
    <Head>
      {metaTitle ? (
        <>
          <title key={"title"}>{metaTitle}</title>
          <meta key={"ogtitle"} property="og:title" content={metaTitle} />
        </>
      ) : null}

      {canonicalUrl && !get(options, "disableCanonical") ? (
        <link
          key={"canonical"}
          rel={"canonical"}
          href={`${process.env.HOST ? process.env.HOST : ""}${canonicalUrl}`}
        />
      ) : null}

      {metaDescription ? (
        <>
          <meta
            key={"description"}
            name="description"
            content={metaDescription}
          />
          <meta
            key={"ogdescription"}
            property="og:description"
            content={metaDescription}
          />
        </>
      ) : null}

      {keywords ? (
        <>
          <meta key={"keywords"} name="keywords" content={keywords} />
          <meta key={"ogkeywords"} property="og:keywords" content={keywords} />
        </>
      ) : null}

      {noindex ? (
        <>
          <meta key={"robots"} name="robots" content="noindex, follow" />
          <meta key={"googlebot"} name="googlebot" content="noindex" />
        </>
      ) : null}

      {get(photo, "path") ? (
        <>
          <meta
            key={"ogimage"}
            property="og:image"
            content={getImageUrl(
              photo,
              get(options, "image.dimensions", "1200x630"),
              "jpg"
            )}
          />
          <meta
            key={"ogimagetype"}
            property="og:image:type"
            content={"image/jpeg"}
          />
          {get(options, "image.width") !== -1 ? (
            <meta
              key={"ogimagewidth"}
              property="og:image:width"
              content={get(options, "image.width", 1200)}
            />
          ) : (
            ""
          )}
          {get(options, "image.height") !== -1 ? (
            <meta
              key={"ogimageheight"}
              property="og:image:height"
              content={get(options, "image.height", 630)}
            />
          ) : (
            ""
          )}
        </>
      ) : null}
    </Head>
  );
};

export default MetaData;
