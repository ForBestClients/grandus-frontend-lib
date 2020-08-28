import { get } from "lodash";
import { reqGetHost } from "grandus-lib/utils";
import { arrayToPath, queryToQueryString } from "grandus-lib/hooks/useFilter";

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
      `${reqGetHost(context?.req)}/api/pages/homepage`
    );
    const data = await homepageData.json();
    return {
      props: data,
    };
  },
};

const productPage = {
  serverSideProps: async (context) => {
    const data = await fetch(
      `${reqGetHost(context?.req)}/api/v1/products/${
        context?.params?.id
      }?initial=1`
    ).then((result) => result.json());
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

    const data = await fetch(url).then((result) => {
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
      `${reqGetHost(context?.req)}/api/v1/blogs?${uri.join('&')}`
    ).then((result) => result.json());
    return {
      props: data,
    };
  },
};

const blogPage = {
  serverSideProps: async (context) => {
    const data = await fetch(
      `${reqGetHost(context?.req)}/api/v1/blogs/${context?.params?.id}`
    ).then((result) => result.json());
    return {
      props: { blog: data },
    };
  },
};

const staticPage = {
  serverSideProps: async (context) => {
    const data = await fetch(
      `${reqGetHost(context?.req)}/api/v1/statics/${context?.params?.id}`
    ).then((result) => result.json());
    return {
      props: { page: data },
    };
  },
};

const checkoutContactPage = {
  serverSideProps: async () => {
    const countries = await fetch(
      `${reqGetHost(context?.req)}/api/v1/countries`
    ).then((result) => result.json());
    return {
      props: { countries },
    };
  },
};

const userProfilePage = {
  serverSideProps: async () => {
    const countries = await fetch(
      `${reqGetHost(context?.req)}/api/v1/countries`
    ).then((result) => result.json());
    return {
      props: { countries },
    };
  },
};

const thanksPage = {
  serverSideProps: async (context) => {
    const order = await fetch(
      `${reqGetHost(context?.req)}/api/v1/order?orderToken=${get(
        context,
        "query.orderToken",
        ""
      )}`
    ).then((response) => response.json());
    return {
      props: { order },
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
  checkoutContactPage,
  userProfilePage,
  thanksPage,
};
