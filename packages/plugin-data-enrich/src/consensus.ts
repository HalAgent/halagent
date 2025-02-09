// The message collaboration/cooperative utils.

import { IAgentRuntime } from "@elizaos/core";
/*
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { WS } from 'libp2p-websockets';
import { floodsub } from '@libp2p/floodsub';
import { PeerId } from '@libp2p/interface-peer-id';
import { bootstrap } from '@libp2p/bootstrap';
import * as msgpack from 'msgpack-lite';

import { Tweet } from "agent-twitter-client";
import { InferMessageProvider } from './infermessage';


const TOPIC_TWEET = 'web3agent-tweet';
const TOPIC_INFER_MESSAGE = 'web3agent-infer-message';
const CONSENSUS_PORT = 3011;

interface Content {
    metadata: {
        title: string;
        nodeid: string;
        timestamp: string;
        compressed: boolean;
    };
    body: string; // Tweet Text
}

interface GossipMessage {
    type: string;
    senderId: string;
    timestamp: string;
    content: Content;
}


export class ConsensusProvider {
    runtime: IAgentRuntime;
    private node = null;

    constructor(runtime: IAgentRuntime
    ) {
      this.runtime = runtime;
    }

    async startNode() {
        // create libp2p node
        this.node = await createLibp2p({
            addresses: 
                listen: [`/ip4/0.0.0.0/tcp/${CONSENSUS_PORT}`]
            },
            transports: [tcp(), WS()],
            peerDiscovery: [
                bootstrap({
                    list: [
                        `/ip4/192.168.1.1/tcp/${CONSENSUS_PORT}`,
                        `/ip4/192.168.1.2/tcp/${CONSENSUS_PORT}`,
                    ]
                })
            ]
        })
    
        // Start up the node
        await this.node.start();
        console.log('Node started with Gossip protocol');
    
        // node id
        const nodeId: PeerId = this.node.peerId;
        console.log('Node ID:', nodeId.toString());
    
        // port info
        //const listenAddr = `/ip4/0.0.0.0/tcp/${CONSENSUS_PORT}`;
        //this.node.listen(listenAddr);
        //console.log('Listening on address:', listenAddr);
    
        // join the group
        await this.node.pubsub.subscribe(TOPIC_INFER_MESSAGE, (message) => {
            const receivedMessage: GossipMessage = msgpack.decode(message.data);
            console.log(`Received message: ${receivedMessage}`);
            let inferMsgProvider: InferMessageProvider = new InferMessageProvider(this.runtime.cacheManager);
            inferMsgProvider.addInferMessage(receivedMessage.content.body);
        })
    }

    async pubMessage(text) {
        try {
            if (!this.node) {
                return;
            }
            const content: Content = {
                metadata: {
                    title: "Complex Content Example",
                    nodeid: this.node.peerId.toString(),
                    timestamp: new Date().toISOString(),
                    compressed: false,
                },
                body: text
            };
            const message: GossipMessage = {
                type: 'chat',
                senderId: this.node.peerId.toString(),
                timestamp: new Date().toISOString(),
                content: content
            };
            const messageBuffer = msgpack.encode(message);
            console.log(`Sending message: ${messageBuffer}`)
            this.node.pubsub.publish(TOPIC_INFER_MESSAGE, messageBuffer)
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }
}*/

export class ConsensusProvider {
    runtime: IAgentRuntime;
    private node = null;

    constructor(runtime: IAgentRuntime
    ) {
      this.runtime = runtime;
    }

    async startNode() {
    }

    async pubMessage(text) {
    }
}
