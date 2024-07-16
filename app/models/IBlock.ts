import { IUser } from "./IUser";

export interface IBlock {
    id?: string;
    blockerId: string;
    blockedId: string;

    blocker: IUser;
    blocked: IUser;
}
