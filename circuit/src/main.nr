use dep::std;
use poseidon::poseidon::bn254::{hash_2, hash_8};

global AUSTRIA: Field = 1;
global BELGIUM: Field = 2;
global BULGARIA: Field = 3;
global CROATIA: Field = 4;
global CYPRUS: Field = 5;
global CZECH_REPUBLIC: Field = 6;
global DENMARK: Field = 7;
global ESTONIA: Field = 8;
global FINLAND: Field = 9;
global FRANCE: Field = 10;
global GERMANY: Field = 11;
global GREECE: Field = 12;
global HUNGARY: Field = 13;
global IRELAND: Field = 14;
global ITALY: Field = 15;
global LATVIA: Field = 16;
global LITHUANIA: Field = 17;
global LUXEMBOURG: Field = 18;
global MALTA: Field = 19;
global NETHERLANDS: Field = 20;
global POLAND: Field = 21;
global PORTUGAL: Field = 22;
global ROMANIA: Field = 23;
global SLOVAKIA: Field = 24;
global SLOVENIA: Field = 25;
global SPAIN: Field = 26;
global SWEDEN: Field = 27;

global QUALIFIED: Field = 1;
global RETAIL: Field = 2;

global TREE_DEPTH: u32 = 4;
global NUM_ALLOWED_COUNTRY: u32 = 27;

fn main ( 
    name: Field, 
    surname: Field,
    age: Field,
    address: Field, 
    wallet: Field,
    country_code: Field,
    investor_type: Field, 
    salt: Field, 
    merkle_path: [Field; TREE_DEPTH], 
    path_indices: [Field; TREE_DEPTH], 
    nonce: Field,
    sender: pub Field,
    merkle_root: pub Field,
    max_amount: pub Field,
    nullifier: pub Field,
    transfer_amount: pub Field,
    recipient: pub Field,
)
{
  let leaf = hash_8([name, surname, age, address, wallet, country_code, investor_type, salt)]);
  let leaf_final = hash_2([leaft, max_amount]);
  let computed = hash_2([salt, nonce]);

  assert(nullifier == computed);

  assert(wallet == sender);

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

  let mut allowed_countries: [Field; 27] = [0;27];
  for i in 0..27 {
    allowed_countries[i] = (i + 1) as Field;
  }

  let mut country_valid = false;
  for i in 0..27 {
    if country_code == allowed_countries[i] {
      country_valid = true;
      }
  };

  assert(country_valid);

  assert(investor_type == QUALIFIED | investor_type == RETAIL);

  let amount = transfer_amount;
  let max = max_amount;
  assert(amount <= max as u64);

}



