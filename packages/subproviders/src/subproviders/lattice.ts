import { assert } from '@0x/assert';
import { addressUtils } from '@0x/utils';
import EthereumTx = require('ethereumjs-tx');
import * as _ from 'lodash';

import { LatticeSubproviderConfig, PartialTxParams, WalletSubproviderErrors } from '../types';

import { BaseWalletSubprovider } from './base_wallet_subprovider';

const DEFAULT_NUM_ADDRESSES_TO_FETCH = 1;
const MAINNET_ID = 1;
const ROPSTEN_ID = 3;
const RINKEBY_ID = 4;
const KOVAN_ID = 42;
const GOERLI_ID = 6284;

function getNetwork(networkId: number): string {
    switch (networkId) {
        case ROPSTEN_ID:
            return 'ropsten';
        case RINKEBY_ID:
            return 'rinkeby';
        case KOVAN_ID:
            return 'kovan';
        case GOERLI_ID:
            return 'goerli';
        case MAINNET_ID:
        default:
            return 'mainnet';
    }
}

export class LatticeSubprovider extends BaseWalletSubprovider {
    private readonly _latticeConnectClient: any;

    constructor(config: LatticeSubproviderConfig) {
        super();
        const opts = {
            name: config.appName,
            network: getNetwork(config.networkId),
        };
        this._latticeConnectClient = new config.latticeConnectClient(opts);
    }

    public async getAccountsAsync(numberOfAccounts: number = DEFAULT_NUM_ADDRESSES_TO_FETCH): Promise<string[]> {
        try {
            const accounts = await this._latticeConnectClient.addAccounts(numberOfAccounts);
            return accounts;
        } catch (err) {
            throw err;
        }
    }

    public async signTransactionAsync(txData: PartialTxParams): Promise<string> {
        if (txData.from === undefined || !addressUtils.isAddress(txData.from)) {
            throw new Error(WalletSubproviderErrors.FromAddressMissingOrInvalid);
        }
        const txReq = new EthereumTx(txData);
        try {
            const signedTx = await this._latticeConnectClient.signTransaction(txData.from, txReq);
            return `0x${signedTx.serialize().toString('hex')}`;
        } catch (err) {
            throw err;
        }
    }

    public async signPersonalMessageAsync(data: string, address: string): Promise<string> {
        if (data === undefined) {
            throw new Error(WalletSubproviderErrors.DataMissingForSignPersonalMessage);
        }
        assert.isHexString('data', data);
        assert.isETHAddressHex('address', address);

        try {
            const sig = await this._latticeConnectClient.signPersonalMessage(address, data);
            return sig;
        } catch (err) {
            throw err;
        }
    }

    // tslint:disable-next-line:prefer-function-over-method
    public async signTypedDataAsync(address: string, typedData: any): Promise<string> {
        throw new Error(WalletSubproviderErrors.MethodNotSupported);
    }
}
