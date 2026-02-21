use dep::std;
use poseidon::poseidon::bn254::{hash_2, hash_8};

global TREE_DEPTH: u32 = 16;
global NUM_ALLOWED_COUNTRY: u32 = 27;

fn main( 
    name: Field, 
    surname: Field,
    age: Field,
    address: Field, 
    wallet: Field,
    country_code: Field,
    investor_type: Field, 
    salt: Field, 
    merkle_path: [Field; 16], 
    path_indices: [Field; 16], 
    merkle_root: pub Field 
)
{
  let leaf = hash_8([name, surname, age, address, wallet, country_code, investor_type, salt]);

  let mut current = leaf;
  for i in 0..16 {
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
    allowed_countries[i] = i as Field;
  }

  let mut country_valid = false;
  for i in 0..27 {
    if country_code == allowed_countries[i] {
      country_valid = true;
      }
  };

  assert(country_valid);
  assert(investor_type == 1);
}
