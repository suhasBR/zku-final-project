const {expect} = require("chai");
const {ethers} = require("hardhat");
const {exportCallDataGroth16} = require("./utils/utils");

describe("authtest", function(){
    let AuthVerifier, authVerifier;

    before(async function(){
        AuthVerifier = await ethers.getContractFactory("Verifier");
        authVerifier = await AuthVerifier.deploy();
        await authVerifier.deployed();
    });

    it("should pass auth test", async function(){
        const pubHash = '19620391833206800292073497099357851348339828238212863168390691880932172496143';
        const secret = '123';
        const rString = '456';

        const input = {pubHash, secret, rString};

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

        expect(result).to.equal(true);
    });

    it("should fail auth test", async function(){
        const pubHash = '123';
        const secret = '123';
        const rString = '456';

        const input = {pubHash, secret, rString};

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

        expect(result).to.equal(false);
    });

    


})