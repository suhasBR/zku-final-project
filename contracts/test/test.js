const {expect} = require("chai");
const {ethers} = require("hardhat");
const {exportCallDataGroth16} = require("./utils/utils");

describe("authtest", function(){
    let AuthVerifier, authVerifier;

    before(async function(){
        AuthVerifier = await ethers.getContractFactory("Auth");
        authVerifier = await AuthVerifier.deploy();
        await authVerifier.deployed();
    });

    it("basic auth verification test", async function(){
        const pubHash = '7456496290823021281081032811052666664496510297601767980302286514100278878013';
        const pubKey = "0xA299DE74e1Bfb116Edb1813351A5e8ba9E1E7f86";
        const secret = '12345';
        const rString = '98765';

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
            data.Input,
        );

        expect(result).to.equal(true);
    });

    it("Should pass verify auth by comparing on chain hash", async function(){
        const pubKey = "0xA299DE74e1Bfb116Edb1813351A5e8ba9E1E7f86";
        const phaseOneHash = '7456496290823021281081032811052666664496510297601767980302286514100278878013';
        //commit public hash
        let res = await authVerifier.commitHash(pubKey,phaseOneHash);

        //get public hash
        let res1 = await authVerifier.getPubHash(pubKey) ;
        console.log(res1);

        const pubHash = '7456496290823021281081032811052666664496510297601767980302286514100278878013';

        const secret = '12345';
        const rString = '98765';

        const input = {pubHash, pubKey, secret, rString};


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

        expect(result2).to.equal(true);
    });

    it("Should fail verify auth by comparing on chain hash", async function(){
        const pubKey = "0xA299DE74e1Bfb116Edb1813351A5e8ba9E1E7f86";
        const phaseOneHash = '7456496290823021281081032811052666664496510297601767980302286514100278878015';
        //commit public hash
        let res = await authVerifier.commitHash(pubKey,phaseOneHash);

        //get public hash
        let res1 = await authVerifier.getPubHash(pubKey) ;
        console.log(res1);

        const pubHash = '7456496290823021281081032811052666664496510297601767980302286514100278878013';

        const secret = '12345';
        const rString = '98765';

        const input = {pubHash, pubKey, secret, rString};


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

        expect(result2).to.be.revertedWith("public hash stored does not match");
    });


    it("should fail auth test", async function(){
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

        expect(result).to.be.revertedWith("Assert Failed");
    });

    


})