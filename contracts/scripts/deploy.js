const main = async () => {
  const PoseidonContract = await ethers.getContractFactory(
    "@zk-kit/incremental-merkle-tree.sol/contracts/Hashes.sol:PoseidonT3"
  );
  const poseidonContract = await PoseidonContract.deploy();
  await poseidonContract.deployed();

  const IncrementalBinTree = await ethers.getContractFactory(
    "@zk-kit/incremental-merkle-tree.sol/contracts/IncrementalBinaryTree.sol:IncrementalBinaryTree",
    {
      libraries: {
        PoseidonT3: poseidonContract.address,
      },
    }
  );
  const incrementalBinTree = await IncrementalBinTree.deploy();
  await incrementalBinTree.deployed();

  const AuthVerifier = await ethers.getContractFactory("Auth", {
    libraries: {
      IncrementalBinaryTree: incrementalBinTree.address,
    },
  });
  const authVerifier = await AuthVerifier.deploy();
  await authVerifier.deployed();

  console.log("Smart contract deployed to:", authVerifier.address);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
