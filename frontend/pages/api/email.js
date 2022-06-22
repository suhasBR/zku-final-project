// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const { subtle, getRandomValues } = require('crypto').webcrypto;
const ethers = require("ethers");
const {buildPoseidon} = require("circomlibjs");
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  const {email} = req.body;
  console.log(email);

  //create a random number
  const array = new Uint32Array(1); 
  const iv = getRandomValues(array);
  console.log(iv[0]);
  const rand_num = iv[0];

  //hash the random number
  const poseidon = await buildPoseidon()
  const hashed = ethers.BigNumber.from(poseidon.F.toString(poseidon([rand_num]))).toBigInt();
  const hashed_string = hashed.toString();

  console.log(hashed_string);

  //send the random number over email using nodemailer
  sendEmail(hashed_string);

  res.status(200).json(hashed_string);
}

const sendEmail = (data) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '********',
      pass: '*******'
    }
  });
  
  var mailOptions = {
    from: '************',
    to: '*********',
    subject: 'Authentication String for your Email Verification',
    text: data
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
