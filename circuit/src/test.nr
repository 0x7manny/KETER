use crate::main;
use dep::std;
use poseidon::poseidon::bn254::{hash_2, hash_8};


fn get_root() -> (Field, Field, Field, Field, Field, Field, Field, Field, Field, Field, Field, Field, Field, Field, Field, Field, Field) {
    let name = 0x4a6f686e;
    let surname = 0x446f65;
    let age = 18;
    let address = 0x70617269732c203137617272;
    let wallet = 0x6d5e982A63B9E4055B7b7CfBAC25ba908061e1A5;
    let country_code = 10;
    let investor_type = 1;
    let kyc_face = 1;
    let salt = 0xd1359c703c1d7a1d1429f96f40b;
    let max_amount = 1000000;
    let nonce = 1;

    let leaf = hash_8([name, surname, age, address, wallet, country_code, investor_type, kyc_face]);
    let leaf_inter = hash_2([leaf, salt]);
    let leaf_final = hash_2([leaf_inter, max_amount]);

    let zero = 0;
    let sibling_0 = zero;
    let sibling_1 = hash_2([zero, zero]);
    let sibling_2 = hash_2([hash_2([zero, zero]), hash_2([zero, zero])]);
    let sibling_3 = hash_2([
        hash_2([hash_2([zero, zero]), hash_2([zero, zero])]),
        hash_2([hash_2([zero, zero]), hash_2([zero, zero])])
    ]);
    let level0 = hash_2([leaf_final, sibling_0]);
    let level1 = hash_2([level0, sibling_1]);
    let level2 = hash_2([level1, sibling_2]);
    let root = hash_2([level2, sibling_3]);
    let nullifier = hash_2([salt, nonce]);
    (name, surname, age, address, wallet, country_code, investor_type, kyc_face, salt, max_amount, nonce, sibling_0, sibling_1, sibling_2, sibling_3, root, nullifier)
}

#[test]
fn test_main() {
    let (name, surname, age, address, wallet, country_code, investor_type, kyc_face, salt, max_amount, nonce, s0, s1, s2, s3, root, nullifier) = get_root();

    main(
        name,
        surname,
        age,
        address,
        wallet,
        country_code,
        kyc_face,
        investor_type,
        max_amount,
        nonce,
        salt,
        [s0, s1, s2, s3],
        [0, 0, 0, 0],
        root,
        nullifier,
        0xABCDEF,
        wallet,
        500000
    );
}

#[test(should_fail)]
fn test_country_not_exist() {
    let (name, surname, age, address, wallet, _, investor_type, kyc_face, salt, max_amount, nonce, s0, s1, s2, s3, root, nullifier) = get_root();

    main(
        name,
        surname,
        age,
        address,
        wallet,
        56,
        kyc_face,
        investor_type,
        max_amount,
        nonce,
        salt,
        [s0, s1, s2, s3],
        [0, 0, 0, 0],
        root,
        nullifier,
        0xABCDEF,
        wallet,
        500000
    );
}

#[test(should_fail)]
fn test_country_zero() {
    let (name, surname, age, address, wallet, _, investor_type, kyc_face, salt, max_amount, nonce, s0, s1, s2, s3, root, nullifier) = get_root();

    main(
        name,
        surname,
        age,
        address,
        wallet,
        0,
        kyc_face,
        investor_type,
        max_amount,
        nonce,
        salt,
        [s0, s1, s2, s3],
        [0, 0, 0, 0],
        root,
        nullifier,
        0xABCDEF,
        wallet,
        500000
    );
}

#[test(should_fail)]
fn test_investor_invalid() {
  let (name, surname, age, address, wallet, country_code, _, kyc_face, salt, max_amount, nonce, s0, s1, s2, s3, root, nullifier) = get_root();
  main(
      name,
      surname,
      age,
      address,
      wallet,
      country_code,
      kyc_face,
      3,
      max_amount,
      nonce,
      salt,
      [s0, s1, s2, s3],
      [0, 0, 0, 0],
      root,
      nullifier,
      0xABCDEF,
      wallet,
      500000
      );
}

