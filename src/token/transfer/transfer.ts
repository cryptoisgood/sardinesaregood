import {balance_of, set_account_balance} from '../account';
import {ic} from 'azle';
import {state} from '../state';
import {Account, IcrcTransaction, TransactionKind, IcrcTransferArgs, IcrcTransferResult} from '../types';
import {uint8ToString} from "../utils";

export function handle_transfer(args: IcrcTransferArgs, from: Account): IcrcTransferResult {
    const kind: TransactionKind = {
        Transfer: null
    };

    const fee = args.fee ?? state.fee;

    set_account_balance(from, balance_of(from) - args.amount - fee);
    set_account_balance(args.to, balance_of(args.to) + args.amount);

    if (state.minting_account !== null) {
        set_account_balance(
            state.minting_account,
            balance_of(state.minting_account) + fee
        );
    }

    state.total_supply -= fee;

    console.log("transfered with memo: ", args.memo && uint8ToString(args.memo));

    const transaction: IcrcTransaction = {
        args,
        fee,
        from,
        kind,
        timestamp: ic.time()
    };

    state.transactions.push(transaction);

    return {
        Ok: args.amount
    };
}
