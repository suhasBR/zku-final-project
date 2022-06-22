import Head from "next/head";
import Image from "next/image";
import React, { useState } from "react";
import { useAccount, useConnect, useContract, useSigner } from "wagmi";
import { useFormik } from "formik";
import { InjectedConnector } from "wagmi/connectors/injected";
import authABI from "../utils/abi.json";
import styles from "../styles/Home.module.css";
import { authCallData } from "../zkproof/snarkjsauth";
import axios from "axios";
import { object, string, number, date, InferType } from "yup";
import { ethers } from "ethers";
import { buildPoseidon } from "circomlibjs";

export default function Home() {
  let data1;

  const { data: account } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const [pubHash, changePubHash] = useState("");

  const { data: signer, isError, isLoading } = useSigner();

  const contract = useContract({
    addressOrName: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    contractInterface: authABI.abi,
    signerOrProvider: signer,
  });

  let userSchema = object({
    email: string().email().required(),
    password: string().required(),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      try {
        const userData = JSON.stringify(values, null, 2);
        console.log("userdata", userData);
        const parsedUser = await userSchema.validate(values, { strict: true });
        console.log(parsedUser);

        //submit email to server
        // const response = await fetch("/api/email", {
        //   method: "POST",
        //   body: JSON.stringify({
        //     parsedUser
        //   }),
        // });

        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        const body = {
          email: parsedUser.email,
        };

        const res = await axios.post("/api/email", body, config);

        const poseidon = await buildPoseidon();
        const public_hash = ethers.BigNumber.from(
          poseidon.F.toString(
            poseidon([account.address, formik.values.password, res.data])
          )
        ).toBigInt();

        console.log(public_hash.toString());

        changePubHash(public_hash.toString());
      } catch (error) {
        console.log(error.message);
      }
    },
  });

  const getData = async () => {
    const input = {
      pubHash:
        "3572713155681323789438913994065456644420707158212740033489761108462149416484",
      pubKey: "0xA299DE74e1Bfb116Edb1813351A5e8ba9E1E7f86",
      secret: "98765",
      rString: "12345",
    };

    //get calldata
    data1 = await authCallData(input);

    console.log(data1);
  };

  const runProof = async () => {
    console.log(data1);

    //verify proof
    let result = await contract.verifyProof(
      data1.a,
      data1.b,
      data1.c,
      data1.Input
    );

    console.log(result);

    if(result){
      alert('Authentication Successful !');
    }
    else{
      alert('Failed to Authenticate !');
    }
  };

  const formik2 = useFormik({
    initialValues: {
      pubhash:"",
      secret: "",
      rstring: "",
    },
    onSubmit: async (values) => {
      try {
        const userData = JSON.stringify(values, null, 2);
        console.log("userdata", userData);
        const input = {
          pubHash : formik2.values.pubhash,
          pubKey : account.address,
          secret : formik2.values.secret,
          rString : formik2.values.rstring
        };

        //get calldata

        try {
          data1 = await authCallData(input);
          console.log(data1);

          if(!data1){
            alert('Failed to Authenticate !')
            return;
          }

           //verify proof
           runProof();
        } catch (error) {
          console.log(error);
          alert('Failed to Authenticate !');
        }


        

       


      } catch (error) {
        console.log(error.message);
      }
    },
  });

  return (
    <div className="flex flex-col min-h-screen justify-center items-center">
      {!account ? (
        <button
          onClick={() => connect()}
          className="w-36 px-4 py-2 bg-cyan-300 rounded-xl"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex flex-col">
          {/* Connected to {account.address}

            <button onClick={() => getData()} 
          className="w-36 px-4 py-2 bg-cyan-300 rounded-xl">Get Data</button>
          <button onClick={() => runProof()} 
          className="w-36 px-4 py-2 bg-cyan-300 rounded-xl">Run Proof</button> */}
          <h1 className="text-2xl text-center mt-20 mb-8 font-bold">Phase 1 Auth</h1>
          <div className="flex flex-col px-8 py-4 bg-blue-400 max-w-screen-sm rounded-xl">
            <form
              className="flex flex-col px-8 py-4 bg-blue-400 items-center justify-center rounded-xl"
              onSubmit={formik.handleSubmit}
            >
              <label htmlFor="email" className="text-white">
                Email
              </label>
              <input
                className="w-72 mt-2 mb-4 px-4 py-2 rounded-2xl border border-black"
                type="text"
                name="email"
                value={formik.values.email}
                autoComplete="off"
                onChange={formik.handleChange}
              ></input>

              <label htmlFor="password" className="text-white">
                Secret
              </label>
              <input
                className="w-72 mt-2 mb-4 px-4 py-2 rounded-2xl border border-black"
                type="password"
                name="password"
                value={formik.values.password}
                autoComplete="off"
                onChange={formik.handleChange}
              ></input>

              <button
                type="submit"
                className="w-72 mt-4 px-4 py-2 bg-teal-400 rounded-xl"
              >
                Submit
              </button>
            </form>
          </div>

          <div className="my-8 flex flex-col justify-center items-center text-base w-72">
            {pubHash && (
              <p className="text-base w-72">Public Hash : {pubHash}</p>
            )}
          </div>

          <h1 className="text-2xl text-center mt-20 mb-8 font-bold">Phase 2 Auth</h1>

          <div className="h-full mb-24 flex flex-col px-8 py-4 bg-blue-400 max-w-screen-sm rounded-xl">
            <form
              className="flex flex-col px-8 py-4 bg-blue-400 items-center justify-center rounded-xl"
              onSubmit={formik2.handleSubmit}
            >
              <label htmlFor="pubhash" className="text-white">
                Public Hash
              </label>
              <input
                className="w-72 mt-2 mb-4 px-4 py-2 rounded-2xl border border-black"
                type="text"
                name="pubhash"
                value={formik2.values.pubhash}
                autoComplete="off"
                onChange={formik2.handleChange}
              ></input>
              <label htmlFor="secret" className="text-white">
                Secret
              </label>
              <input
                className="w-72 mt-2 mb-4 px-4 py-2 rounded-2xl border border-black"
                type="password"
                name="secret"
                value={formik2.values.secret}
                autoComplete="off"
                onChange={formik2.handleChange}
              ></input>

              <label htmlFor="password" className="text-white">
                String Received on Email
              </label>
              <input
                className="w-72 mt-2 mb-4 px-4 py-2 rounded-2xl border border-black"
                type="password"
                name="rstring"
                value={formik2.values.rstring}
                autoComplete="off"
                onChange={formik2.handleChange}
              ></input>

              <button
                type="submit"
                className="w-72 mt-4 px-4 py-2 bg-teal-400 rounded-xl"
              >
                Submit
              </button>
            </form>
          </div>

         
        </div>
      )}
    </div>
  );
}
