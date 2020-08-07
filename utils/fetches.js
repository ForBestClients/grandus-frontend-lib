import { get } from "lodash";
import {
  getPaginationFromHeaders,
  reqGetHost,
} from "grandus-lib/utils";
import { arrayToPath } from "grandus-lib/hooks/useFilter"

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
    const homepageData = await fetch(`${reqGetHost()}/api/pages/homepage`);
    const data = await homepageData.json();
    return {
      props: data,
    };
  },
};

const productPage = {
  serverSideProps: async (context) => {
    const data = await fetch(
      `${reqGetHost()}/api/v1/products/${context?.params?.id}?initial=1`
    ).then((result) => result.json());
    return {
      props: { product: data },
    };
  },
};

const categoryPage = {
  serverSideProps: async (context) => {
    let pagination = null;

    const url = `${reqGetHost()}/api/pages/category/${
      get(context, "params.category")
    }?param=${arrayToPath(get(context, "params.parameters", []))}&page=${get(
      context,
      "query.page",
      1
    )}&perPage=${get(context, "query.perPage", 64)}&orderBy=time-desc`;

    const data = await fetch(url).then((result) => {
      pagination = getPaginationFromHeaders(result.headers);
      return result.json();
    });

    return {
      props: { pagination, ...data },
    };
  },
};

const blogPage = {
  serverSideProps: async (context) => {
    const data = await fetch(
      `${reqGetHost()}/api/v1/blogs/${context?.params?.id}`
    ).then((result) => result.json());
    return {
      props: { blog: data },
    };
  },
};

const staticPage = {
  serverSideProps: async (context) => {
    const data = await fetch(
      `${reqGetHost()}/api/v1/statics/${context?.params?.id}`
    ).then((result) => result.json());
    return {
      props: { page: data },
    };
  },
};

const checkoutContactPage = {
  serverSideProps: async () => {
    const countries = await fetch(
      `${reqGetHost()}/api/v1/countries`
    ).then((result) => result.json());
    return {
      props: { countries },
    };
  },
};

export {
  indexPage,
  productPage,
  categoryPage,
  staticPage,
  blogPage,
  checkoutContactPage,
};
