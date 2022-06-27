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
import { Identity } from "@semaphore-protocol/identity";
import Navbar from "../components/Navbar";
import Working from "../components/Working";
import Dialog from "../components/Dialog";
import Footer from "../components/Footer";

export default function Home() {
  let data1;

  const { data: account } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const [pubHash, changePubHash] = useState("");
  const [identityCommitment, changeIdentityCommitment] = useState("");
  const [pageController, changePageController] = useState(0);
  const [dialogOpen, changeDialogOpen] = useState(false);
  const [dialogText, changeDialogText] = useState("");

  const { data: signer, isError, isLoading } = useSigner();

  const contract = useContract({
    addressOrName: "0x6286dAb91901A0B18C57e0dB095CeA1901b9a2F4",
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

        if (isNaN(parsedUser.password.toString())) {
          changeDialogText("Password contains non-numeric values");
          changeDialogOpen(true);
          return;
        }

        //calculate intermediate hash
        const poseidon = await buildPoseidon();
        const int_hash = ethers.BigNumber.from(
          poseidon.F.toString(
            poseidon([account.address, formik.values.password])
          )
        ).toBigInt();

        const intHash = int_hash.toString();
        console.log(intHash);

        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };

        const body = {
          email: parsedUser.email,
          intHash: intHash,
          addr: account.address,
        };

        const res = await axios.post("/api/email", body, config);
        console.log("final hash : " + res.data);

        // const poseidon = await buildPoseidon();
        // const public_hash = ethers.BigNumber.from(
        //   poseidon.F.toString(
        //     poseidon([account.address, formik.values.password, res.data])
        //   )
        // ).toBigInt();

        // console.log(public_hash.toString());

        changePubHash(res.data);
      } catch (error) {
        console.log(error.message);
        changeDialogText(error.message);
        changeDialogOpen(true);
      }
    },
  });

  const getData = async () => {
    const input = {
      pubHash:
        "7456496290823021281081032811052666664496510297601767980302286514100278878013",
      pubKey: "0xA299DE74e1Bfb116Edb1813351A5e8ba9E1E7f86",
      secret: "12345",
      rString: "98765",
    };

    //get calldata
    data1 = await authCallData(input);

    console.log(data1);
  };

  const runProof = async (data) => {
    console.log(data);
    if (identityCommitment == "") {
      changeDialogText("Create Semaphore Identity first!");
      changeDialogOpen(true);
      return;
    }

    //verify proof
    try {
      let result = await contract.verifyHash(
        data.a,
        data.b,
        data.c,
        data.Input,
        account.address,
        identityCommitment
      );

      // console.log(result);

      // if(result){
      //   alert('Authentication Successful !');
      // }
      // else{
      //   alert('Failed to Authenticate !');
      // }
    } catch (error) {
      changeDialogText("Something went wrong");
      changeDialogOpen(true);
      console.log(error);
    }
  };

  const createIdentity = async () => {
    try {
      const identity1 = new Identity();
      const commitment = identity1.generateCommitment();
      changeIdentityCommitment(commitment.toString());
      console.log(commitment.toString());
    } catch (error) {
      console.log(error);
    }
  };

  const verifyAuth = async () => {
    try {
      console.log(identityCommitment);
      let result2 = await contract.isAuthenticated(identityCommitment);
      console.log(result2);
      if (result2) {
        changeDialogText("Email is verified for your identity !");
        changeDialogOpen(true);
      } else {
        changeDialogText("Email verification failed !");
        changeDialogOpen(true);
      }
    } catch (error) {
      changeDialogText("Something went wrong");
      changeDialogOpen(true);
      console.log(error);
    }
  };

  const formik2 = useFormik({
    initialValues: {
      pubhash: "",
      secret: "",
      rstring: "",
    },
    onSubmit: async (values) => {
      try {
        const userData = JSON.stringify(values, null, 2);
        // console.log("userdata", userData);
        const input = {
          pubHash: formik2.values.pubhash,
          pubKey: account.address,
          secret: formik2.values.secret,
          rString: formik2.values.rstring,
        };

        //get calldata

        try {
          data1 = await authCallData(input);
          console.log(data1);

          if (!data1) {
            alert("Failed to Authenticate!");
            return;
          }

          //verify proof
          runProof(data1);
        } catch (error) {
          console.log(error);
          alert("Failed to Authenticate !");
        }
      } catch (error) {
        console.log(error.message);
      }
    },
  });

  const changeView = () => {};

  const connectWallet = () => {
    connect();
  };

  return (
    <div className="flex flex-col min-h-screen items-center">
      <Dialog
        showModal={dialogOpen}
        closeModal={() => changeDialogOpen(false)}
        text={dialogText}
      />
      <Navbar
        account={account}
        clickHandler={changePageController}
        connectHandler={connectWallet}
      />
      {pageController === 0 ? (
        <Working />
      ) : pageController === 1 ? (
        <div className="flex flex-row mt-20 items-center w-[80%] justify-between">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-2xl text-center mb-8 font-bold">
              Phase 1 Auth
            </h1>
            <div className="flex flex-col px-8 py-4 bg-[#2A9D8F] max-w-screen-sm rounded-xl">
              <form
                className="flex flex-col px-8 py-4 bg-[#2A9D8F] items-center justify-center rounded-xl"
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
                  Number Password
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
                  className="w-72 mt-4 px-4 py-2 bg-[#E9C46A] text-[#264653] rounded-xl"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <button
              onClick={createIdentity}
              className="w-72 px-4 py-4 bg-[#264653] text-white rounded-xl"
            >
              Create Semaphore Identity
            </button>

            <div className="my-8 flex px-2 py-2 h-36 rounded-xl border flex-col justify-center items-center text-base w-96">
              {pubHash && (
                <div>
                  <div className="flex flex-row mb-4 justify-between items-center w-full">
                    <p className="text-base">Public Hash :</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(pubHash)}
                      className="text-sm bg-[#E9C46A] rounded-xl px-2"
                    >
                      Copy to clipboard
                    </button>
                  </div>
                  <p className="text-base w-72 break-all">{pubHash}</p>
                </div>
              )}
            </div>

            <div className="flex px-2 py-2 h-36 rounded-xl border flex-col justify-center items-center text-base w-96">
              {identityCommitment && (
                <div>
                  <div className="flex flex-row mb-4 justify-between items-center w-full">
                    <p className="text-base">Identity:</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(pubHash)}
                      className="text-sm bg-[#E9C46A] rounded-xl px-2"
                    >
                      Copy to clipboard
                    </button>
                  </div>
                  <p className="text-base w-72 break-all">
                    {identityCommitment}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-row mt-20 items-center w-[80%] justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl text-center mb-8 font-bold">
              Phase 2 Auth
            </h1>

            <div className="h-full mb-24 flex flex-col px-8 py-4 bg-[#2A9D8F] max-w-screen-sm rounded-xl">
              <form
                className="flex flex-col px-8 py-4 bg-[#2A9D8F] items-center justify-center rounded-xl"
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
                  className="w-72 mt-4 px-4 py-2 bg-[#E9C46A] text-[#264653] rounded-xl"
                >
                  Submit
                </button>
              </form>
            </div>

            {/* <button onClick={() => getData()} 
className="w-36 px-4 py-2 bg-cyan-300 rounded-xl">Get Data</button>
<button onClick={() => runProof()} 
className="w-36 px-4 py-2 bg-cyan-300 rounded-xl">Run Proof</button>  */}
          </div>
          <div className="flex flex-col items-center">
            {/* <h2 className="text-base mb-2">Identity Commitment</h2>
            <div className="flex mb-4 px-2 py-2 h-36 rounded-xl border flex-col justify-center items-center text-base w-96">
              <textarea onChange={(e) => changeIdentityCommitment(e.target.value)}
              className="w-full h-full break-all" value={identityCommitment}></textarea>
            </div> */}
            <button
              onClick={() => verifyAuth()}
              className="w-96 px-4 py-2 bg-[#264653] text-white rounded-xl"
            >
              Verify Email Authentication for my Identity
            </button>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
}
