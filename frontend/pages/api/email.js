// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const crypto = require("crypto");
const ethers = require("ethers");
const { buildPoseidon } = require("circomlibjs");
const nodemailer = require("nodemailer");
const myAbi = require("./abi.json");

export default async function handler(req, res) {
  const { groupId, email, intHash, addr } = req.body;
  console.log(req.body);

  //create a random number
  const val = crypto.webcrypto;
  const array = new Uint32Array(1);
  const iv = val.getRandomValues(array);
  const rand_num = iv[0];
  console.log(rand_num);

  //check if groupdId and email domain match
  let expectedGroupId = await checkMapping(email.split("@")[1]);
  console.log(expectedGroupId);
  expectedGroupId = ethers.BigNumber.from(expectedGroupId).toNumber();
  if (groupId!== expectedGroupId.toString()) {
    return res.status(401).json("Invalid Group ID");
  }

  //hash the intermediate hash with random number to produce final hash
  const poseidon = await buildPoseidon();
  const hashed = ethers.BigNumber.from(
    poseidon.F.toString(poseidon([intHash, rand_num]))
  ).toBigInt();
  const hashed_string = hashed.toString();

  //send the random number over email using nodemailer
  sendEmail(email, rand_num);

  //store final hash on chain
  store_hash(addr, hashed_string);

  //return the final hash
  res.status(200).json(hashed_string);
}

const sendEmail = (email_addr, data) => {
  console.log(email_addr, data);
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "info.zkemailauth@gmail.com",
      pass: process.env.eps,
    },
  });

  send();

  async function send() {
    const result = await transporter.sendMail({
      from: "info.zkemailauth@gmail.com",
      to: email_addr,
      subject: "Authentication String for your Email Verification",
      text: `Enter this string in Phase 2 authentication to confirm email for your anonymous identity - ${data}`,
    });

    console.log(JSON.stringify(result, null, 4));
  }

  // var mailOptions = {
  //   from: "info.zkemailauth@gmail.com",
  //   to: email_addr,
  //   subject: "Authentication String for your Email Verification",
  //   text: `Enter this string in Phase 2 authentication to confirm email for your anonymous identity - `+data,
  // };

  // transporter.sendMail(mailOptions, function (error, info) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log("Email sent: " + info.response);
  //   }
  // });
};

const store_hash = async (addr, hashed_string) => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://api.s0.ps.hmny.io"
  );
  const privateKey = process.env.devAccKey;

  const signer = new ethers.Wallet(privateKey, provider);
  const address = "0x2523169938300dd5ECB5486fd3D6716b90e0c692";

  const myContract_write = new ethers.Contract(address, myAbi.abi, signer);

  //commit hash on chain
  myContract_write
    .commitHash(addr, hashed_string)
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
};

const checkMapping = async (domain) => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://api.s0.ps.hmny.io"
  );
  const privateKey = process.env.devAccKey;

  const signer = new ethers.Wallet(privateKey, provider);
  const address = "0x2523169938300dd5ECB5486fd3D6716b90e0c692";

  const myContract_read = new ethers.Contract(address, myAbi.abi, signer);

  try {
    let res = await myContract_read.domainLookUp(domain);
    res = ethers.BigNumber.from(res).toNumber();

    return res;
  } catch (error) {
    console.log(error);
  }
};
