import Head from "next/head";
import { useRouter } from "next/router";
import { getImageUrl } from "grandus-lib/utils";
import { get, split } from "lodash";

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

  const canonicalUrl =
    get(split(router?.asPath, "?"), "[0]", "") +
    (routerPage && routerPage > 1 ? `?page=${routerPage}` : "");

  return (
    <Head>
      {title ? (
        <>
          <title>{title}</title>
          <meta property="og:title" content={title} />
        </>
      ) : null}

      {canonicalUrl && !get(options, "disableCanonical") ? (
        <link
          rel={"canonical"}
          href={`${process.env.HOST ? process.env.HOST : ""}${canonicalUrl}`}
        />
      ) : null}

      {description ? (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
        </>
      ) : null}
      {keywords ? (
        <>
          <meta name="keywords" content={keywords} />
          <meta property="og:keywords" content={keywords} />
        </>
      ) : null}
      {noindex ? (
        <>
          <meta name="robots" content="noindex, follow" />
          <meta name="googlebot" content="noindex" />
        </>
      ) : null}
      {get(photo, "path") ? (
        <>
          <meta
            property="og:image"
            content={getImageUrl(
              photo,
              get(options, "image.dimensions", "1200x630"),
              "jpg"
            )}
          />
          <meta property="og:image:type" content={"image/jpeg"} />
          {get(options, "image.width") !== -1 ? (
            <meta
              property="og:image:width"
              content={get(options, "image.width", 1200)}
            />
          ) : (
            ""
          )}
          {get(options, "image.height") !== -1 ? (
            <meta
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
