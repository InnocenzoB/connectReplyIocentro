import { NetInfo } from "react-native";
import { Subject } from "rxjs/Subject";

export class ConnectionStatus {
    public static instance = new ConnectionStatus();

    public statusListener = new Subject<boolean>();
    private isConnected: boolean = false;

    constructor() {
        NetInfo.isConnected.addEventListener("change", this.handleConnectionChange);
        NetInfo.isConnected.fetch().then((isConnected) => {
            this.isConnected = isConnected;
            this.statusListener.next(isConnected);
        });
    }

    public getStatus() {
        return this.isConnected;
    }

    private handleConnectionChange = (isConnected) => {
        this.isConnected = isConnected;
        this.statusListener.next(isConnected);
    }
}
