// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {KeterToken} from "../src/KeterToken.sol";
import {Registry} from "../src/Registry.sol";
import {HonkVerifier as UltraVerifier} from "../src/UltraVerifier.sol";

contract DeployKeter is Script {
    function run() external {
        // Supports both: --private-key flag OR PRIVATE_KEY env var
        vm.startBroadcast();

        // 1. Registry
        Registry registry = new Registry();
        console.log("Registry:       ", address(registry));

        // 2. UltraVerifier (constants baked in via inheritance)
        UltraVerifier verifier = new UltraVerifier();
        console.log("UltraVerifier:  ", address(verifier));

        // 3. KeterToken
        address[] memory controllers = new address[](0);

        bytes32[] memory defaultPartitions = new bytes32[](3);
        defaultPartitions[0] = bytes32(0);                  // DEFAULT
        defaultPartitions[1] = bytes32("founders");
        defaultPartitions[2] = bytes32("investors");

        KeterToken token = new KeterToken(
            "Keter Security Token",
            "KETER",
            address(registry),
            address(verifier),
            controllers,
            defaultPartitions
        );
        console.log("KeterToken:     ", address(token));

        // 4. Attach docs
        token.setDocument(
            bytes32("prospectus"),
            "https://keter.finance/docs/prospectus-v1.pdf",
            keccak256("prospectus-v1")
        );
        token.setDocument(
            bytes32("terms"),
            "https://keter.finance/docs/terms-v1.pdf",
            keccak256("terms-v1")
        );

        vm.stopBroadcast();

        console.log("");
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("Deployer = issuer = admin");
        console.log("Default partitions: [DEFAULT, founders, investors]");
        console.log("Documents: [prospectus, terms]");
    }
}
