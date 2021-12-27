import { assert } from 'chai'
import { Context } from 'fabric-contract-api'
import { ChaincodeStub } from 'fabric-shim'
import { describe, it } from "mocha"
import * as sinon from 'sinon'
import { SinonStubbedInstance } from 'sinon'
import { SampleAsset } from '../src/assets/sample-asset'
import { SampleContract } from '../src/sample-contract'

describe('Sample Contract Tests', () => {
    let context: Context;
    let chaincodeStub: SinonStubbedInstance<ChaincodeStub>;

    beforeEach(() => {
        chaincodeStub = sinon.createStubInstance(ChaincodeStub);

        context = new Context();
        context.stub = chaincodeStub;

        chaincodeStub.getState.callsFake(async (key: string) => {
            let ret: SampleAsset = null;
            if (key == "key01") {
                ret = {
                    value1: "value01",
                    value2: "value02"
                }
            }

            return Promise.resolve(JSON.stringify(ret));
        });
    });

    describe('Test init()', () => {
        it('should return success on initLedger', async () => {
            try {
                const simplecc = new SampleContract();
                await simplecc.initLedger(context);
            } catch (err) {
                assert.fail('initLedger should not have failed');
            }
        });
    });

    describe('Test key01', () => {
        it('should return success on getValue', async () => {
            const simplecc = new SampleContract();
            await simplecc.initLedger(context);

            const value = await simplecc.getKeyValue(context, "key01");
            assert.isNotNull(value)

            const sampleAsset: SampleAsset = JSON.parse(value);
            assert.equal(sampleAsset.value1, "value01");
            assert.equal(sampleAsset.value2, "value02");
        });
    });
});