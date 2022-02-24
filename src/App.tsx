import React, { useMemo, useState } from 'react';
import * as web3 from '@solana/web3.js'
import mintNFT from './utils/nft'
import { programs } from '@metaplex/js'
import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, } from "@solana/spl-token";
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    getPhantomWallet,
} from '@solana/wallet-adapter-wallets';
import {WalletConnect} from './wallet'
import '@solana/wallet-adapter-react-ui/styles.css';


import axios from 'axios'
import './App.css';
const { metadata: { Metadata } } = programs
const { clusterApiUrl, PublicKey, Keypair } = web3
const network = clusterApiUrl('mainnet-beta');
const connection =new web3.Connection(network)

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
)

function App() {
  const wallet = useWallet()
  const [status, setStatus] = useState("")
  const [nfts, setNfts] = useState<any[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [is_minting, setIsMinting] = useState(false)
  const onChangeAmount = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value
    setAmount(parseInt(newValue))
  }

  const fork = async(data: any) => {
    try{
      setIsMinting(true)
      setStatus("Minting ...")
      console.log(data)
      await mintNFT(connection, wallet, data, amount)
      setStatus("Minted")
      setIsMinting(false)
    } catch(error) {
      setIsMinting(false)
      console.log(error)
      setStatus(`Something went wrong.`)
    }
  }  

  async function getNftsForOwner( conn : any,
    owner : any,
    ){
    let allNFTs = []
    console.log("+ getNftsForOwner")
    const tokenAccounts = await conn.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID
    });
  
    for (let index = 0; index < tokenAccounts.value.length; index++) {
      try{
        const tokenAccount = tokenAccounts.value[index];
        const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;
        if(Number(tokenAmount.amount) === 1 && Number(tokenAmount.decimals) === 0) {
          let nftMint = new PublicKey(tokenAccount.account.data.parsed.info.mint)
          let [pda] = await anchor.web3.PublicKey.findProgramAddress([
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            nftMint.toBuffer(),
          ], TOKEN_METADATA_PROGRAM_ID);
          const accountInfo: any = await conn.getParsedAccountInfo(pda);
          let metadata : any = new Metadata(owner.toString(), accountInfo.value);
          const { data }: any = await axios.get(metadata.data.data.uri)
          const entireData = { ...data, id: Number(data.name.replace( /^\D+/g, '').split(' - ')[0]) }
          allNFTs.push({...entireData})
        }
      } catch(err) {}
    }
    return allNFTs
  }
  const getNFTSForWallet = async() => {
    setNfts(await getNftsForOwner(connection , wallet!.publicKey))
  }
  
  return (
    <div className="container">
      <h3>{status}</h3>
      <br></br>
     
      <hr/>
      <div className='row'>

          <h4>Your NFTs</h4>
          <button type="button" className="col-sm-3 btn btn-primary" onClick={getNFTSForWallet}>Get Tokens</button>
          
          <div className="input-group">
            <span className="input-group-text">Amount</span>
            <input type="text" className="form-control" onChange={onChangeAmount} value={amount}></input>
          </div>
          {
            nfts.map((nft,idx)=>{
              return <div className="card m-3" key={idx} style={{"width" : "250px"}}>
                <img className="card-img-top" src={nft.image} alt="Image Error"/>
                <div className="card-img-overlay">
                  <button type="button" className="btn btn-success" onClick={async ()=>{fork(nft)}}>Fork</button>
                </div>
              </div>
            }) 
          }
      </div>
    </div>
  );
}

const AppWithProvider = () => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [getPhantomWallet()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div>
            <WalletConnect />
          </div>
          <App />  
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );  
}

export default AppWithProvider;

