import { useRouter } from "next/router";
import useUser from "grandus-lib/hooks/useUser";
import useWebInstance from "grandus-lib/hooks/useWebInstance";
import { reqApiHost, reqGetHost } from "grandus-lib/utils";
import {
  USER_CONSTANT,
  CART_CONSTANT,
} from "grandus-lib/constants/SessionConstants";

import Link from "next/link";
import { get } from "lodash";
import { Button, Result, Row, Col, Divider } from "antd";
import { FacebookFilled, GoogleOutlined } from "@ant-design/icons";
import useCart from "grandus-lib/hooks/useCart";
import MetaData from "grandus-lib/components-atomic/MetaData";

import LoginForm from "components/forms/Login";

const Login = ({ user, apiHost, host }) => {
  const { user: userFront } = useUser({
    redirectTo: "/",
    redirectIfFound: true,
  });

  const router = useRouter();
  const { cart } = useCart();
  const { webInstance, settings, domain } = useWebInstance();
  const facebokLoginEnabled = get(settings, "facebook_login_enabled");
  const googleLoginEnabled = get(settings, "google_login_enabled");
  if (user || userFront) {
    return (
      <Result
        status="success"
        title={"Úspešné prihlásenie"}
        subTitle={`Vitajte späť ${get(
          user,
          "fullName",
          get(userFront, "fullName")
        )}`}
        extra={[
          <Link key={"profile-2"} href="/ucet/profil" as={`/ucet/profil`}>
            <Button>Profil</Button>
          </Link>,
          <Link key={"signin-button-2"} href="/" as={`/`}>
            <Button>Domovská stránka</Button>
          </Link>,
        ]}
      />
    );
  }

  return (
    <div
      className="container guttered"
      style={{ maxWidth: "400px", margin: "40px auto" }}
    >
      <MetaData title={"Prihlásenie do Vášho účtu"} noindex={true} />
      <h1>Prihlásenie</h1>
      <Row gutter={[8, 24]}>
        {facebokLoginEnabled ? (
          <Col xs={24} md={googleLoginEnabled ? 12 : 24}>
            <Button
              type="primary"
              icon={<FacebookFilled />}
              style={{ background: "#4267B2", borderColor: "#4267B2" }}
              href={`${apiHost}/api/v2/auth/facebook?webInstanceToken=${get(
                webInstance,
                "webInstanceToken"
              )}&cartAccessToken=${encodeURIComponent(
                get(cart, "accessToken", "")
              )}&frontendReturnUrl=${host}/api/lib/v1/auth/oauth?backUrl=${
                router.asPath
              }`}
              block
            >
              Facebook prihlásenie
            </Button>
          </Col>
        ) : null}

        {googleLoginEnabled ? (
          <Col xs={24} md={facebokLoginEnabled ? 12 : 24}>
            <Button
              type="primary"
              icon={<GoogleOutlined />}
              style={{ background: "#db3236", borderColor: "#db3236" }}
              href={`${apiHost}/api/v2/auth/google?webInstanceToken=${get(
                webInstance,
                "webInstanceToken"
              )}&cartAccessToken=${encodeURIComponent(
                get(cart, "accessToken", "")
              )}&frontendReturnUrl=${host}/api/lib/v1/auth/oauth?backUrl=${
                router.asPath
              }`}
              block
            >
              Google prihlásenie
            </Button>
          </Col>
        ) : null}

        {facebokLoginEnabled || googleLoginEnabled ? (
          <Col xs={24}>
            <Divider>alebo</Divider>
          </Col>
        ) : (
          ""
        )}
      </Row>

      <Row>
        <Col xs={24}>
          <LoginForm />
        </Col>
      </Row>
    </div>
  );
};

export const getServerSideProps = async ({ req, res }) => {
  const user = req.session.get(USER_CONSTANT);
  const cart = req.session.get(CART_CONSTANT);

  return {
    props: {
      user: user ? user : null,
      cart: cart ? cart : null,
      apiHost: reqApiHost(),
      host: reqGetHost(req),
    },
  };
};

export default Login;
