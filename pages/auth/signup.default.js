import useUser from "grandus-lib/hooks/useUser";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";

import Link from "next/link";
import { get } from "lodash";
import RegisterForm from "components/forms/Register";
import { Button, Result } from "antd";

const Register = ({ user }) => {
  const { user: userFront } = useUser({
    redirectTo: "/",
    redirectIfFound: true,
  });

  if (user || userFront) {
    return (
      <div className="container guttered">
        <Result
          status="success"
          title={"Úspešná registrácia"}
          subTitle={`Vaše konto bolo vytvorené ${get(
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
      </div>
    );
  }

  return (
    <div
      className="container guttered"
      style={{ maxWidth: "400px", margin: "40px auto" }}
    >
      <RegisterForm />
    </div>
  );
};

export const getServerSideProps = async ({ req, res }) => {
  const user = req.session.get(USER_CONSTANT);

  return {
    props: { user: user ? user : null },
  };
};

export default Register;
