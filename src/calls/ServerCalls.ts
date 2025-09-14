import { GlobalEvents } from "../core/EventBus";
import { EventTypes } from "../Events/EventTypes";

const K_SERVER_ADDRESS : string = 'https://cozygame.rs:8001';

export interface CreateUserResponse {
    success: boolean;
    reason: string;
}

export async function RegisterUser(username: string, password: string): Promise<CreateUserResponse> {
    //Start loading
    GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);
    
    try {
        const response = await fetch(`${K_SERVER_ADDRESS}/users/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({username, password}),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data: CreateUserResponse = await response.json();
        console.log(data);
        return data;
    } catch (err)
    {
        console.error('Error while creating user: ' + err);
        return { success: false, reason: ""};
    }
    finally {
        GlobalEvents.Dispatch(EventTypes.StopLoaderEvent);
    }
}

export interface LoginUserResponse {
    success: boolean;
    user_id: number;
    token: string;
}

export async function LoginUser(username: string, password: string): Promise<LoginUserResponse>
{
    try {
        const response = await fetch(`${K_SERVER_ADDRESS}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({username, password})
        });

        if (!response.ok)
        {
            throw new Error(`HTTP Error! Status ${response.status}`);
        }

        const data: LoginUserResponse = await response.json();
        console.log(data);
        return data;
    } catch (err)
    {
        console.log("An error occured while trying to login user: " + err);
        return {success: false, user_id: -1, token: ""};
    }
}

export interface TokenCheckResponse
{
    success: boolean;
}

interface TokenCheckData
{
    user_id: number;
    token: string;
    session: number;
}

export async function CheckToken(userID: number, token: string, session: number): Promise<TokenCheckResponse>
{
    try {
        const postData: TokenCheckData = {user_id: userID, token: token, session: session};

        const response = await fetch(`${K_SERVER_ADDRESS}/game/check_tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },



            body: JSON.stringify(postData)
        });

        if (!response.ok)
        {
            throw new Error(`HTTP Error! Status ${response.status}`);
        }

        const data: TokenCheckResponse = await response.json();
        console.log(data);
        return data;
    } catch (err)
    {
        console.log("An error occured while checking for token: " + err);
        return {success: false};
    }
}

interface GameResponse
{
    success: boolean,
    check: string
}

interface GameRequest
{
    user_id: number,
    timestamp: number,
    token: string,
    session: number
}

export async function StartGame(userID: number, timestamp: number, token: string, session: number): Promise<GameResponse>
{
    try {
        const postData: GameRequest = {user_id: userID, timestamp: timestamp, token: token, session: session};

        const response = await fetch(`${K_SERVER_ADDRESS}/game/start_game`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok)
        {
            console.error(`HTTP Error! Status ${response.status}`);
            return {success: false, check: ""};
        }

        const data: GameResponse = await response.json();
        console.log(data);
        return data;
    } catch (err)
    {
        console.log("An error occured while checking for token: " + err);
        return {success: false, check: ""};
    }
}