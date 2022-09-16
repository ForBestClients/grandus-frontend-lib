// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { withIronSession } from "next-iron-session";
import { GENERAL_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get } from "lodash";

export default function withSession(handler) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD,
    cookieName: GENERAL_CONSTANT,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production' ? true : false
    },
  });
}

export const extractSessionUser = (user) => {
  return {
    accessToken: get(user, "accessToken"),
    id: get(user, "id"),
    fullName: get(user, "fullName"),
    name: get(user, 'attributes.name'),
    surname: get(user, 'attributes.surname'),
    email: get(user, "attributes.email"),
    phone: get(user, 'attributes.phone'),
    street: get(user, 'attributes.street'),
    city: get(user, 'attributes.city'),
    zip: get(user, 'attributes.zip'),
    countryId: get(user, 'countryId'),
    companyName: get(user, 'attributes.companyName'),
    ico: get(user, 'attributes.ico'),
    dic: get(user, 'attributes.dic'),
    icDPH: get(user, 'attributes.icDPH'),
    fatturistaIdentifier: get(user, 'fatturistaIdentifier'),
  };
};

export const extractSessionCart = (cart) => {
  return {
    accessToken: get(cart, "accessToken"),
    userId: get(cart, "userId"),
    count: get(cart, "count"),
    countPieces: get(cart, "pieceCount"),
    sum: get(cart, "sumData"),
    coupon: get(cart, "coupon")
  };
};
