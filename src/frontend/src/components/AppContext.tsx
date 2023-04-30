import React, {createContext, useContext, useEffect, useState} from 'react';
import {bigIntToDecimalPrettyString} from "../util/bigintutils";
import {Principal} from "@dfinity/principal";
import {useCanister, useConnect} from "@connect2ic/react";
import {_SERVICE, ProposalViewResponse} from "../declarations/token/token.did";

interface AppContextType {
    balance: bigint;
    balancePretty: string;

    activeProposal?: ProposalViewResponse;

    setActiveProposal?: (activeProposal: ProposalViewResponse) => void;
    setBalanceVal?: (balance: bigint) => void;
    reloadBalance?: () => Promise<void>;

    reloadActiveProposal?: () => Promise<void>;

    setReloadDaoBalances?: (reload: () => Promise<void>) => void;

    reloadDaoBalances?: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
    balance: 0n,
    balancePretty: "0"
});

const AppProvider: React.FC = (param: { children }) => {
    const [balance, setBalance] = useState<bigint>(0n);
    const [activeProposal, setActiveProposal] = useState<ProposalViewResponse>();
    const [balancePretty, setBalancePretty] = useState<string>("0");
    const [reloadDaoBalancesInner, setReloadDaoBalances] = useState<() => Promise<void>>()
    const [_tokenActor] = useCanister('token');
    const tokenActor = _tokenActor as unknown as _SERVICE;
    const {principal} = useConnect();

    useEffect(() => {
        if (principal)
            init().then();
    }, [principal]);

    async function init() {
        try {
            const [balance, activeProposal] = await Promise.all([
                tokenActor.icrc1_balance_of({
                    owner: Principal.fromText(principal),
                    subaccount: []
                }),
                tokenActor.activeProposal()
            ]);
            setBalanceVal(balance);
            setActiveProposal(activeProposal["Ok"]);
        } catch (error) {
            console.error(error);
        }
    }

    const setBalanceVal = (balance: bigint) => {
        setBalance(balance);
        setBalancePretty(bigIntToDecimalPrettyString(balance))
    }
    const reloadBalance = async () => {
        const balance = await tokenActor.icrc1_balance_of({
            owner: Principal.fromText(principal),
            subaccount: []
        });
        setBalanceVal(balance);
    };

    const reloadActiveProposal = async () => {
        const activeProposal = await tokenActor.activeProposal();
        setActiveProposal(activeProposal["Ok"]);
    }

    const reloadDaoBalances = async () => {
        if (reloadDaoBalancesInner && typeof reloadDaoBalancesInner === 'function') {
            await reloadDaoBalancesInner();
        }
    }

    const state: AppContextType = {
        balance,
        balancePretty,
        setBalanceVal,
        reloadBalance,
        activeProposal,
        setActiveProposal,
        reloadActiveProposal,
        reloadDaoBalances,
        setReloadDaoBalances
    };

    return (
        <AppContext.Provider value={state}>
            {param.children}
        </AppContext.Provider>
    );
};

const useAppContext = (): AppContextType => useContext(AppContext);

export {AppProvider, useAppContext};