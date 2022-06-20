import Head from 'next/head'
import Image from 'next/image'
import { useAccount, useConnect, useContract, useSigner } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import authABI from "../utils/abi.json";
import styles from '../styles/Home.module.css'
import { authCallData } from '../zkproof/snarkjsauth';


export default function Home() {

  let data1;

  const {data: account} = useAccount();
  const {connect} = useConnect({
    connector: new InjectedConnector(),
  });

  const {data: signer, isError, isLoading} = useSigner();
  
  const contract = useContract({
    addressOrName: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    contractInterface: authABI.abi,
    signerOrProvider: signer
  });

  const getData = async() => {
    const input = {
      pubHash: "3572713155681323789438913994065456644420707158212740033489761108462149416484",
      pubKey: "0xA299DE74e1Bfb116Edb1813351A5e8ba9E1E7f86",
      secret: "98765",
      rString: "12345"
    }

    data1 = await authCallData(input);

    console.log(data1);

  }

  const runProof = async() => {
    console.log(data1);
    let result = await contract.verifyProof(
      data1.a,
      data1.b,
      data1.c,
      data1.Input
  );

  console.log(result);
  }



  return (
    <div className="flex flex-col min-h-screen justify-center items-center">
      {
        !account ? (
          <button onClick={() => connect()} 
          className="w-36 px-4 py-2 bg-cyan-300 rounded-xl">Connect Wallet</button>
        ): (
          <div className="flex flex-col">
            Connected to {account.address}

            <button onClick={() => getData()} 
          className="w-36 px-4 py-2 bg-cyan-300 rounded-xl">Get Data</button>
          <button onClick={() => runProof()} 
          className="w-36 px-4 py-2 bg-cyan-300 rounded-xl">Run Proof</button>

          </div>
        )
      }
    </div>
  )
}
