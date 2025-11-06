import { GlobalEvents } from "../core/EventBus";
import { EventTypes } from "../Events/EventTypes";

const K_SERVER_ADDRESS: string = 'https://cozygame.rs:8001';

// Common interfaces
export interface CreateUserResponse {
    success: boolean;
    reason: string;
}

export interface LoginUserResponse {
    success: boolean;
    user_id: number;
    token: string;
}

export interface TokenCheckResponse {
    success: boolean;
}

interface TokenCheckData {
    user_id: number;
    token: string;
    session: number;
}

interface GameResponse {
    success: boolean;
    check: string;
}

interface GameRequest {
    user_id: number;
    timestamp: number;
    token: string;
    session: number;
}

interface SaveGameRequest {
    user_id: number;
    timestamp: number;
    token: string;
    session: number;
    guesses: string;
    check: string;
}

interface SaveGameResponse {
    success: boolean;
}

interface DataLoadRequest {
    key: string;
}

interface DataLoadResponse {
    success: boolean;
    value: string;
}

async function makeServerCall<TResponse>(
    endpoint: string,
    body: any,
    errorMessage: string,
    defaultErrorResponse: TResponse,
    showLoader: boolean = false
): Promise<TResponse> {
    if (showLoader) {
        GlobalEvents.Dispatch(EventTypes.StartLoaderEvent);
    }

    try {
        const response = await fetch(`${K_SERVER_ADDRESS}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data: TResponse = await response.json();
        
        console.log(`Server call for ${endpoint} returned: ${JSON.stringify(data)}`)
        
        return data;
    } catch (err) {
        console.error(`${errorMessage}: ${err} // for enpoint: ${endpoint}`);
        return defaultErrorResponse;
    } finally {
        if (showLoader) {
            GlobalEvents.Dispatch(EventTypes.StopLoaderEvent);
        }
    }
}

export async function RegisterUser(username: string, password: string): Promise<CreateUserResponse> {
    return makeServerCall<CreateUserResponse>(
        '/users/create',
        { username, password },
        'Error while creating user',
        { success: false, reason: "" },
        true
    );
}

export async function LoginUser(username: string, password: string): Promise<LoginUserResponse> {
    return makeServerCall<LoginUserResponse>(
        '/users/login',
        { username, password },
        'An error occurred while trying to login user',
        { success: false, user_id: -1, token: "" }
    );
}

export async function CheckToken(userID: number, token: string, session: number): Promise<TokenCheckResponse> {
    const postData: TokenCheckData = { user_id: userID, token: token, session: session };
    return makeServerCall<TokenCheckResponse>(
        '/game/check_tokens',
        postData,
        'An error occurred while checking for token',
        { success: false }
    );
}

export async function StartGame(userID: number, timestamp: number, token: string, session: number): Promise<GameResponse> {
    const postData: GameRequest = { user_id: userID, timestamp: 1, token: token, session: session };
    console.log(JSON.stringify(postData));
    
    return makeServerCall<GameResponse>(
        '/game/start',
        postData,
        'An error occurred while starting game',
        { success: false, check: "" }
    );
}

export async function SaveGame(
    userID: number,
    timestamp: number,
    token: string,
    session: number,
    guesses: string,
    checkString: string
): Promise<SaveGameResponse> {
    const postData: SaveGameRequest = {
        user_id: userID,
        timestamp: timestamp,
        token: token,
        session: session,
        guesses: guesses,
        check: checkString
    };
    console.log(JSON.stringify(postData));

    return makeServerCall<SaveGameResponse>(
        '/game/save',
        postData,
        'An error occurred while saving game (guess)',
        { success: false }
    )
}

export async function LoadGame(dataKey: string): Promise<DataLoadResponse> {
    const postData: DataLoadRequest = { key: dataKey };

    return makeServerCall<DataLoadResponse>(
        '/game/get_data',
        postData,
        'An error occurred while loading game data',
        { success: false, value: "" }
    );
}