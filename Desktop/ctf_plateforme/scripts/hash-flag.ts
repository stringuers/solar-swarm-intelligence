import bcrypt from 'bcrypt';

const flag = process.argv[2];
if (!flag) {
  console.error('Please provide a flag as an argument');
  process.exit(1);
}

bcrypt.hash(flag, 10).then((hashedFlag) => {
  console.log('Hashed flag:', hashedFlag);
}); 