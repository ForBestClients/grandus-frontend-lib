import useUser from "grandus-lib/hooks/useUser";
import MetaData from "grandus-lib/components-atomic/MetaData";

import Link from "next/link";
import { get } from "lodash";
import RegisterForm from "components/forms/Register";
import { Button, Result } from "antd";
import { userPage } from "grandus-lib/utils/fetches";
import { useEffect } from "react";

const Register = ({ user }) => {
  const { user: userFront, mutateUser } = useUser({
    redirectTo: "/",
    redirectIfFound: true,
    initialUser: user
  });

  useEffect (() => {
    mutateUser(user, false);
  }, [user, mutateUser]);

  if (userFront?.id) {
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
      <MetaData title={"Registrácia nového zákazníka"} noindex={true} />
      <h1>Registrácia</h1>
      <RegisterForm />
    </div>
  );
};

export const getServerSideProps = async (context) => {
  return await userPage.serverSideProps(context);
};

export default Register;
