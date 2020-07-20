// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { withIronSession } from "next-iron-session";
import { GENERAL_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get } from "lodash";

export default function withSession(handler) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD,
    cookieName: GENERAL_CONSTANT,
    cookieOptions: {
      // the next line allows to use the session in non-https environments like
      // Next.js dev mode (http://localhost:3000)
      secure: false, //process.env.NODE_ENV === 'production' ? true : false,
    },
  });
}

export const extractSessionUser = (user) => {
  return {
    accessToken: get(user, "accessToken"),
    id: get(user, "id"),
    fullName: get(user, "fullName"),
    email: get(user, "email"),
  };
};

export const extractSessionCart = (cart) => {
  return {
    accessToken: get(cart, "accessToken"),
    userId: get(cart, "userId"),
    count: get(cart, "count"),
    countPieces: get(cart, "pieceCount"),
    sum: get(cart, "sumData"),
  };
};
