import { isFollowingUser } from "@/lib/follow-service";
import { getUserByUsername } from "@/lib/user-service";
import { notFound } from "next/navigation";
import { Actions } from "./_components/actions";
import { isBlockedByUser, isInBlockedList } from "@/lib/block-service";

interface UserPageProps {
    params: {
        username: string;
    };
}

const UserPage = async ({ params }: UserPageProps) => {
    const user = await getUserByUsername(params.username);
    if (!user) {
        notFound();
    }

    const isFollowing = await isFollowingUser(user.id!);
    const isBlocked = await isBlockedByUser(user.id!);
    if (isBlocked) {
        notFound();
    }
    const isInMyBlockedList = await isInBlockedList(user.id!);

    return (
        <div className="flex flex-col gap-y-4">
            <p>username: {user.username}</p>
            <p>userID: {user.id}</p>
            <p>is Following: {JSON.stringify(isFollowing)}</p>
            <p>is blocked by this user: {`${isBlocked}`}</p>
            <Actions
                userId={user.id!}
                isFollowing={isFollowing}
                isInMyBlockedList={isInMyBlockedList}
            />
        </div>
    );
};

export default UserPage;
