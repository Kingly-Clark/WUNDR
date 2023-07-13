function getContractFunctions() {
  const artifact = require("../artifacts/contracts/Wunder.sol/Wunder.json");

  const abi = artifact.abi;
  // console.log(`ABI: ${JSON.stringify(abi, null, 2)}`)

  console.log("Public and External Functions:");
  abi.forEach((element) => {
    // console.log(`Element: ${JSON.stringify(element, null, 2)}`)
    if (
      element.type === "function" &&
      element.stateMutability !== "view" &&
      element.stateMutability !== "pure"
    ) {
      // create a string that looks like a function definition for a markdown table
      let prettyFunction = `${element.name}(${element.inputs
        .map((input) => `${input.type} ${input.name}`)
        .join(", ")})`;
      prettyFunction +=
        element.outputs.length > 0
          ? ` returns (${element.outputs
              .map((output) => `${output.type} ${output.name}`)
              .join(", ")})`
          : "";
      console.log(prettyFunction);
    }
  });
}

getContractFunctions();
