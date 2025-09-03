export type UserSaveData = {
    token: string,
    username: string,
    userID: number,
}

export function GetDefaultUserSaveData(): UserSaveData
{
    return {token: '', username: '', userID: -1};
}