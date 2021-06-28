import fs from "fs";
import path from "path";
import rlp from "rlp";
import keccak from "keccak";
const configPath = path.resolve(__dirname, "../contracts.json");

export const getContractAddressFromNonce = async (signer, nonce) => {
  const rlpEncoded = rlp.encode([signer.address.toString(), nonce]);
  const longContractAddress = keccak("keccak256")
    .update(rlpEncoded)
    .digest("hex");
  return longContractAddress.substring(24);
};

export const updateContractConfig = (network, newConfig) => {
  const config = JSON.parse(fs.readFileSync(configPath).toString());
  config[network] = newConfig;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return true;
};
