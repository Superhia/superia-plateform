'use client';

import { useUser } from "@auth0/nextjs-auth0/client";

const ProfileClient = () => {
    const {user, error} = useUser();

    if (error) return <div>{error.message}</div>;
    return user ? (
        <div>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    ) : (
<div>No user logged in</div>
    );

}

export default ProfileClient;