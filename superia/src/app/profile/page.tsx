import { GetSession, getSession } from "@auth0/nextjs-auth0";
import ProfileServer from "./user-server";
import ProfileClient from "./user-client";
import {redirect} from "next/navigation";


const Profile = async () => {
    const session = await getSession();
    const user = session?.user;
    if (!user) {redirect("/");}
    return <div><div><h1>Client Component</h1>
    <ProfileClient/>
    </div>
    <div><h1>Server Component</h1> <ProfileServer/></div>
    </div>;
};

export default Profile;
