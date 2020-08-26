import { get } from "lodash";
import { reqGetHost } from "grandus-lib/utils";
import { arrayToPath, queryToQueryString } from "grandus-lib/hooks/useFilter";

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

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
    const category = get(context, "params.category");
    const parameters = arrayToPath(get(context, "params.parameters", []));
    const uri = queryToQueryString(get(context, "query", {}), {});
    const url = `${reqGetHost()}/api/pages/category/${category}?param=${parameters}&${uri}`;

    const data = await fetch(url).then((result) => {
      return result.json();
    });

    return {
      props: data,
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

const userProfilePage = {
  serverSideProps: async () => {
    const countries = await fetch(
      `${reqGetHost()}/api/v1/countries`
    ).then((result) => result.json());
    return {
      props: { countries },
    };
  },
};

const thanksPage = {
  serverSideProps: async (context) => {
    const order = await fetch(
      `${reqGetHost()}/api/v1/order?orderToken=${get(context, 'query.orderToken', '')}`
    ).then(response => response.json());
    return {
      props: { order },
    };
  },
};

const operationUnitsPage = {
  serverSideProps: async context => {
    const data = await fetch(`${reqGetHost()}/api/v1/operation-units`).then(response => response.json());
    return {
      props: data,
    }
  }
}

const operationUnitPage = {
  serverSideProps: async context => {
    const from = dayjs().startOf('isoWeek');
    const operationUnit = await fetch(`${reqGetHost()}/api/v1/operation-units/${context?.params?.id}`).then(response => response.json());
    const disabledDates = await fetch(`${reqGetHost()}/api/v1/operation-units/${context?.params?.id}?from=${from.format('YYYY-MM-DD')}&to=${from.add(8, 'days').format('YYYY-MM-DD')}`).then(response => response.json());
    return {
      props: {
        operationUnit: operationUnit,
        disabledDates: disabledDates,
      }
    }
  }
}

export {
  indexPage,
  productPage,
  categoryPage,
  staticPage,
  blogPage,
  checkoutContactPage,
  userProfilePage,
  thanksPage,
  operationUnitsPage,
  operationUnitPage,
};
