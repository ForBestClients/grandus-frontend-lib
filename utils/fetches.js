import get from "lodash/get";
import { reqGetHost, reqGetHeadersFront } from "grandus-lib/utils";
import { arrayToPath, queryToQueryString } from "grandus-lib/hooks/useFilter";
import { getCleanedUrl } from "grandus-lib/utils/url";

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
      `${reqGetHost(context?.req)}/api/lib/v1/blogs?${uri.join("&")}`
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
  serverSideProps: async (context) => {
    const data = await fetch(
      `${reqGetHost(context?.req)}/api/lib/v1/statics/${context?.params?.id}`
    ).then((result) => result.json());
    if (!data?.id) {
      context.res.statusCode = 404;
    }
    return {
      props: { page: data },
    };
  },
};

const checkoutContactPage = {
  serverSideProps: async (context) => {
    const countries = await fetch(
      `${reqGetHost(context?.req)}/api/lib/v1/countries`
    ).then((result) => result.json());

    let towns = [];
    try {
      towns = await fetch(`${reqGetHost(context?.req)}/api/lib/v1/towns`).then(
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
      `${reqGetHost(context?.req)}/api/lib/v1/countries`
    ).then((result) => result.json());

    let towns = [];
    try {
      towns = await fetch(`${reqGetHost(context?.req)}/api/lib/v1/towns`).then(
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
        )}`
      ).then((result) => result.json()),

      fetch(`${reqGetHost(context?.req)}/api/lib/v1/banners?type=11`).then(
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
