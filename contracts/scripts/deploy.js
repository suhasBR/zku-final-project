
const main = async() => {
    const AuthVerifier = await ethers.getContractFactory("Verifier");
    const authVerifier = await AuthVerifier.deploy();

    await authVerifier.deployed();

    console.log("Smart contract deployed to:", authVerifier.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });