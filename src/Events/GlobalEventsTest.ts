import { GlobalEvents } from "../core/EventBus";
import { EventTypes } from "./EventTypes";

let message: string = "Hello, World!";
GlobalEvents.AddListener(EventTypes.TestEvent, (msg: string) => {
    console.log(`Received message: ${msg}`);
});

GlobalEvents.Dispatch("testEvent", message);