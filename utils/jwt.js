import jsonwebtoken from "jsonwebtoken"

const jwt = {
  parseJWT: (token) => {
    const secret = process.env.TOKEN_SECRET;
    try {
      return jsonwebtoken.verify(token, secret);
    } catch (e) {
      console.log(e)
      return null;
    }
  },

  signJWT: (data) => {
    const secret = process.env.TOKEN_SECRET;
    return jsonwebtoken.sign(JSON.stringify(data), secret);
  }
}

export default jwt;