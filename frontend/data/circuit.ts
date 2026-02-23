export const circuitConstraints = [
  {
    id: '01',
    name: 'Leaf integrity',
    verifies: 'The 8 KYC fields (name, surname, age, address, wallet, country_code, investor_type, kyc_face) hash correctly to the tree leaf',
    reason: 'Impossible to lie about identity. Changing a single field changes the hash.',
  },
  {
    id: '02',
    name: 'Chaining leaf',
    verifies: 'leaf_inter = hash_2([leaf, salt]) then leaf_final = hash_2([leaf_inter, max_amount])',
    reason: 'The salt makes the leaf unique and unpredictable. The max_amount is cryptographically bound to the investor.',
  },
  {
    id: '03',
    name: 'Nullifier',
    verifies: 'hash_2([salt, nonce]) == nullifier (public)',
    reason: 'Each proof is single-use. The nonce increments. The contract stores used nullifiers.',
  },
  {
    id: '04',
    name: 'Sender binding',
    verifies: 'wallet == sender (sender is public)',
    reason: 'The proof is bound to msg.sender. An attacker who intercepts the proof cannot use it.',
  },
  {
    id: '05',
    name: 'Merkle climb',
    verifies: 'Climbing the tree in 4 iterations of hash_2',
    reason: 'Proves that the leaf exists in the tree of approved investors.',
  },
  {
    id: '06',
    name: 'Root match',
    verifies: 'current == merkle_root (public)',
    reason: 'The recomputed root must be identical to the one stored on-chain in Registry.sol.',
  },
  {
    id: '07',
    name: 'EU jurisdiction',
    verifies: 'country_code is in [1..27]',
    reason: 'Only EU investors are authorized (MiCA compliance).',
  },
  {
    id: '08',
    name: 'Transfer limit',
    verifies: 'transfer_amount as u64 <= max_amount as u64',
    reason: 'Each investor has a bank-defined limit set during KYC. The amount stays private.',
  },
];

export const circuitCode = `use dep::std;
use poseidon::poseidon::bn254::{hash_2, hash_8};
mod test;

// 27 EU Countries
global AUSTRIA: Field = 1;   global BELGIUM: Field = 2;
global BULGARIA: Field = 3;  global CROATIA: Field = 4;
global CYPRUS: Field = 5;    global CZECH_REPUBLIC: Field = 6;
global DENMARK: Field = 7;   global ESTONIA: Field = 8;
global FINLAND: Field = 9;   global FRANCE: Field = 10;
global GERMANY: Field = 11;  global GREECE: Field = 12;
global HUNGARY: Field = 13;  global IRELAND: Field = 14;
global ITALY: Field = 15;    global LATVIA: Field = 16;
// ... LITHUANIA=17, LUXEMBOURG=18, MALTA=19, NETHERLANDS=20
// ... POLAND=21, PORTUGAL=22, ROMANIA=23, SLOVAKIA=24
// ... SLOVENIA=25, SPAIN=26, SWEDEN=27

global QUALIFIED: Field = 1;
global RETAIL: Field = 2;
global TREE_DEPTH: u32 = 4;

fn main(
    // PRIVATE WITNESS — nobody sees these
    name: Field, surname: Field, age: Field, address: Field,
    wallet: Field, country_code: Field, kyc_face: Field,
    investor_type: Field, max_amount: Field,
    nonce: Field, salt: Field,
    merkle_path: [Field; TREE_DEPTH],
    path_indices: [Field; TREE_DEPTH],
    // PUBLIC INPUTS — smart contract sees these
    merkle_root: pub Field,
    nullifier: pub Field,
    recipient: pub Field,
    sender: pub Field,
    transfer_amount: pub Field,
) {
    // 1+2. LEAF INTEGRITY + CHAINING
    let leaf = hash_8([name, surname, age, address,
        wallet, country_code, investor_type, kyc_face]);
    let leaf_inter = hash_2([leaf, salt]);
    let leaf_final = hash_2([leaf_inter, max_amount]);

    // 3. NULLIFIER — anti-replay
    let computed = hash_2([salt, nonce]);
    assert(nullifier == computed, "InvalidNullifier");

    // 4. SENDER BINDING
    assert(wallet == sender, "UnauthorizedSender");

    // 5+6. MERKLE CLIMB + ROOT MATCH
    let mut current = leaf_final;
    for i in 0..4 {
        let path_element = merkle_path[i];
        let index = path_indices[i];
        assert((index == 0) | (index == 1));
        let (left, right) = if index == 0 {
            (current, path_element)
        } else {
            (path_element, current)
        };
        current = hash_2([left, right]);
    };
    assert(current == merkle_root);

    // 7. EU JURISDICTION CHECK
    let mut allowed_countries: [Field; 27] = [0; 27];
    for i in 0..27 { allowed_countries[i] = (i + 1) as Field; }
    let mut country_valid = false;
    for i in 0..27 {
        if country_code == allowed_countries[i] { country_valid = true; }
    };
    assert(country_valid, "InvalidCountryCode");

    // 8. INVESTOR TYPE + TRANSFER LIMIT
    assert((investor_type == QUALIFIED) | (investor_type == RETAIL),
        "InvalidInvestorType");
    assert(transfer_amount as u64 <= max_amount as u64,
        "AllocationLimitExceeded");
}`;

export const circuitCallout = {
  type: 'info' as const,
  title: 'Public inputs = what the smart contract sees',
  text: 'Index 0: merkle_root, Index 1: nullifier, Index 2: recipient, Index 3: sender, Index 4: transfer_amount. Modifying a single public input invalidates the proof. This is the mathematical link between the circuit and the contract.',
};
