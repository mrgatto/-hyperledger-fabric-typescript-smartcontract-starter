'use strict';

import { Context, Contract } from 'fabric-contract-api';
import { SampleAsset } from './assets/sample-asset';

export class SampleContract extends Contract {

    constructor() {
        super('SampleContract');
    }

    public async initLedger(ctx: Context): Promise<void> {
        console.log(`Initialization code`);
    }

    public async beforeTransaction(ctx: Context): Promise<void> {
        const txid = ctx.stub.getTxID();
        const fnc = ctx.stub.getFunctionAndParameters().fcn;
        const caller = ctx.clientIdentity.getMSPID();

        console.log(`Transaction ${txid} from ${caller}: ${fnc}`);
    }

    public async getKeyValue(ctx: Context, key: string): Promise<string> {
        console.log(`getKeyValue(${key})`);

        const objectBytes = await ctx.stub.getState(key);
        if (!objectBytes) {
            throw new Error(`The key ${key} does not exist`);
        }

        return objectBytes.toString();
    }

    public async setValue(ctx: Context, key: string, value1: string, value2: string): Promise<void> {
        console.log(`setValue(${key},${value1},${value2})`);

        if (!key || !value1 || !value2) {
            throw new Error('Invalid arguments');
        }

        const sampleAsset = new SampleAsset();
        sampleAsset.value1 = value1;
        sampleAsset.value2 = value2;

        await ctx.stub.putState(key, Buffer.from(JSON.stringify(sampleAsset)));

        ctx.stub.setEvent('valueIncluded', Buffer.from(JSON.stringify(sampleAsset)));
    }

    public async getAll(ctx: Context): Promise<string> {
        console.log(`getAll()`);

        const objects = [];

        const it = ctx.stub.getStateByRange('', '');
        for await (const value of it) {
            const obj = {
                key: value.key,
                value: JSON.parse(value.value.toString()),
            };

            objects.push(obj);
        }

        return JSON.stringify(objects);
    }

    public async getKeyHistory(ctx: Context, key: string): Promise<string> {
        console.log(`getHistory(${key})`);

        const objects = [];

        const it = ctx.stub.getHistoryForKey(key);
        for await (const value of it) {
            const obj = {
                tx: value.txId,
                value: JSON.parse(value.value.toString()),
                when: this.toDate(value.timestamp).toISOString(),
            };

            objects.push(obj);
        }

        return JSON.stringify(objects);
    }

    private toDate(timestamp): Date {
        const milliseconds = (timestamp.seconds.low
            + ((timestamp.nanos / 1000000) / 1000)) * 1000;
        return new Date(milliseconds);
    }

}
