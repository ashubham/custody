export interface Message {
    ts: number | string;
    text: string;
    payload: any;
    type: MessageTypes;
}

export enum MessageTypes {
    None,
    FILE_SHARE,
    TEXT
}
