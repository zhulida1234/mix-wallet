export type ChainIdType = 'X' | 'P' | 'C'


export enum TxState {
    failed = -1,
    waiting = 0,
    started = 1,
    success = 2,
}