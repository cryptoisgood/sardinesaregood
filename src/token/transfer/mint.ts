import {balance_of, set_account_balance} from '../account';
import {ic, Opt, Principal} from 'azle';
import {state} from '../state';
import {Account, IcrcTransaction, IcrcTransferArgs, IcrcTransferResult} from '../types';
import {putTransaction} from "./putTransaction";
import {MINTING_ACCOUNT} from "../constants";

export function handle_mint(args: IcrcTransferArgs, from: Opt<Account>): IcrcTransferResult {
    set_account_balance(args.to, balance_of(args.to) + args.amount);
    console.log("minting tokens " + args.amount.toString(10));
    state.total_supply += args.amount;

    const transaction: IcrcTransaction = {
        kind: "Mint",
        burn: null,
        mint: {
            to: args.to,
            amount: args.amount,
            memo: args.memo,
            created_at_time: args.created_at_time
        },
        transfer: {
            from: MINTING_ACCOUNT,
            to: args.to,
            amount: args.amount,
            fee: args.fee,
            memo: args.memo,
            created_at_time: ic.time()
        },
        timestamp: ic.time()
    };



    return {
        Ok: putTransaction(transaction)
    };
}

export function is_minting_account(owner: Principal): boolean {
    return owner.toText() === state.minting_account?.owner.toText();
}
