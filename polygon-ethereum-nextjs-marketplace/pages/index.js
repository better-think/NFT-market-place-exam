import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
    nftaddress, nftmarketaddress
} from '../config'

import {
    gCoin
} from '../config_erc20'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'
import GCoin from '../artifacts/contracts/GCoin.sol/GCoin.json'
const Web3 = require("web3")
const web3 = new Web3("wss://rinkeby.infura.io/ws/v3/ca28dbffc5d14deca2170b6287d8a792")

export default function Home() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    const [totalVolume, setTotalVolume] = useState(82000000000000000)


    useEffect(() => {
        loadNFTs()
        loadTotalVolume()
        console.log("Load NFT done")
    }, [])

    async function loadNFTs() {
        // const provider = new ethers.providers.JsonRpcProvider()
        const provider = new ethers.providers.Web3Provider(web3.currentProvider)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
        const data = await marketContract.fetchMarketItems()

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
            }
            return item
        }))
        setNfts(items)
        setLoadingState('loaded')
    }

    function loadTotalVolume() {
        console.log("start subscribe logs")

        // const events = Market.abi.filter(obj => obj.type ? obj.type === "event" : false);    // getting the Transfer event, then pulling it out of the array
        // const event = events.filter(event => event.name === "MarketItemSaled")[0];
        // console.log("event = " + JSON.stringify(event));

        web3.eth.subscribe("logs", {
            address: "0x52047146f396671D76fbFD8b9B911727Dd5548F5",
            topics: [web3.utils.sha3("MarketItemSaled(uint256,address,uint256,address,address,uint256)")]
            //  topics: ["0xf508d7e0c4948bef562fa93bd0f424ce063d1def0ecf2ea0cc62bb2ec0419839"]
        }, (error, result) => {
            if (error) {
                console.error(error)
            } else {
                console.log("Got log:")
                console.log(result.toString())
                console.log(result.data)
                const decoder = new ethers.utils.AbiCoder();
                // this will return an array with an object for each event
                const events = Market.abi.filter(obj => obj.type ? obj.type === "event" : false);    // getting the Transfer event, then pulling it out of the array
                const event = events.filter(event => event.name === "MarketItemSaled")[0];

                // getting the types for the event signature
                // const types = event.inputs.map(input => input.type)    // knowing which types are indexed will be useful later
                let indexedInputs = [];
                let unindexedInputs = [];
                event.inputs.forEach(input => {
                    input.indexed ?
                        indexedInputs.push(input) :
                        unindexedInputs.push(input)
                });

                // const decodedTopics = indexedInputs.map(input => {
                //     // we use the position of the type in the array as an index for the
                //     // topic, we need to add 1 since the first topic is the event sig
                //     const value = decoder.decode(
                //         input.type,
                //         result.topics[indexedInputs.indexOf(input) + 1]
                //     ); 

                //     return `${input.name}: ${value}`;
                // });
                const decodedDataRaw = decoder.decode(unindexedInputs, result.data);
                console.log('decodedDataRaw=' + JSON.stringify(decodedDataRaw))
                const decodedData = unindexedInputs.forEach((input, i) => {
                    console.log(`${input.name}: ${decodedDataRaw[i]}`)
                    if (input.name === 'totalVolume') {
                        // console.log(`total volume: ${ethers.utils.toNumber(decodedDataRaw[i])}`)
                        setTotalVolume(decodedDataRaw[i])
                    }
                    return `${input.name}: ${decodedDataRaw[i]}`
                });

                // const decodedLogs = logs.map(log => {
                //     // remember how we separated indexed and unindexed events?
                //     // it was because we need to sort them differently here
                //     const decodedTopics = indexedInputs.map(input => {
                //         // we use the position of the type in the array as an index for the
                //         // topic, we need to add 1 since the first topic is the event sig
                //         const value = decoder.decode(
                //             input.type,
                //             log.topics[indexedInputs.indexOf(input) + 1]
                //         ); return `${input.name}: ${value}`;
                //     });
                //     const decodedDataRaw = decoder.decode(unindexedInputs, log.data);
                //     const decodedData = unindexedInputs.forEach((input, i) => {
                //         return `${input.name}: ${decodedDataRaw[i]}`
                //     });
                // });

                // const decodedLogs = decoder.decode("data", result.data);
                // console.log(decodedLogs);
            }
        })
            .on('connected', (subscriptionId) => {
                console.log('connected logs')
            })
            .on('data', (log) => {
                console.log(log);
            })
            .on("changed", (log) => {
                console.log('changed logs')
            })
    }
    async function buyNft(nft) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const gCoinContract = new ethers.Contract(gCoin, GCoin.abi, signer)

        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, "0x187D9dE4bcb90246E50650Fc5A591E2B35D19AC1", {
            value: price
        })
        await transaction.wait()
        loadNFTs()
    }
    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
    return (
        <div className="flex flex-col" >
            <div >{`Total volume ${totalVolume / 10e18} eth`}</div>
            <div className="flex justify-center">
                <div className="px-4" style={{ maxWidth: '1600px' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {
                            nfts.map((nft, i) => (
                                <div key={i} className="border shadow rounded-xl overflow-hidden">
                                    <img src={nft.image} />
                                    <div className="p-4">
                                        <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                                        <div style={{ height: '70px', overflow: 'hidden' }}>
                                            <p className="text-gray-400">{nft.description}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black">
                                        <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                                        <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}