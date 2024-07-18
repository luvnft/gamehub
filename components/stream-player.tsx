"use client";

import { IStream } from "@/app/models/IStream";
import { IUser } from "@/app/models/IUser";
import { useViewerToken } from "@/hooks/use-viewer-token";

interface StreamPlayerProps {
    user: IUser;
    stream: IStream;
    isFollowing: boolean;
}

export const StreamPlayer = ({
    user,
    stream,
    isFollowing,
}: StreamPlayerProps) => {
    const { token, name, identity } = useViewerToken(user.id!);

    if (!token || !name || !identity) {
        return <div>Cannot watch the stream</div>;
    }

    return <div>Allowed to watch the stream</div>;
};
