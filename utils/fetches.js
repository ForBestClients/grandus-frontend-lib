import get from "lodash/get";

import {
  reqGetHeaders,
  reqApiHost,
  reqGetHost,
  reqGetHeadersFront,
} from "grandus-lib/utils";

import { arrayToPath, queryToQueryString } from "grandus-lib/hooks/useFilter";
import { getCleanedUrl } from "grandus-lib/utils/url";

const REVALIDATE_INTERVAL = 5;

const indexPage = {
  // staticProps: async () => { //TODO next 9.5 static optimization
  //   const homepageData = await fetch(`${reqGetHost()}/api/pages/homepage`);
  //   const data = await homepageData.json();
  //   return {
  //     props: data,
  //     revalidate: 1
  //   };
  // },
  serverSideProps: async (context) => {
    const homepageData = await fetch(
      `${reqGetHost(context?.req)}/api/pages/homepage`,
      {
        headers: reqGetHeadersFront(context?.req),
      }
    );
    const data = await homepageData.json();
    return {
      props: data,
    };
  },
};

const productPage = {
  serverSideProps: async (context) => {
    let uri = `${reqGetHost(context?.req)}/api/lib/v1/products/${
      context?.params?.id
    }?initial=1`;

    if (context?.query?.hash) {
      uri += `&hash=${context?.query?.hash}`;
    }

    const data = await fetch(uri, {
      headers: reqGetHeadersFront(context?.req, {
        forwardUrl: getCleanedUrl(
          context?.resolvedUrl,
          context?.params,
          context?.query
        ),
      }),
    }).then((result) => result.json());
    return {
      props: { product: data },
    };
  },
};

const categoryPage = {
  serverSideProps: async (context) => {
    const category = get(context, "params.category");
    const parameters = arrayToPath(get(context, "params.parameters", []));
    const uri = queryToQueryString(get(context, "query", {}), {});
    const url = `${reqGetHost(
      context?.req
    )}/api/pages/category/${category}?param=${encodeURIComponent(
      parameters
    )}&${uri}`;

    const data = await fetch(url, {
      headers: reqGetHeadersFront(context?.req, {
        forwardUrl: getCleanedUrl(
          context?.resolvedUrl,
          context?.params,
          context?.query
        ),
      }),
    }).then((result) => {
      return result.json();
    });

    if (get(data, "category.externalUrl")) {
      return {
        redirect: {
          permanent: false,
          destination: data?.category?.externalUrl,
        },
        props: data,
      };
    }

    return {
      props: data,
    };
  },
};

const blogListingPage = {
  serverSideProps: async (context) => {
    const uri = [];
    if (context?.query.id) {
      uri.push(`communityCategoryId=${get(context, "params.id", "")}`);
    }
    if (context?.query.page) {
      uri.push(`page=${get(context, "query.page", 1)}`);
    }
    if (context?.query.perPage) {
      uri.push(`perPage=${get(context, "query.perPage", "")}`);
    }
    const data = await fetch(
      `${reqGetHost(context?.req)}/api/lib/v1/blogs?${uri.join("&")}`,{headers: reqGetHeaders(context?.req??{})}
    ).then((result) => result.json());
    return {
      props: data,
    };
  },
};

const searchPage = {
  serverSideProps: async (context) => {
    const term = encodeURIComponent(get(context, "params.term"));
    const parameters = arrayToPath(get(context, "params.parameters", []));
    const uri = queryToQueryString(get(context, "query", {}), {}, ["term"]);
    const url = `${reqGetHost(
      context?.req
    )}/api/pages/search/${term}?param=${encodeURIComponent(parameters)}&${uri}`;

    const data = await fetch(url, {
      headers: reqGetHeadersFront(context?.req, {
        forwardUrl: context?.resolvedUrl,
      }),
    }).then((result) => {
      return result.json();
    });

    return {
      props: data,
    };
  },
};

const blogPage = {
  staticPaths: async () => {
    const blogs = await fetch(
      `${reqApiHost()}/api/v2/blogs?fields=urlTitle,id&per-page=999`,
      {
        headers: reqGetHeaders(),
      }
    )
      .then((result) => result.json())
      .then((r) => r.data);

    const paths = blogs.map((blog) => ({
      params: { id: blog?.urlTitle },
    }));

    return { paths, fallback: "blocking" };
  },
  staticProps: async (context) => {
    let metaData = {};
    const req = {};
    const page = await fetch(
      `${reqApiHost(req)}/api/v2/blogs/${
        context?.params?.id
      }?expand=tags,category,text,gallery,products`,
      {
        headers: reqGetHeaders(req),
      }
    )
      .then((result) => result.json())
      .then((r) => {
        metaData = r.meta;
        return r.data;
      });

    return {
      props: {
        meta: metaData,
        blog: page,
      },
      revalidate: REVALIDATE_INTERVAL,
    };
  },
  serverSideProps: async (context, options = {}) => {
    const data = await fetch(
      `${reqGetHost(context?.req)}/api/lib/v1/blogs/${
        context?.params?.id
      }?${queryToQueryString(options)}`,
      {
        headers: reqGetHeadersFront(context?.req),
      }
    ).then((result) => result.json());
    return {
      props: { blog: data },
    };
  },
};

const campaignListingPage = {
  serverSideProps: async (context) => {
    const uri = [];
    if (context?.query.page) {
      uri.push(`page=${get(context, "query.page", 1)}`);
    }
    if (context?.query.perPage) {
      uri.push(`perPage=${get(context, "query.perPage", "")}`);
    }
    const data = await fetch(
      `${reqGetHost(context?.req)}/api/lib/v1/campaigns?${uri.join("&")}`
    ).then((result) => result.json());
    return {
      props: data,
    };
  },
};

const campaignPage = {
  serverSideProps: async (context) => {
    const campaign = get(context, "params.campaign");
    const parameters = arrayToPath(get(context, "params.parameters", []));
    const uri = queryToQueryString(get(context, "query", {}), {});
    const url = `${reqGetHost(
      context?.req
    )}/api/pages/campaign/${campaign}?param=${encodeURIComponent(
      parameters
    )}&${uri}`;

    const data = await fetch(url, {
      headers: reqGetHeadersFront(context?.req, {
        forwardUrl: context?.resolvedUrl,
      }),
    }).then((result) => {
      return result.json();
    });

    return {
      props: data,
    };
  },
};

const staticPage = {
  staticPaths: async () => {
    const pages = await fetch(
      `${reqApiHost()}/api/v2/pages?fields=urlTitle,id&per-page=999`,
      {
        headers: reqGetHeaders(),
      }
    )
      .then((result) => result.json())
      .then((r) => r.data);

    const paths = pages.map((page) => ({
      params: { id: page?.urlTitle },
    }));

    return { paths, fallback: "blocking" };
  },
  staticProps: async(context) => {
    const req = {};
    const data = await fetch(
      `${reqApiHost(req)}/api/v2/pages/${context?.params?.id}?expand=photo,content,customCss,customJavascript,attachments,products`,
      {
        headers: reqGetHeaders(req),
      })
      .then((result) => result.json())
      .then(r => r?.data);

    if (!data?.id) {
      return {
        notFound: true
      };
    }

    return {
      props: { page: data },
      revalidate: REVALIDATE_INTERVAL,
    };
  },
  serverSideProps: async (context) => {
    const data = await fetch(
      `${reqGetHost(context?.req)}/api/lib/v1/statics/${context?.params?.id}`, {headers: reqGetHeaders(context?.req??{})}
    ).then((result) => result.json());
    if (!data?.id) {
      context.res.statusCode = 404;
    }

    if (get(data, "externalUrl")) {
      return {
        redirect: {
          permanent: false,
          destination: data?.externalUrl,
        },
        props: { page: data },
      };
    }

    return {
      props: { page: data },
    };
  },
};

const checkoutContactPage = {
  serverSideProps: async (context) => {
    const countries = await fetch(
      `${reqGetHost(context?.req)}/api/lib/v1/countries`, {headers: reqGetHeaders(context?.req??{})}
    ).then((result) => result.json());

    let towns = [];
    try {
      towns = await fetch(`${reqGetHost(context?.req)}/api/lib/v1/towns`, {headers: reqGetHeaders(context?.req??{})}).then(
        (result) => result.json()
      );
    } catch (error) {
      towns = [];
    }

    return {
      props: { countries, towns },
    };
  },
};

const userPage = {
  serverSideProps: async (context) => {
    let user = null;
    try {
      user = await fetch(
        `${reqGetHost(context?.req)}/api/lib/v1/auth/profile`,
        {
          headers: reqGetHeadersFront(context?.req),
        }
      ).then((result) => result.json());
    } catch (error) {
      user = null;
    }
    return {
      props: { user },
    };
  },
};

const userProfilePage = {
  serverSideProps: async (context) => {
    const countries = await fetch(
      `${reqGetHost(context?.req)}/api/lib/v1/countries`,{headers: reqGetHeaders(context?.req??{})}
    ).then((result) => result.json());

    let towns = [];
    try {
      towns = await fetch(`${reqGetHost(context?.req)}/api/lib/v1/towns`, {headers: reqGetHeaders(context?.req??{})}).then(
        (result) => result.json()
      );
    } catch (error) {
      towns = [];
    }
    return {
      props: { countries, towns },
    };
  },
};

const thanksPage = {
  serverSideProps: async (context) => {
    let [order, banners] = await Promise.all([
      fetch(
        `${reqGetHost(context?.req)}/api/lib/v1/order?orderToken=${get(
          context,
          "query.orderToken",
          ""
        )}`, {headers: reqGetHeaders(context?.req??{})}
      ).then((result) => result.json()),

      fetch(`${reqGetHost(context?.req)}/api/lib/v1/banners?type=11`,{headers: reqGetHeaders(context?.req??{})}).then(
        (result) => result.json()
      ),
    ]);
    return {
      props: { order, banners },
    };
  },
};

export {
  indexPage,
  productPage,
  categoryPage,
  staticPage,
  blogListingPage,
  blogPage,
  campaignListingPage,
  campaignPage,
  checkoutContactPage,
  userPage,
  userProfilePage,
  thanksPage,
  searchPage,
};
