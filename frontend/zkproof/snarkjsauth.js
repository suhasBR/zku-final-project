import { exportCallDataGroth16 } from "./snarkZkproof"

export async function authCallData(input1) {
  const input = input1;
  console.log(input);

  let dataResult;

  try {
    dataResult = await exportCallDataGroth16(
      input,
      "/zkproof/auth.wasm",
      "/zkproof/circuit_final.zkey"
    );
  } catch (error) {
    console.log(error);
    window.alert("Wrong answer");
  }

  return dataResult;
}
