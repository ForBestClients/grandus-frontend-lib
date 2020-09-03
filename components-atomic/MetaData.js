import Head from "next/head";
import { getImageUrl } from "grandus-lib/utils";
import { get } from "lodash";

const MetaData = (props) => {
  const { title, description, keywords, photo = {} } = props;
  return (
    <Head>
      {title ? (
        <>
          <title>{title}</title>
          <meta property="og:title" content={title} />
        </>
      ) : null}
      {description ? (
        <>
          <meta property="description" content={description} />
          <meta property="og:description" content={description} />
        </>
      ) : null}
      {keywords ? (
        <>
          <meta property="keywords" content={keywords} />
          <meta property="og:keywords" content={keywords} />
        </>
      ) : null}
      {get(photo, "path") ? (
        <>
          <meta
            property="og:image"
            content={getImageUrl(photo, "1200x630", "jpg")}
          />
          <meta property="og:image:type" content={"image/jpeg"} />
          <meta property="og:image:width" content={1200} />
          <meta property="og:image:height" content={630} />
        </>
      ) : null}
    </Head>
  );
};

export default MetaData;
