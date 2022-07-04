const { expect } = require("chai");
const { ethers } = require("hardhat");
const { exportCallDataGroth16 } = require("./utils/utils");

describe("authtest", function () {
  let AuthVerifier, authVerifier;
  let IncrementalBinTree, incrementalBinTree;
  let PoseidonContract, poseidonContract;

  before(async function () {
    PoseidonContract = await ethers.getContractFactory(
      "@zk-kit/incremental-merkle-tree.sol/contracts/Hashes.sol:PoseidonT3"
    );
    poseidonContract = await PoseidonContract.deploy();
    await poseidonContract.deployed();

    IncrementalBinTree = await ethers.getContractFactory(
      "@zk-kit/incremental-merkle-tree.sol/contracts/IncrementalBinaryTree.sol:IncrementalBinaryTree",
      {
        libraries: {
          PoseidonT3: poseidonContract.address,
        },
      }
    );
    incrementalBinTree = await IncrementalBinTree.deploy();
    await incrementalBinTree.deployed();

    AuthVerifier = await ethers.getContractFactory("Auth", {
      libraries: {
        IncrementalBinaryTree: incrementalBinTree.address,
      },
    });
    authVerifier = await AuthVerifier.deploy();
    await authVerifier.deployed();
  });

  it("verify auth by comparing hash on chain hash", async function () {
    const pubKey = "0x3700f98aF82db92D35e5fD4Ddd046aFC5b1bfCfE";
    const phaseOneHash =
      "672758258447934848663708598424578457239635911397026697181536792015367112822";
    //commit public hash
    let res = await authVerifier.commitHash(pubKey, phaseOneHash);

    //get public hash
    let res1 = await authVerifier.getPubHash(pubKey);

    const pubHash =
      "672758258447934848663708598424578457239635911397026697181536792015367112822";
    const groupId = "1729";
    const secret = "12345";
    const rString = "98765";

    const input = { pubHash, pubKey, groupId, secret, rString };

    //create group with group id 1
    let res2 = await authVerifier.createGroup(
      "gmail",
      groupId,
      4,
      0,
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );

    let data = await exportCallDataGroth16(
      input,
      "./zkp/auth.wasm",
      "./zkp/circuit_final.zkey"
    );

    let result = await authVerifier.verifyHash(
      data.a,
      data.b,
      data.c,
      data.Input,
      pubKey,
      "4567"
    );

    let result2 = await authVerifier.isAuthenticated("4567");

    expect(result2).to.equal(groupId);
  });

  it("should revert transaction due to incorrect on chain hash", async function () {
    const pubKey = "0x3700f98aF82db92D35e5fD4Ddd046aFC5b1bfCfE";
    const phaseOneHash =
      "2360977611523953290180694156672764012759410829553614245335566789646006469756";
    //commit public hash
    let res = await authVerifier.commitHash(pubKey, phaseOneHash);

    //get public hash
    let res1 = await authVerifier.getPubHash(pubKey);

    const pubHash =
      "6422172672648462772014687573073254026092880325388402248562441455842661259848";
    const groupId = "111";
    const secret = "12345";
    const rString = "34567";

    const input = { pubHash, pubKey, groupId, secret, rString };

    //create group with group id 1
    let res2 = await authVerifier.createGroup(
      "gmail",
      groupId,
      4,
      0,
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );

    let data = await exportCallDataGroth16(
      input,
      "./zkp/auth.wasm",
      "./zkp/circuit_final.zkey"
    );

    let result = await authVerifier.verifyHash(
      data.a,
      data.b,
      data.c,
      data.Input,
      pubKey,
      "4567"
    );

    let result2 = await authVerifier.isAuthenticated("4567");

    expect(result2).to.be.reverted;
  });


  it("should fail auth test", async function(){
      const pubHash = '3572713155681323789438913994065456644420707158212740033489761108462149416484';
      const pubKey = "0xA299DE74e1Bfb116Edb1813351A5e8ba9E1E7f86";
      const secret = '98765';
      const rString = '12345';
      const groupId = "111";

      const input = {pubHash, pubKey, groupId, secret, rString};

      let data = await exportCallDataGroth16(
          input,
          "./zkp/auth.wasm",
          "./zkp/circuit_final.zkey"
      );

      let result = await authVerifier.verifyProof(
          data.a,
          data.b,
          data.c,
          data.Input
      );

      expect(result).to.be.reverted;
  });
});
