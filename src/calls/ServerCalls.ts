import { GlobalEvents } from "../core/EventBus";
import { EventTypes } from "../Events/EventTypes";

const K_SERVER_ADDRESS : string = 'https://cozygame.rs:8001';

export interface CreateUserResponse {
    success: boolean;
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
        return { success: false};
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