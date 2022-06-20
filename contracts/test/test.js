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
        const pubHash = '3572713155681323789438913994065456644420707158212740033489761108462149416484';
        const pubKey = "0xA299DE74e1Bfb116Edb1813351A5e8ba9E1E7f86";
        const secret = '98765';
        const rString = '12345';

        const input = {pubHash, pubKey, secret, rString};

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
        const pubHash = '3572713155681323789438913994065456644420707158212740033489761108462149416484';
        const pubKey = "0xA299DE74e1Bfb116Edb1813351A5e8ba9E1E7f86";
        const secret = '98765';
        const rString = '12344';

        const input = {pubHash, pubKey, secret, rString};

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