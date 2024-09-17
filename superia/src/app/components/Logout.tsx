import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";

function LogoutButton() {
    const {logout} = useAuth0();

    return (
      <button><Link href="/api/auth/logout">Deconnexion</Link></button>
    )
};

export default LogoutButton