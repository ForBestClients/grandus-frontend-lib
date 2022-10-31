import jsonwebtoken from "jsonwebtoken"
import isEmpty from "lodash/isEmpty";

const jwt = {
  parseJWT: (token) => {
    const secret = process.env.TOKEN_SECRET;

    if (isEmpty(secret)) {
      return null;
    }

    try {
      return jsonwebtoken.verify(token, secret);
    } catch (e) {
      return null;
    }
  },

  signJWT: (data) => {
    const secret = process.env.TOKEN_SECRET;

    if (isEmpty(secret)) {
      return null;
    }

    try {
      return jsonwebtoken.sign(JSON.stringify(data), secret);
    } catch (e) {
      return null;
    }
  }
}

export default jwt;