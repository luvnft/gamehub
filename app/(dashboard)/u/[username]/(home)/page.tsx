import { StreamPlayer } from "@/components/stream-player";
import { getStreamByUserId } from "@/lib/stream-service";
import { getUserByUsername } from "@/lib/user-service";
import { currentUser } from "@clerk/nextjs/server";

interface CreatorPageProps {
    params: {
        username: string;
    };
}

const CreatorPage = async ({ params }: CreatorPageProps) => {
    const externalUser = await currentUser();
    const user = await getUserByUsername(params.username);
    const stream = await getStreamByUserId(user!.id!);

    if (!user || user.externalUserId !== externalUser?.id || !stream) {
        throw new Error("Unauthorized");
    }
    return (
        <div className="h-full">
            <StreamPlayer user={user} stream={stream} isFollowing />
        </div>
    );
};

export default CreatorPage;
