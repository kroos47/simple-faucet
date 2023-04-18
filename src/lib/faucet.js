import { ApiPromise, WsProvider } from "@polkadot/api";
// import { waitReady } from '@polkadot/wasm-crypto';
import { Keyring }  from '@polkadot/keyring';
const {WS, SEED_PHRASE, AMOUNT} = process.env

class ApiInstance{
    constructor(){
      this.options = {
        max: 500,
      
        // for use with tracking overall storage size
        maxSize: 5000,
        sizeCalculation: (value, key) => {
          return 1
        },
      
        // for use when you need to clean up something when objects
        // are evicted from the cache
        dispose: (value, key) => {
          freeFromMemoryOrWhatever(value)
        },
      
        // how long to live in ms
        ttl: 1000 * 60 * 5,
      
        // return stale items before removing from cache?
        allowStale: false,
      
        updateAgeOnGet: false,
        updateAgeOnHas: false,
      
        // async method to use for cache.fetch(), for
        // stale-while-revalidate type of behavior
        fetchMethod: async (
          key,
          staleValue,
          { options, signal, context }
        ) => {},
      }      
      this.api = null;
      this.apiInit();
    }

    async apiInit(){
        const ws = new WsProvider(WS);
        this.api = await ApiPromise.create({
          provider: ws,
          rpc: {
            kate: {
              blockLength: {
                description: "Get Block Length",
                params: [
                  {
                    name: 'at',
                    type: 'Hash',
                    isOptional: true
                  }
                ],
                type: 'BlockLength'
              },
              queryProof: {
                description: 'Generate the kate proof for the given `cells`',
                params: [
                  {
                    name: 'cells',
                    type: 'Vec<Cell>'
                  },
                  {
                    name: 'at',
                    type: 'Hash',
                    isOptional: true
                  },
                ],
                type: 'Vec<u8>'
              },
              queryDataProof: {
                description: 'Generate the data proof for the given `index`',
                params: [
                  {
                    name: 'data_index',
                    type: 'u32'
                  },
                  {
                    name: 'at',
                    type: 'Hash',
                    isOptional: true
                  }
                ],
                type: 'DataProof'
              }
            }
          },
          types: {
            AppId: 'Compact<u32>',
            DataLookupIndexItem: {
              appId: 'AppId',
              start: 'Compact<u32>'
            },
            DataLookup: {
              size: 'Compact<u32>',
              index: 'Vec<DataLookupIndexItem>'
            },
            KateCommitment: {
              rows: 'Compact<u16>',
              cols: 'Compact<u16>',
              dataRoot: 'H256',
              commitment: 'Vec<u8>'
            },
            V1HeaderExtension: {
              commitment: 'KateCommitment',
              appLookup: 'DataLookup'
            },
            VTHeaderExtension: {
              newField: 'Vec<u8>',
              commitment: 'KateCommitment',
              appLookup: 'DataLookup'
            },
            HeaderExtension: {
              _enum: {
                V1: 'V1HeaderExtension',
                VTest: 'VTHeaderExtension'
              }
            },
            DaHeader: {
              parentHash: 'Hash',
              number: 'Compact<BlockNumber>',
              stateRoot: 'Hash',
              extrinsicsRoot: 'Hash',
              digest: 'Digest',
              extension: 'HeaderExtension'
            },
            Header: 'DaHeader',
            CheckAppIdExtra: {
              appId: 'AppId'
            },
            CheckAppIdTypes: {},
            CheckAppId: {
              extra: 'CheckAppIdExtra',
              types: 'CheckAppIdTypes'
            },
            BlockLength: {
              max: 'PerDispatchClass',
              cols: 'Compact<u32>',
              rows: 'Compact<u32>',
              chunkSize: 'Compact<u32>'
            },
            PerDispatchClass: {
              normal: 'u32',
              operational: 'u32',
              mandatory: 'u32'
            },
            DataProof: {
              root: 'H256',
              proof: 'Vec<H256>',
              numberOfLeaves: 'Compact<u32>',
              leaf_index: 'Compact<u32>',
              leaf: 'H256'
            },
            Cell: {
              row: 'u32',
              col: 'u32',
            }
          },
          signedExtensions: {
            CheckAppId: {
              extrinsic: {
                appId: 'AppId'
              },
              payload: {}
            },
          },
        });
        
        // await waitReady();
    
        // Retrieve the chain & node information information via rpc calls
        const [chain, nodeName, nodeVersion] = await Promise.all([
          this.api.rpc.system.chain(),
          this.api.rpc.system.name(),
          this.api.rpc.system.version(),
        ]);
        // Log these stats
        console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
    
    }

    async send(address){
        // await waitReady();
        const keyring = new Keyring({ type: "sr25519" });
        const sender = keyring.addFromUri(SEED_PHRASE);
        console.log(`Sending ${AMOUNT} to ${address}`);
        const tx = this.api.tx.balances.transfer(address, 12345);
        const hash = await tx.signAndSend(sender);
        console.log("Transfer sent with hash", hash.toHex());
        return `Done! Transfer ${AMOUNT} AVL to ${address} with hash ${hash.toHex()}`;
    }
}

export default ApiInstance