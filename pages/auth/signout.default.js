import {
  USER_CONSTANT,
  USER_COMPARE_CONSTANT,
  USER_WISHLIST_CONSTANT,
} from "grandus-lib/constants/SessionConstants";

import { get } from "lodash";
import { Result, Button } from "antd";
import useUser from "grandus-lib/hooks/useUser";
import useCart from "grandus-lib/hooks/useCart";
import Link from "next/link";

const Signout = ({ user }) => {
  const { logoutUser } = useUser();
  const { mutateCart } = useCart();
  React.useEffect(() => {
    logoutUser();
    mutateCart();
  }, []);

  if (!user?.accessToken) {
    return (
      <div className="container guttered">
        <Result
          title="Boli ste úspešne odhlásený"
          extra={[
            <Link
              key="signout-button-1"
              href="/prihlasenie"
              as={`/prihlasenie`}
            >
              <Button>Prihlásenie</Button>
            </Link>,
            <Link key="signout-button-2" href="/" as={`/`}>
              <Button>Domovská stránka</Button>
            </Link>,
          ]}
        />
      </div>
    );
  }

  return (
    <div
      className="container guttered"
      style={{ maxWidth: "400px", margin: "40px auto" }}
    >
      ste prihlásený ako {get(user, "email")}
    </div>
  );
};

export const getServerSideProps = async ({ req, res }) => {
  req.session.unset(USER_CONSTANT);
  req.session.unset(USER_COMPARE_CONSTANT);
  req.session.unset(USER_WISHLIST_CONSTANT);
  await req.session.save();
  await req.session.destroy();

  const user = req.session.get(USER_CONSTANT);
  return {
    props: { user: user ? user : null },
  };
};

export default Signout;
