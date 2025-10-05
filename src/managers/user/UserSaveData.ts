export type UserSaveData = {
    token: string,
    username: string,
    userID: number,
    checkString: string
}

export function GetDefaultUserSaveData(): UserSaveData
{
    return {token: '', username: '', userID: -1, checkString: ''};
}